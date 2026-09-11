# DanDanTable 后端一键部署教程

后端代码已上传到 GitHub 仓库的 `server/` 目录下，你可以选择以下任一免费平台进行一键部署。

---

## 方案一：Render 部署（推荐，完全免费）

Render 提供免费的 Web Service 套餐，适合个人项目，支持从 GitHub 一键部署。

### 部署步骤

1. **注册/登录 Render**
   - 访问 https://render.com
   - 点击右上角 "Get Started" 或 "Sign In"
   - 选择 "Sign in with GitHub"（推荐，方便后续连接仓库）

2. **创建 Web Service**
   - 登录后点击仪表盘的 "New +" 按钮
   - 选择 "Web Service"

3. **连接 GitHub 仓库**
   - 点击 "Configure account" 授权 Render 访问你的 GitHub
   - 选择 `DanDanTable-` 仓库
   - 点击 "Connect"

4. **配置部署参数**
   - **Name**: `dandantable-server`（任意名字）
   - **Region**: 选择离你近的区域（如 `Singapore` 新加坡）
   - **Branch**: `main`
   - **Root Directory**: `server` ⚠️ **重要！必须填这个**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: 选择 `Free`（免费）

5. **配置环境变量（可选但推荐）**
   - 点击 "Advanced" → "Add Environment Variable"
   - 添加：
     - Key: `JWT_SECRET`
     - Value: 点击 "Generate" 生成随机密钥（或自己输入一串复杂字符串）
   - 这一步不是必须的，但强烈建议配置，提高安全性

6. **点击 "Create Web Service"**
   - 等待 1-3 分钟，Render 会自动构建和部署
   - 部署成功后，你会看到一个类似 `https://dandantable-server.onrender.com` 的网址

7. **验证部署**
   - 访问 `https://你的网址.onrender.com/api/health`
   - 如果返回 `{"success":true,"message":"DanDanTable API 运行正常",...}` 说明部署成功！

### 注意事项

- Render 免费套餐在 15 分钟无请求后会进入休眠，下次请求需要等待约 30 秒唤醒
- 每月有 750 小时的免费运行时间（足够个人使用）
- 数据存储在 Render 的磁盘上，重新部署不会丢失数据

---

## 方案二：Railway 部署（备选，每月5美元免费额度）

Railway 性能更好，不会休眠，但每月只有 5 美元免费额度（个人使用通常用不完）。

### 部署步骤

1. **注册/登录 Railway**
   - 访问 https://railway.app
   - 点击 "Login"，选择用 GitHub 登录

2. **新建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `DanDanTable-` 仓库

3. **配置服务**
   - 点击新建的服务，进入设置
   - **Root Directory**: 设置为 `server` ⚠️
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Port**: `3001`（Railway 会自动映射）

4. **配置环境变量**
   - 在 "Variables" 标签页添加：
     - `JWT_SECRET`: 随机字符串
     - `PORT`: `3001`

5. **部署**
   - Railway 会自动检测变更并部署
   - 部署成功后，在 "Settings" → "Public Networking" 中生成域名
   - 访问 `https://你的域名.up.railway.app/api/health` 验证

---

## 方案三：Fly.io 部署（备选，每月3台免费虚拟机）

Fly.io 性能好，支持全球部署，但配置稍复杂。

### 部署步骤

1. **安装 flyctl**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **登录/注册**
   ```bash
   fly auth login
   ```

3. **进入 server 目录并初始化**
   ```bash
   cd server
   fly launch
   ```
   - 按提示配置应用名称、区域等
   - 选择 "No" 不部署数据库
   - 选择 "Yes" 部署

4. **配置环境变量**
   ```bash
   fly secrets set JWT_SECRET=你的随机密钥
   ```

5. **访问应用**
   ```bash
   fly open
   ```
   - 在网址后加 `/api/health` 验证

---

## 部署后：修改前端 API 地址

部署成功后，需要修改前端代码中的 API 地址，让前端连接到你的云端后端。

### 修改方法

1. 打开前端文件 `index.html`
2. 搜索 `CLOUD_API_BASE`
3. 找到这一行：
   ```javascript
   const CLOUD_API_BASE = 'http://localhost:3001/api';
   ```
4. 修改为你的云端地址：
   ```javascript
   // Render 示例
   const CLOUD_API_BASE = 'https://dandantable-server.onrender.com/api';
   
   // Railway 示例
   const CLOUD_API_BASE = 'https://dandantable-server.up.railway.app/api';
   ```
5. 保存并上传到 GitHub

### 注意

- 如果使用 Render 免费套餐，首次请求可能需要等待 30 秒（服务唤醒）
- 建议在前端添加加载提示，告知用户正在连接云端

---

## 常见问题

### Q: 部署后访问 /api/health 返回 404？
A: 检查 Root Directory 是否设置为 `server`，这是最常见的错误。

### Q: 部署失败，提示 "npm: command not found"？
A: 确保 Runtime 选择的是 `Node`，而不是其他语言。

### Q: 数据会丢失吗？
A: Render/Railway 的磁盘数据在重新部署时不会丢失，但如果删除服务则会丢失。建议定期备份 `data/` 目录。

### Q: 可以多个用户同时使用吗？
A: 可以，每个用户注册独立账号，数据互相隔离。JSON 文件存储支持小规模多用户（几十人以内没问题）。

### Q: 如何查看后端日志？
A: 
- Render: 服务详情页 → "Logs" 标签
- Railway: 服务详情页 → "Logs" 标签
- Fly.io: 运行 `fly logs`

---

## 推荐选择

| 平台 | 免费程度 | 性能 | 休眠 | 难度 | 推荐指数 |
|------|----------|------|------|------|----------|
| **Render** | 完全免费 | 一般 | 会休眠 | 简单 | ⭐⭐⭐⭐⭐ |
| **Railway** | 每月$5额度 | 较好 | 不休眠 | 简单 | ⭐⭐⭐⭐ |
| **Fly.io** | 3台免费VM | 好 | 不休眠 | 中等 | ⭐⭐⭐⭐ |

**最推荐 Render**，因为完全免费、配置最简单，适合学生和个人项目。

---

如有问题，请查看各平台官方文档或后端 `README.md` 文件。
