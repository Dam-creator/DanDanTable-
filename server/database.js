// database.js — DanDanTable 持久层
// 双后端：配置了 DATABASE_URL（Neon Postgres 等）时使用 Postgres；
// 否则回退到本地 JSON 文件（便于本地开发/测试）。对外统一为 async 接口。
const fs = require('fs');
const path = require('path');

const USE_PG = !!process.env.DATABASE_URL;
let pool = null;
if (USE_PG) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon / 云 PG 普遍要求 SSL
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
  });
}

// ============================================================
//  Postgres 实现
// ============================================================
async function pgInit() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS user_data (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS collections (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, name)
  )`);
}

const pgStore = {
  async init() {
    // Neon 冷启动可能需要重试
    let lastErr;
    for (let i = 0; i < 3; i++) {
      try { await pgInit(); console.log('✓ 数据库初始化完成（Postgres：Neon）'); return; }
      catch (e) { lastErr = e; console.warn('数据库初始化重试', i + 1, e.message); await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
    }
    throw lastErr;
  },
  userOps: {
    async create(username, passwordHash, nickname) {
      const r = await pool.query(
        'INSERT INTO users(username, password_hash, nickname) VALUES($1,$2,$3) RETURNING id',
        [username, passwordHash, nickname || username]
      );
      const id = r.rows[0].id;
      await pool.query(
        'INSERT INTO user_data(user_id, payload) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [id, JSON.stringify({})]
      );
      return id;
    },
    async findByUsername(username) {
      const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
      return r.rows[0] || null;
    },
    async findById(id) {
      const r = await pool.query('SELECT id, username, nickname, created_at FROM users WHERE id=$1', [id]);
      return r.rows[0] || null;
    },
    async update(id, nickname) {
      const r = await pool.query('UPDATE users SET nickname=$2, updated_at=now() WHERE id=$1', [id, nickname]);
      return { changes: r.rowCount };
    }
  },
  dataOps: {
    async get(userId) {
      const r = await pool.query('SELECT payload, updated_at FROM user_data WHERE user_id=$1', [userId]);
      if (!r.rows.length) return null;
      const row = r.rows[0];
      return { data: JSON.stringify(row.payload), updated_at: row.updated_at };
    },
    async update(userId, data) {
      await pool.query(
        `INSERT INTO user_data(user_id, payload, updated_at) VALUES($1,$2,now())
         ON CONFLICT (user_id) DO UPDATE SET payload=$2, updated_at=now()`,
        [userId, JSON.stringify(data)]
      );
      return { changes: 1 };
    }
  },
  async getCollection(name, userId) {
    const r = await pool.query('SELECT items FROM collections WHERE user_id=$1 AND name=$2', [userId, name]);
    if (!r.rows.length) return [];
    return r.rows[0].items || [];
  },
  async saveCollection(name, userId, items) {
    await pool.query(
      `INSERT INTO collections(user_id, name, items, updated_at) VALUES($1,$2,$3,now())
       ON CONFLICT (user_id, name) DO UPDATE SET items=$3, updated_at=now()`,
      [userId, name, JSON.stringify(items)]
    );
  }
};

// ============================================================
//  JSON 文件实现（本地回退）
// ============================================================
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const userDataFile = path.join(dataDir, 'user_data.json');

function ensureFile(file, def) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(def, null, 2));
}
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch (e) { console.error('读取文件错误:', file, e.message); return null; }
}
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

const fileStore = {
  async init() {
    ensureFile(usersFile, { users: [], nextId: 1 });
    ensureFile(userDataFile, {});
    ['schedule', 'tasks', 'focus_sessions', 'focus_settings', 'goals', 'stress_history', 'budgets', 'transactions']
      .forEach(n => ensureFile(path.join(dataDir, n + '.json'), {}));
    console.log('✓ 数据存储初始化完成（本地 JSON 文件，重启不丢；生产请配置 DATABASE_URL）');
  },
  userOps: {
    async create(username, passwordHash, nickname) {
      const usersData = readJSON(usersFile);
      const id = usersData.nextId++;
      usersData.users.push({ id, username, password_hash: passwordHash, nickname: nickname || username, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      writeJSON(usersFile, usersData);
      const all = readJSON(userDataFile);
      all[id] = { data: {}, updated_at: new Date().toISOString() };
      writeJSON(userDataFile, all);
      return id;
    },
    async findByUsername(username) {
      return readJSON(usersFile).users.find(u => u.username === username) || null;
    },
    async findById(id) {
      const u = readJSON(usersFile).users.find(x => x.id === id);
      return u ? { id: u.id, username: u.username, nickname: u.nickname, created_at: u.created_at } : null;
    },
    async update(id, nickname) {
      const usersData = readJSON(usersFile);
      const u = usersData.users.find(x => x.id === id);
      if (u) { u.nickname = nickname; u.updated_at = new Date().toISOString(); writeJSON(usersFile, usersData); }
      return { changes: u ? 1 : 0 };
    }
  },
  dataOps: {
    async get(userId) {
      const all = readJSON(userDataFile);
      const rec = all[userId];
      if (!rec) return null;
      return { data: JSON.stringify(rec.data), updated_at: rec.updated_at };
    },
    async update(userId, data) {
      const all = readJSON(userDataFile);
      all[userId] = { data, updated_at: new Date().toISOString() };
      writeJSON(userDataFile, all);
      return { changes: 1 };
    }
  },
  async getCollection(name, userId) {
    const file = path.join(dataDir, name + '.json');
    ensureFile(file, {});
    const data = readJSON(file) || {};
    return data[userId] || [];
  },
  async saveCollection(name, userId, items) {
    const file = path.join(dataDir, name + '.json');
    ensureFile(file, {});
    const data = readJSON(file) || {};
    data[userId] = items;
    writeJSON(file, data);
  }
};

const store = USE_PG ? pgStore : fileStore;

// ============================================================
//  通用集合 CRUD（两种后端共用，基于 get/saveCollection）
// ============================================================
async function getCollection(name, userId) { return store.getCollection(name, userId); }
async function saveCollection(name, userId, items) { return store.saveCollection(name, userId, items); }

async function findById(name, userId, id) {
  const col = await getCollection(name, userId);
  return col.find(item => item.id === id) || null;
}
async function insert(name, userId, item) {
  const col = await getCollection(name, userId);
  col.push(item);
  await saveCollection(name, userId, col);
  return item;
}
async function update(name, userId, id, updates) {
  const col = await getCollection(name, userId);
  const idx = col.findIndex(item => item.id === id);
  if (idx === -1) return null;
  col[idx] = { ...col[idx], ...updates };
  await saveCollection(name, userId, col);
  return col[idx];
}
async function remove(name, userId, id) {
  const col = await getCollection(name, userId);
  const filtered = col.filter(item => item.id !== id);
  if (filtered.length === col.length) return false;
  await saveCollection(name, userId, filtered);
  return true;
}
async function getSubCollection(name, userId, parentId, subName) {
  const parent = await findById(name, userId, parentId);
  return parent ? (parent[subName] || []) : [];
}
async function saveSubCollection(name, userId, parentId, subName, subCollection) {
  const col = await getCollection(name, userId);
  const idx = col.findIndex(item => item.id === parentId);
  if (idx === -1) return false;
  col[idx][subName] = subCollection;
  await saveCollection(name, userId, col);
  return true;
}

module.exports = {
  initDatabase: store.init,
  USE_PG,
  userOps: store.userOps,
  dataOps: store.dataOps,
  getCollection,
  saveCollection,
  findById,
  insert,
  update,
  remove,
  getSubCollection,
  saveSubCollection
};
