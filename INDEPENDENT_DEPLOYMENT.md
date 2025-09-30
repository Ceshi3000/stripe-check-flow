# Stripe 支付系统独立部署指南

本文档说明如何将支付系统代码下载到本地，并部署到您自己的服务器。

---

## ✨ 系统特点

本系统**完全独立**，不依赖任何第三方服务：

- ✅ **无数据库依赖** - 不需要 MySQL、PostgreSQL、Supabase 等
- ✅ **无 Lovable 依赖** - 可以随时导出代码，独立部署
- ✅ **纯静态前端** - 只需要 Web 服务器
- ✅ **纯 Node.js 后端** - 只需要 Node.js 运行环境
- ✅ **多账号支持** - 同一套代码可部署多个独立的 Stripe 系统

---

## 📦 项目文件结构

```
项目根目录/
├── dist/                          # 前端构建产物（执行 npm run build 后生成）
│   ├── index.html
│   ├── assets/
│   └── robots.txt
│
├── api/                           # 后端文件
│   ├── server.js                  # Express 后端主文件
│   ├── package.json               # 依赖配置
│   └── .env.example               # 环境变量示例
│
├── src/                           # 前端源代码
├── .env                           # 前端环境变量（需配置）
└── DEPLOYMENT.md                  # 宝塔面板部署指南
```

---

## 🚀 通用部署流程

### 第一步：获取项目代码

#### 方法 A：从 GitHub 克隆（推荐）

1. 在 Lovable 项目中，点击右上角 **GitHub 图标**
2. 连接您的 GitHub 账号并推送代码
3. 在本地克隆仓库：
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

#### 方法 B：直接下载

1. 在 Lovable 中进入 **Dev Mode**
2. 下载所有项目文件到本地

---

### 第二步：获取 Stripe 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 切换到「测试模式」(Test mode)
3. 左侧菜单：**开发者 → API 密钥**
4. 获取两个密钥：
   - **公钥 (Publishable key)**：`pk_test_...`
   - **私钥 (Secret key)**：`sk_test_...`

---

### 第三步：配置环境变量

#### 1. 配置前端环境变量

编辑项目根目录的 `.env` 文件：

```bash
# 前端 .env 文件
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_你的Stripe公钥
VITE_API_URL=https://你的前端域名.com
```

⚠️ **重要**：
- `VITE_API_URL` 必须填写**前端域名**（因为使用 Nginx 反向代理）
- 例如：`https://pay.yourdomain.com`

#### 2. 配置后端环境变量

在 `api/` 目录下创建 `.env` 文件：

```bash
# api/.env 文件
STRIPE_SECRET_KEY=sk_test_你的Stripe私钥
PORT=3002
```

---

### 第四步：修改公司名称（可选）

如果需要更改公司名称，请参考 `DEPLOYMENT.md` 第零章的详细说明。

**关键修改位置**：
- `api/server.js` 第 54 行（**Stripe 订单描述，显示在账单中**）
- `index.html` 多处
- `src/components/PaymentForm.tsx`
- `src/components/PaymentFormContent.tsx`

⚠️ **修改后必须重新构建前端**

---

### 第五步：构建前端

在项目根目录执行：

```bash
# 安装依赖
npm install

# 构建前端
npm run build
```

构建完成后，会生成 `dist/` 目录。

---

### 第六步：上传到服务器

#### 1. 上传前端文件

将 `dist/` 目录下的**所有内容**上传到前端网站根目录：

```
/www/wwwroot/你的前端域名.com/
├── index.html
├── assets/
└── robots.txt
```

#### 2. 上传后端文件

将以下文件上传到后端目录（如 `/www/wwwroot/stripe-api/`）：

```
/www/wwwroot/stripe-api/
├── server.js
├── package.json
└── .env
```

---

### 第七步：配置服务器

#### 1. 在宝塔中添加前端网站

- 域名：`pay.yourdomain.com`
- 根目录：上传 `dist/` 内容的目录
- PHP版本：纯静态
- 申请 SSL 证书

#### 2. 配置 Nginx 反向代理

在前端网站的 Nginx 配置中添加：

```nginx
location /api {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /health {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
}
```

#### 3. 在宝塔中添加 Node 项目

- 项目名称：`stripe-payment-api`
- 项目路径：`/www/wwwroot/stripe-api/`
- 执行文件：`server.js`
- 启动端口：`3002`
- Node 版本：18.x+
- 启动方式：PM2

---

### 第八步：测试验证

1. **测试后端健康检查**：
   ```
   https://你的前端域名.com/health
   ```
   应返回：`{"status":"ok","timestamp":"..."}`

2. **测试前端页面**：
   ```
   https://你的前端域名.com
   ```

3. **测试支付流程**：
   - 输入金额
   - 使用测试卡号：`4242 4242 4242 4242`
   - 完成支付
   - 在 [Stripe Dashboard](https://dashboard.stripe.com/test/payments) 查看记录

---

## 🔄 部署第二个 Stripe 系统（多账号支持）

如果您需要为另一个 Stripe 账号（如 B-STRIPE）部署独立系统：

### 关键要点

1. **使用独立的目录**
   - 复制整个项目代码到新目录（如 `stripe-b/`）

2. **配置不同的环境变量**
   - 前端 `.env`：使用 B 账号的公钥和独立域名
   - 后端 `api/.env`：使用 B 账号的私钥和**不同的端口**（如 `3003`）

3. **上传到不同的服务器目录**
   - 前端：`/www/wwwroot/pay-b.yourdomain.com/`
   - 后端：`/www/wwwroot/stripe-b-api/`

4. **配置独立的 Nginx 反向代理**
   - 确保反向代理指向正确的后端端口（如 `3003`）

5. **在宝塔中添加独立的 Node 项目**
   - 使用不同的端口号，避免冲突

### 配置示例对比

| 项目 | 前端域名 | 后端端口 | Stripe 公钥 | Stripe 私钥 |
|-----|---------|---------|------------|------------|
| **第一个系统** | `pay-a.com` | `3002` | `pk_test_A...` | `sk_test_A...` |
| **第二个系统** | `pay-b.com` | `3003` | `pk_test_B...` | `sk_test_B...` |

⚠️ **核心原则**：每个系统完全独立，互不影响。

---

## 📋 完整部署清单

**前置条件（服务器环境）**：
- [ ] 服务器已安装 Node.js 18+
- [ ] 服务器已安装 Nginx
- [ ] 服务器已安装 PM2（或宝塔 Node 项目管理器）
- [ ] 域名已解析到服务器 IP

**每次部署新系统**：
- [ ] 获取 Stripe 公钥和私钥
- [ ] 配置前端 `.env` 文件（公钥 + 前端域名）
- [ ] 配置后端 `api/.env` 文件（私钥 + 端口）
- [ ] （可选）修改公司名称
- [ ] 执行 `npm run build` 构建前端
- [ ] 上传前端 `dist/` 目录到服务器
- [ ] 上传后端 `api/` 目录到服务器
- [ ] 在宝塔中添加前端网站并申请 SSL
- [ ] 配置前端 Nginx 反向代理（`/api` 和 `/health`）
- [ ] 在宝塔中添加 Node 项目并启动
- [ ] 测试 `/health` 端点
- [ ] 测试完整支付流程

---

## ✅ 数据存储说明

本系统**不需要数据库**，所有数据存储在 Stripe 后台：

| 数据类型 | 存储位置 |
|---------|---------|
| 支付记录 | Stripe Dashboard → Payments |
| 客户信息 | Stripe Dashboard → Customers |
| 退款记录 | Stripe Dashboard → Refunds |

---

## 🎯 总结

### 核心优势

✅ **完全独立** - 不依赖 Lovable、Supabase 或任何第三方服务  
✅ **随时迁移** - 代码存储在 GitHub/本地，随时可部署  
✅ **多账号支持** - 同一套代码可部署无限个独立系统  
✅ **简单维护** - 每个系统独立更新，互不影响  
✅ **安全可靠** - 数据存储在 Stripe 官方后台，无需自建数据库  

### 工作流程建议

1. **首次部署**：按照本文档完成第一个系统的部署
2. **部署第二个系统**：复制代码到新目录，修改配置（端口、域名、密钥），重新构建和部署
3. **维护更新**：本地修改代码，重新构建，上传到服务器

---

**详细的宝塔面板操作步骤，请参考 `DEPLOYMENT.md`！**
