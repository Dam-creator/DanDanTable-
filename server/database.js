// database.js - 简单JSON文件存储（无需编译，稳定可靠）
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据文件路径
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const userDataFile = path.join(dataDir, 'user_data.json');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
function initDataFile(file, defaultContent) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultContent, null, 2));
  }
}

initDataFile(usersFile, { users: [], nextId: 1 });
initDataFile(userDataFile, {});

// 新增6个功能的数据文件
initDataFile(path.join(dataDir, 'schedule.json'), {});
initDataFile(path.join(dataDir, 'tasks.json'), {});
initDataFile(path.join(dataDir, 'focus_sessions.json'), {});
initDataFile(path.join(dataDir, 'focus_settings.json'), {});
initDataFile(path.join(dataDir, 'goals.json'), {});
initDataFile(path.join(dataDir, 'stress_history.json'), {});
initDataFile(path.join(dataDir, 'budgets.json'), {});

// 读取JSON文件
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('读取文件错误:', file, err.message);
    return null;
  }
}

// 写入JSON文件
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ===== 通用集合操作 =====
function getCollection(name, userId) {
  const file = path.join(dataDir, `${name}.json`);
  const data = readJSON(file) || {};
  return data[userId] || [];
}

function saveCollection(name, userId, collection) {
  const file = path.join(dataDir, `${name}.json`);
  const data = readJSON(file) || {};
  data[userId] = collection;
  writeJSON(file, data);
}

function findById(name, userId, id) {
  const collection = getCollection(name, userId);
  return collection.find(item => item.id === id) || null;
}

function insert(name, userId, item) {
  const collection = getCollection(name, userId);
  collection.push(item);
  saveCollection(name, userId, collection);
  return item;
}

function update(name, userId, id, updates) {
  const collection = getCollection(name, userId);
  const idx = collection.findIndex(item => item.id === id);
  if (idx === -1) return null;
  collection[idx] = { ...collection[idx], ...updates };
  saveCollection(name, userId, collection);
  return collection[idx];
}

function remove(name, userId, id) {
  const collection = getCollection(name, userId);
  const filtered = collection.filter(item => item.id !== id);
  if (filtered.length === collection.length) return false;
  saveCollection(name, userId, filtered);
  return true;
}

function getSubCollection(name, userId, parentId, subName) {
  const parent = findById(name, userId, parentId);
  if (!parent) return [];
  return parent[subName] || [];
}

function saveSubCollection(name, userId, parentId, subName, subCollection) {
  const collection = getCollection(name, userId);
  const idx = collection.findIndex(item => item.id === parentId);
  if (idx === -1) return false;
  collection[idx][subName] = subCollection;
  saveCollection(name, userId, collection);
  return true;
}

// 初始化数据库
function initDatabase() {
  console.log('✓ 数据存储初始化完成（JSON文件存储）');
  console.log(`  用户数据文件: ${usersFile}`);
  console.log(`  同步数据文件: ${userDataFile}`);
  console.log(`  新增: 课程表/任务/专注/目标/压力/预算 数据文件`);
}

// 用户相关操作
const userOps = {
  // 创建用户
  create(username, passwordHash, nickname) {
    const usersData = readJSON(usersFile);
    const id = usersData.nextId++;
    const user = {
      id,
      username,
      password_hash: passwordHash,
      nickname: nickname || username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    usersData.users.push(user);
    writeJSON(usersFile, usersData);

    // 为新用户创建数据记录
    const allUserData = readJSON(userDataFile);
    allUserData[id] = { data: {}, updated_at: new Date().toISOString() };
    writeJSON(userDataFile, allUserData);

    return id;
  },

  // 根据用户名查找用户
  findByUsername(username) {
    const usersData = readJSON(usersFile);
    return usersData.users.find(u => u.username === username) || null;
  },

  // 根据ID查找用户
  findById(id) {
    const usersData = readJSON(usersFile);
    const user = usersData.users.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      created_at: user.created_at
    };
  },

  // 更新用户信息
  update(id, nickname) {
    const usersData = readJSON(usersFile);
    const user = usersData.users.find(u => u.id === id);
    if (user) {
      user.nickname = nickname;
      user.updated_at = new Date().toISOString();
      writeJSON(usersFile, usersData);
    }
    return { changes: user ? 1 : 0 };
  }
};

// 数据同步相关操作
const dataOps = {
  // 获取用户数据
  get(userId) {
    const allUserData = readJSON(userDataFile);
    const record = allUserData[userId];
    if (!record) return null;
    return {
      data: JSON.stringify(record.data),
      updated_at: record.updated_at
    };
  },

  // 更新用户数据（全量覆盖）
  update(userId, data) {
    const allUserData = readJSON(userDataFile);
    allUserData[userId] = {
      data: data,
      updated_at: new Date().toISOString()
    };
    writeJSON(userDataFile, allUserData);
    return { changes: 1 };
  }
};

module.exports = {
  initDatabase,
  userOps,
  dataOps,
  getCollection,
  saveCollection,
  findById,
  insert,
  update,
  remove,
  getSubCollection,
  saveSubCollection
};
