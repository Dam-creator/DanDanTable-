// index.js - DanDanTable 后端API主入口
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const {
  initDatabase, USE_PG, userOps, dataOps,
  getCollection, saveCollection, findById, insert, update, remove
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dandantable-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// ============ 基础API ============

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DanDanTable API 运行正常',
    storage: USE_PG ? 'postgres' : 'json-file',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    if (username.length < 3) return res.status(400).json({ success: false, message: '用户名至少3个字符' });
    if (password.length < 6) return res.status(400).json({ success: false, message: '密码至少6个字符' });
    const existingUser = await userOps.findByUsername(username);
    if (existingUser) return res.status(409).json({ success: false, message: '用户名已被注册' });
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = await userOps.create(username, passwordHash, nickname);
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, message: '注册成功', data: { token, user: { id: userId, username, nickname: nickname || username } } });
  } catch (err) { console.error('注册错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    const user = await userOps.findByUsername(username);
    if (!user) return res.status(401).json({ success: false, message: '用户名或密码错误' });
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: '用户名或密码错误' });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, message: '登录成功', data: { token, user: { id: user.id, username: user.username, nickname: user.nickname } } });
  } catch (err) { console.error('登录错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/user/info', authMiddleware, async (req, res) => {
  try {
    const user = await userOps.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true, data: user });
  } catch (err) { console.error('获取用户信息错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/sync/upload', authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ success: false, message: '数据格式无效' });
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 5 * 1024 * 1024) return res.status(413).json({ success: false, message: '数据过大，超过5MB限制' });
    await dataOps.update(req.userId, data);
    res.json({ success: true, message: '数据上传成功', data: { updatedAt: new Date().toISOString(), size: dataSize } });
  } catch (err) { console.error('数据上传错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/sync/download', authMiddleware, async (req, res) => {
  try {
    const result = await dataOps.get(req.userId);
    if (!result) return res.json({ success: true, data: {}, updatedAt: null });
    res.json({ success: true, data: JSON.parse(result.data), updatedAt: result.updated_at });
  } catch (err) { console.error('数据下载错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/sync/status', authMiddleware, async (req, res) => {
  try {
    const result = await dataOps.get(req.userId);
    res.json({ success: true, data: { lastSync: result ? result.updated_at : null, hasData: result && result.data !== '{}' } });
  } catch (err) { console.error('获取同步状态错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 课程表 API ============

app.get('/api/schedule', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await getCollection('schedule', req.userId) }); }
  catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/schedule', authMiddleware, async (req, res) => {
  try {
    const course = { ...req.body, id: 'course_' + Date.now(), createdAt: new Date().toISOString() };
    await insert('schedule', req.userId, course);
    res.json({ success: true, data: course });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/schedule/:id', authMiddleware, async (req, res) => {
  try {
    const result = await update('schedule', req.userId, req.params.id, req.body);
    if (!result) return res.status(404).json({ success: false, message: '课程不存在' });
    res.json({ success: true, data: result });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.delete('/api/schedule/:id', authMiddleware, async (req, res) => {
  try {
    if (!await remove('schedule', req.userId, req.params.id)) return res.status(404).json({ success: false, message: '课程不存在' });
    res.json({ success: true, message: '课程已删除' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 任务 API ============

app.get('/api/tasks/stats', authMiddleware, async (req, res) => {
  try {
    const tasks = await getCollection('tasks', req.userId);
    const now = new Date(); const today = now.toISOString().split('T')[0];
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    const todayDue = pending.filter(t => t.dueDate && t.dueDate.split('T')[0] === today);
    const total = tasks.length;
    res.json({ success: true, data: { pending: pending.length, completed: completed.length, todayDue: todayDue.length, total, completionRate: total ? Math.round(completed.length / total * 100) : 0 } });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    let tasks = await getCollection('tasks', req.userId);
    const status = req.query.status || 'all';
    if (status === 'pending') tasks = tasks.filter(t => !t.completed);
    else if (status === 'completed') tasks = tasks.filter(t => t.completed);
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: tasks });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const task = { ...req.body, id: 'task_' + Date.now(), completed: false, completedAt: null, createdAt: new Date().toISOString() };
    await insert('tasks', req.userId, task);
    res.json({ success: true, data: task });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const result = await update('tasks', req.userId, req.params.id, req.body);
    if (!result) return res.status(404).json({ success: false, message: '任务不存在' });
    res.json({ success: true, data: result });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.patch('/api/tasks/:id/complete', authMiddleware, async (req, res) => {
  try {
    const task = await findById('tasks', req.userId, req.params.id);
    if (!task) return res.status(404).json({ success: false, message: '任务不存在' });
    const result = await update('tasks', req.userId, req.params.id, { completed: !task.completed, completedAt: task.completed ? null : new Date().toISOString() });
    res.json({ success: true, data: result });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    if (!await remove('tasks', req.userId, req.params.id)) return res.status(404).json({ success: false, message: '任务不存在' });
    res.json({ success: true, message: '任务已删除' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 专注计时 API ============

app.get('/api/focus/stats', authMiddleware, async (req, res) => {
  try {
    const sessions = (await getCollection('focus_sessions', req.userId)).filter(s => s.type === 'focus' && s.completed);
    const now = new Date(); const today = now.toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.startTime.split('T')[0] === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayPomodoros = todaySessions.length;
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const weekMinutes = sessions.filter(s => s.startTime >= weekAgo).reduce((sum, s) => sum + s.duration, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    let streak = 0; let d = new Date(now);
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (sessions.some(s => s.startTime.split('T')[0] === ds)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    res.json({ success: true, data: { todayMinutes, todayPomodoros, weekMinutes, totalMinutes, streak } });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/focus/heatmap', authMiddleware, async (req, res) => {
  try {
    const sessions = (await getCollection('focus_sessions', req.userId)).filter(s => s.type === 'focus' && s.completed);
    const heatmap = {}; const now = new Date();
    for (let i = 0; i < 84; i++) {
      const d = new Date(now.getTime() - i * 86400000);
      const ds = d.toISOString().split('T')[0];
      heatmap[ds] = sessions.filter(s => s.startTime.split('T')[0] === ds).reduce((sum, s) => sum + s.duration, 0);
    }
    res.json({ success: true, data: heatmap });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/focus/sessions', authMiddleware, async (req, res) => {
  try {
    let sessions = await getCollection('focus_sessions', req.userId);
    if (req.query.date) sessions = sessions.filter(s => s.startTime.split('T')[0] === req.query.date);
    if (req.query.range === 'week') { const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString(); sessions = sessions.filter(s => s.startTime >= weekAgo); }
    sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    res.json({ success: true, data: sessions });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/focus/sessions', authMiddleware, async (req, res) => {
  try {
    const session = { ...req.body, id: 'focus_' + Date.now(), createdAt: new Date().toISOString() };
    await insert('focus_sessions', req.userId, session);
    res.json({ success: true, data: session });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/focus/settings', authMiddleware, async (req, res) => {
  try {
    const settings = (await findById('focus_settings', req.userId, 'default')) || { focusDuration: 25, breakDuration: 5, longBreakDuration: 15, autoStartBreak: true, autoStartFocus: false, soundEnabled: true };
    res.json({ success: true, data: settings });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/focus/settings', authMiddleware, async (req, res) => {
  try {
    const existing = await findById('focus_settings', req.userId, 'default');
    const settings = { ...(existing || {}), ...req.body, id: 'default' };
    if (existing) await update('focus_settings', req.userId, 'default', settings);
    else await insert('focus_settings', req.userId, settings);
    res.json({ success: true, data: settings });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 目标管理 API ============

app.get('/api/goals/stats', authMiddleware, async (req, res) => {
  try {
    const goals = await getCollection('goals', req.userId);
    const active = goals.filter(g => g.status === 'active');
    const completed = goals.filter(g => g.status === 'completed');
    const total = goals.length; const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthNew = goals.filter(g => g.createdAt.slice(0, 7) === thisMonth);
    const thisMonthDone = completed.filter(g => g.completedAt && g.completedAt.slice(0, 7) === thisMonth);
    res.json({ success: true, data: { active: active.length, completed: completed.length, total, completionRate: total ? Math.round(completed.length / total * 100) : 0, thisMonthNew: thisMonthNew.length, thisMonthDone: thisMonthDone.length } });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/goals', authMiddleware, async (req, res) => {
  try {
    let goals = await getCollection('goals', req.userId);
    const status = req.query.status || 'all';
    if (status !== 'all') goals = goals.filter(g => g.status === status);
    goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: goals });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    res.json({ success: true, data: goal });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const goal = { ...req.body, id: 'goal_' + Date.now(), progress: 0, status: 'active', milestones: req.body.milestones || [], createdAt: new Date().toISOString(), completedAt: null };
    await insert('goals', req.userId, goal);
    res.json({ success: true, data: goal });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const result = await update('goals', req.userId, req.params.id, req.body);
    if (!result) return res.status(404).json({ success: false, message: '目标不存在' });
    res.json({ success: true, data: result });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.patch('/api/goals/:id/progress', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    if (goal.progressType === 'auto') {
      const total = goal.milestones.length;
      const done = goal.milestones.filter(m => m.completed).length;
      goal.progress = total ? Math.round(done / total * 100) : 0;
    } else { goal.progress = req.body.progress; }
    if (goal.progress >= 100 && goal.status === 'active') { goal.status = 'completed'; goal.completedAt = new Date().toISOString(); }
    const result = await update('goals', req.userId, req.params.id, goal);
    res.json({ success: true, data: result });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.delete('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    if (!await remove('goals', req.userId, req.params.id)) return res.status(404).json({ success: false, message: '目标不存在' });
    res.json({ success: true, message: '目标已删除' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// 子任务 API
app.post('/api/goals/:id/milestones', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    const milestone = { ...req.body, id: 'milestone_' + Date.now(), completed: false, completedAt: null };
    goal.milestones.push(milestone);
    await update('goals', req.userId, req.params.id, goal);
    res.json({ success: true, data: milestone });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/goals/:id/milestones/:mid', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    const idx = goal.milestones.findIndex(m => m.id === req.params.mid);
    if (idx === -1) return res.status(404).json({ success: false, message: '子任务不存在' });
    goal.milestones[idx] = { ...goal.milestones[idx], ...req.body };
    await update('goals', req.userId, req.params.id, goal);
    res.json({ success: true, data: goal.milestones[idx] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.patch('/api/goals/:id/milestones/:mid/complete', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    const ms = goal.milestones.find(m => m.id === req.params.mid);
    if (!ms) return res.status(404).json({ success: false, message: '子任务不存在' });
    ms.completed = !ms.completed; ms.completedAt = ms.completed ? new Date().toISOString() : null;
    if (goal.progressType === 'auto') {
      const total = goal.milestones.length;
      const done = goal.milestones.filter(m => m.completed).length;
      goal.progress = total ? Math.round(done / total * 100) : 0;
      if (goal.progress >= 100 && goal.status === 'active') { goal.status = 'completed'; goal.completedAt = new Date().toISOString(); }
    }
    await update('goals', req.userId, req.params.id, goal);
    res.json({ success: true, data: ms });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.delete('/api/goals/:id/milestones/:mid', authMiddleware, async (req, res) => {
  try {
    const goal = await findById('goals', req.userId, req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目标不存在' });
    goal.milestones = goal.milestones.filter(m => m.id !== req.params.mid);
    await update('goals', req.userId, req.params.id, goal);
    res.json({ success: true, message: '子任务已删除' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 压力指数 API ============

app.get('/api/stress/current', authMiddleware, async (req, res) => {
  try {
    const tasks = await getCollection('tasks', req.userId);
    const sessions = await getCollection('focus_sessions', req.userId);
    const now = new Date(); const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const pendingTasks = tasks.filter(t => !t.completed);
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high').length;
    const todayDue = pendingTasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === today).length;
    const taskScore = Math.min(100, pendingTasks.length * 8 + highPriorityTasks * 10 + todayDue * 15);

    const weekFocus = sessions.filter(s => s.type === 'focus' && s.completed && s.startTime >= weekAgo);
    const weekMinutes = weekFocus.reduce((s, sess) => s + sess.duration, 0);
    const avgDaily = weekMinutes / 7;
    const focusScore = Math.min(100, avgDaily > 360 ? Math.round((avgDaily - 360) / 3) : 0);

    const examScore = 0;
    const score = Math.round(examScore * 0.30 + taskScore * 0.25 + focusScore * 0.10 + 30 * 0.20 + 20 * 0.15);

    let level, advice;
    if (score <= 30) { level = 'relaxed'; advice = ['状态不错，继续保持', '今天适合做些运动放松一下']; }
    else if (score <= 50) { level = 'moderate'; advice = ['有点忙，注意劳逸结合', '记得按时吃饭和休息']; }
    else if (score <= 70) { level = 'elevated'; advice = ['最近有点累，记得给自己放松时间', '要不要试试番茄钟提高效率？']; }
    else { level = 'high'; advice = ['你最近压力太大了，请务必注意休息', '建议减少一些非必要的任务']; }

    const result = {
      date: today, score, level,
      dimensions: {
        examPressure: { score: examScore, weight: 30, detail: '考试数据暂不可用' },
        taskPressure: { score: taskScore, weight: 25, detail: pendingTasks.length + '项待办' + (todayDue ? '，' + todayDue + '项今日截止' : '') },
        sleep: { score: 30, weight: 20, detail: '睡眠数据不足' },
        mood: { score: 20, weight: 15, detail: '心情数据不足' },
        focus: { score: focusScore, weight: 10, detail: '近7天日均专注' + Math.round(avgDaily) + '分钟' }
      },
      advice, trend: 'stable', createdAt: new Date().toISOString()
    };

    const history = await getCollection('stress_history', req.userId);
    const existingIdx = history.findIndex(h => h.date === today);
    if (existingIdx >= 0) history[existingIdx] = result; else history.push(result);
    await saveCollection('stress_history', req.userId, history);

    res.json({ success: true, data: result });
  } catch (err) { console.error('压力指数计算错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/stress/history', authMiddleware, async (req, res) => {
  try {
    let history = await getCollection('stress_history', req.userId);
    const range = parseInt(req.query.range) || 7;
    const cutoff = new Date(Date.now() - range * 86400000).toISOString().split('T')[0];
    history = history.filter(h => h.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ success: true, data: history });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/stress/advice', authMiddleware, async (req, res) => {
  try {
    const history = await getCollection('stress_history', req.userId);
    const latest = history.sort((a, b) => b.date.localeCompare(a.date))[0];
    res.json({ success: true, data: latest ? latest.advice : ['多使用几天就能看到压力分析啦'] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// ============ 消费洞察 API ============

app.get('/api/finance/insight', authMiddleware, async (req, res) => {
  try {
    const transactions = await getCollection('transactions', req.userId);
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const monthTx = transactions.filter(tx => tx.date && tx.date.startsWith(month));
    const expenses = monthTx.filter(tx => tx.type === 'expense');
    const incomes = monthTx.filter(tx => tx.type === 'income');
    const totalExpense = expenses.reduce((s, tx) => s + Number(tx.amount), 0);
    const totalIncome = incomes.reduce((s, tx) => s + Number(tx.amount), 0);

    const catMap = {};
    expenses.forEach(tx => { const cat = tx.category || '其他'; catMap[cat] = (catMap[cat] || 0) + Number(tx.amount); });
    const categoryBreakdown = Object.entries(catMap).map(([category, amount]) => ({ category, amount, percentage: totalExpense ? Math.round(amount / totalExpense * 1000) / 10 : 0 })).sort((a, b) => b.amount - a.amount);

    const dailyMap = {};
    expenses.forEach(tx => { dailyMap[tx.date] = (dailyMap[tx.date] || 0) + Number(tx.amount); });
    const dailyTrend = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

    const days = dailyTrend.length || 1;
    const avgDailyExpense = Math.round(totalExpense / days * 10) / 10;
    const mostExpensiveDay = dailyTrend.slice().sort((a, b) => b.amount - a.amount)[0] || { date: '-', amount: 0 };

    const budgets = await getCollection('budgets', req.userId);
    const budget = budgets.find(b => b.month === month) || { totalBudget: 0, categoryBudgets: {} };
    const budgetExecution = {
      total: { budget: budget.totalBudget, spent: totalExpense, remaining: budget.totalBudget - totalExpense, percentage: budget.totalBudget ? Math.round(totalExpense / budget.totalBudget * 1000) / 10 : 0 },
      categories: Object.entries(budget.categoryBudgets || {}).map(([cat, b]) => { const spent = catMap[cat] || 0; return { category: cat, budget: b, spent, overBudget: spent > b, percentage: Math.round(spent / b * 1000) / 10 }; })
    };

    const insights = [];
    categoryBreakdown.forEach(c => {
      if (budget.categoryBudgets && budget.categoryBudgets[c.category] && c.amount > budget.categoryBudgets[c.category])
        insights.push({ type: 'warning', title: c.category + '支出超预算', detail: '本月' + c.category + '支出' + c.amount + '元，超出预算' + (c.amount - budget.categoryBudgets[c.category]) + '元', suggestion: '要不要挑战下周减少' + c.category + '支出？' });
    });
    if (totalExpense > budget.totalBudget && budget.totalBudget > 0)
      insights.push({ type: 'warning', title: '总支出超预算', detail: '本月已支出' + totalExpense + '元，超出总预算' + (totalExpense - budget.totalBudget) + '元', suggestion: '可以看看哪些分类可以适当控制一下' });
    if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage > 50)
      insights.push({ type: 'tip', title: '主要支出在' + categoryBreakdown[0].category, detail: categoryBreakdown[0].category + '占总支出的' + categoryBreakdown[0].percentage + '%', suggestion: '要不要分析一下' + categoryBreakdown[0].category + '的具体构成？' });
    if (totalExpense < budget.totalBudget * 0.8 && budget.totalBudget > 0)
      insights.push({ type: 'positive', title: '消费控制得不错', detail: '本月支出' + totalExpense + '元，低于预算20%以上', suggestion: '省下的钱可以存起来实现小目标！' });

    res.json({ success: true, data: { month, totalExpense, totalIncome, balance: totalIncome - totalExpense, budgetExecution, categoryBreakdown, dailyTrend, insights, avgDailyExpense, mostExpensiveDay } });
  } catch (err) { console.error('消费洞察错误:', err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.get('/api/finance/budget', authMiddleware, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await getCollection('budgets', req.userId);
    const budget = budgets.find(b => b.month === month) || { month, totalBudget: 0, categoryBudgets: {} };
    res.json({ success: true, data: budget });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

app.put('/api/finance/budget', authMiddleware, async (req, res) => {
  try {
    const { month, totalBudget, categoryBudgets } = req.body;
    let budgets = await getCollection('budgets', req.userId);
    const idx = budgets.findIndex(b => b.month === month);
    const budgetData = { month, totalBudget, categoryBudgets };
    if (idx >= 0) budgets[idx] = budgetData; else budgets.push(budgetData);
    await saveCollection('budgets', req.userId, budgets);
    res.json({ success: true, data: budgetData });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: '服务器内部错误' }); }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

async function start() {
  try { await initDatabase(); }
  catch (e) { console.error('!! 数据库初始化失败，以降级模式启动（接口可能报错）:', e.message); }
  app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  DanDanTable API 服务器已启动');
    console.log('  存储模式: ' + (USE_PG ? 'Postgres (Neon)' : '本地 JSON 文件'));
    console.log('  端口: ' + PORT + '  健康检查: /api/health');
    console.log('========================================');
  });
}
start();
