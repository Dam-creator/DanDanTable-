// index.js - DanDanTable 后端API主入口
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { initDatabase, userOps, dataOps } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// JWT密钥（生产环境请使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'dandantable-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 初始化数据库
initDatabase();

// ===== 认证中间件 =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' });
  }
}

// ===== API路由 =====

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DanDanTable API 运行正常', timestamp: new Date().toISOString() });
});

// 用户注册
app.post('/api/register', (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: '用户名至少3个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少6个字符' });
    }

    // 检查用户名是否已存在
    const existingUser = userOps.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ success: false, message: '用户名已被注册' });
    }

    // 加密密码
    const passwordHash = bcrypt.hashSync(password, 10);

    // 创建用户
    const userId = userOps.create(username, passwordHash, nickname);

    // 生成JWT
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: { id: userId, username, nickname: nickname || username }
      }
    });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 用户登录
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = userOps.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 生成JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname }
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取用户信息
app.get('/api/user/info', authMiddleware, (req, res) => {
  try {
    const user = userOps.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 上传数据（全量同步）
app.post('/api/sync/upload', authMiddleware, (req, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: '数据格式无效' });
    }

    // 限制数据大小
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 5 * 1024 * 1024) { // 5MB限制
      return res.status(413).json({ success: false, message: '数据过大，超过5MB限制' });
    }

    dataOps.update(req.userId, data);

    res.json({
      success: true,
      message: '数据上传成功',
      data: {
        updatedAt: new Date().toISOString(),
        size: dataSize
      }
    });
  } catch (err) {
    console.error('数据上传错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 下载数据（全量同步）
app.get('/api/sync/download', authMiddleware, (req, res) => {
  try {
    const result = dataOps.get(req.userId);
    if (!result) {
      return res.json({ success: true, data: {}, updatedAt: null });
    }

    res.json({
      success: true,
      data: JSON.parse(result.data),
      updatedAt: result.updated_at
    });
  } catch (err) {
    console.error('数据下载错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取同步状态（最后同步时间）
app.get('/api/sync/status', authMiddleware, (req, res) => {
  try {
    const result = dataOps.get(req.userId);
    res.json({
      success: true,
      data: {
        lastSync: result ? result.updated_at : null,
        hasData: result && result.data !== '{}'
      }
    });
  } catch (err) {
    console.error('获取同步状态错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 静态文件服务（可选：托管前端）
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  DanDanTable API 服务器已启动');
  console.log('========================================');
  console.log(`  本地地址: http://localhost:${PORT}`);
  console.log(`  健康检查: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('  API接口:');
  console.log('    POST /api/register      - 用户注册');
  console.log('    POST /api/login         - 用户登录');
  console.log('    GET  /api/user/info     - 获取用户信息');
  console.log('    POST /api/sync/upload   - 上传数据');
  console.log('    GET  /api/sync/download - 下载数据');
  console.log('    GET  /api/sync/status   - 同步状态');
  console.log('========================================');
  console.log('');
});
