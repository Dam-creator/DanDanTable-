# DanDanTable 后端服务使用说明

## 项目简介

DanDanTable 是一个大学生工具台应用，包含 GPA 计算、考试倒计时、记账本、生活作息管理等功能。本后端服务提供可选的云端同步功能，支持多设备间数据同步。

## 技术栈

- **运行环境**: Node.js >= 16.0.0
- **Web框架**: Express.js
- **数据存储**: JSON 文件（无需数据库服务，简单轻量）
- **认证方式**: JWT (JSON Web Token)
- **密码加密**: bcryptjs
- **默认端口**: 3001

## 目录结构

```
server/
├── index.js          # 主入口，API路由
├── database.js       # 数据存储操作（JSON文件）
├── package.json      # 项目配置和依赖
├── test_server.js    # 测试脚本
├── test_combined.js  # 组合测试脚本
├── data/             # 数据目录（自动创建）
│   ├── users.json    # 用户数据
│   └── user_data.json # 用户同步数据
└── README.md         # 本说明文档
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 启动服务

```bash
npm start
```

或使用开发模式（自动重启）：

```bash
npm run dev
```

启动成功后会显示：

```
========================================
  DanDanTable API 服务器已启动
========================================
  本地地址: http://localhost:3001
  健康检查: http://localhost:3001/api/health
========================================
```

### 3. 验证服务

在浏览器中访问 http://localhost:3001/api/health ，应返回：

```json
{
  "success": true,
  "message": "DanDanTable API 运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API 接口说明

### 1. 健康检查

- **URL**: `GET /api/health`
- **说明**: 检查服务是否正常运行
- **无需认证**

### 2. 用户注册

- **URL**: `POST /api/register`
- **说明**: 注册新用户
- **无需认证**
- **请求体**:
  ```json
  {
    "username": "your_username",
    "password": "your_password",
    "nickname": "显示昵称（可选）"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": 1,
        "username": "your_username",
        "nickname": "显示昵称"
      }
    }
  }
  ```

### 3. 用户登录

- **URL**: `POST /api/login`
- **说明**: 用户登录，获取JWT令牌
- **无需认证**
- **请求体**:
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

### 4. 获取用户信息

- **URL**: `GET /api/user/info`
- **说明**: 获取当前登录用户信息
- **需要认证**: 在请求头中添加 `Authorization: Bearer <token>`

### 5. 上传数据（云端同步）

- **URL**: `POST /api/sync/upload`
- **说明**: 将本地数据全量上传到云端
- **需要认证**
- **请求体**:
  ```json
  {
    "data": {
      "key1": "value1",
      "key2": "value2"
    }
  }
  ```
- **限制**: 数据大小不超过 5MB

### 6. 下载数据（云端同步）

- **URL**: `GET /api/sync/download`
- **说明**: 从云端下载全量数据
- **需要认证**

### 7. 获取同步状态

- **URL**: `GET /api/sync/status`
- **说明**: 获取最后同步时间和是否有数据
- **需要认证**

## 前端使用云端同步

### 1. 确保后端服务已启动

后端服务必须运行在 `http://localhost:3001`。

### 2. 在前端启用云端同步

1. 打开 DanDanTable 网页
2. 点击右上角「数据管理」按钮（或侧边栏「数据管理」）
3. 在「云端同步」区域点击「登录/注册云端账号」
4. 注册新账号或登录已有账号
5. 登录成功后，可使用：
   - **上传到云端**: 将当前本地数据备份到云端
   - **从云端下载**: 用云端数据覆盖当前本地数据（会提示确认）

### 3. 多设备同步流程

**设备A（上传）**:
1. 登录云端账号
2. 点击「上传到云端」
3. 等待上传完成

**设备B（下载）**:
1. 登录同一个云端账号
2. 点击「从云端下载」
3. 确认覆盖本地数据
4. 页面自动刷新，数据同步完成

## 配置说明

### 修改端口

编辑 `index.js` 文件顶部：

```javascript
const PORT = process.env.PORT || 3001;
```

或使用环境变量启动：

```bash
PORT=8080 npm start
```

### 修改JWT密钥

编辑 `index.js` 文件：

```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

**重要**: 生产环境请务必修改为复杂的随机密钥，并使用环境变量配置。

### 修改Token有效期

编辑 `index.js` 文件：

```javascript
const JWT_EXPIRES_IN = '7d'; // 7天
```

可选值: `'1h'`（1小时）、`'7d'`（7天）、`'30d'`（30天）等。

## 部署到服务器

### 方式一：直接运行（简单）

```bash
# 1. 安装Node.js
# 2. 上传server目录到服务器
# 3. 安装依赖
cd server
npm install --production

# 4. 使用pm2后台运行（推荐）
npm install -g pm2
pm2 start index.js --name dandantable-server
pm2 save
pm2 startup
```

### 方式二：Docker部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

构建并运行：

```bash
docker build -t dandantable-server .
docker run -d -p 3001:3001 -v ./data:/app/data --name dandantable-server dandantable-server
```

### 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 修改前端API地址

如果后端部署在其他地址，需要修改前端 `index.html` 中的API地址：

```javascript
const CLOUD_API_BASE = 'http://your-server:3001/api';
```

## 数据备份

用户数据存储在 `server/data/` 目录下：

- `users.json`: 用户账号信息（密码已加密）
- `user_data.json`: 用户同步数据

**定期备份**:
```bash
# 备份数据目录
cp -r server/data /path/to/backup/data-$(date +%Y%m%d)
```

## 安全建议

1. **修改默认JWT密钥**: 生产环境务必使用复杂的随机密钥
2. **使用HTTPS**: 部署到公网时请配置HTTPS证书
3. **定期备份**: 定期备份 `data/` 目录
4. **限制访问**: 可使用Nginx配置IP白名单或Basic Auth
5. **密码强度**: 建议用户使用强密码（前端已限制最少6位）

## 常见问题

### Q: 启动报错 "端口被占用"
A: 修改 `index.js` 中的端口号，或停止占用3001端口的进程。

### Q: 前端提示 "无法连接云端服务器"
A: 确保后端服务已启动，且前端 `CLOUD_API_BASE` 地址正确。

### Q: 数据上传失败
A: 检查数据大小是否超过5MB，或查看后端日志。

### Q: 忘记密码怎么办
A: 当前版本不支持密码找回，需要删除 `data/users.json` 中对应用户重新注册。

### Q: 可以支持多个用户吗
A: 可以，每个用户注册独立账号，数据互相隔离。

## 技术支持

如遇到问题，请检查：
1. Node.js版本是否 >= 16.0.0
2. 端口是否被占用
3. 防火墙是否放行3001端口
4. 前端API地址是否配置正确

---

**DanDanTable 后端服务 v1.0.0**
