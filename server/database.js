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

// 初始化数据库
function initDatabase() {
  console.log('✓ 数据存储初始化完成（JSON文件存储）');
  console.log(`  用户数据文件: ${usersFile}`);
  console.log(`  同步数据文件: ${userDataFile}`);
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
  dataOps
};
