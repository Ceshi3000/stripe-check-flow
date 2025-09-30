# Stripe 支付系统极简部署指南（宝塔面板版）

本指南详细说明如何使用宝塔面板，在您自己的服务器上部署整个 Stripe 支付系统（前后端分离架构）。

**✨ 本系统完全独立，不依赖任何第三方数据库服务！**

---

## 📝 零、更改公司名称教程（部署前必读）

如果您需要将默认的公司名称 `Apa High Income Opportunity Fund, L.p.` 更改为您自己的公司名称（如 `AABBCC.LLC`），请在部署前按照以下步骤修改代码：

### 需要修改的文件清单

**⚠️ 重要提示**：
- 以下所有文件都需要在**本地开发环境**中修改
- 修改完成后，需要重新执行 `npm run build` 构建前端
- 然后将构建后的 `dist` 目录和后端文件上传到服务器

---

#### 文件1：`api/package.json`

**位置**：第 4 行  
**原内容**：
```json
"description": "Express API for Apa High Income Opportunity Fund payment processing",
```

**修改为**：
```json
"description": "Express API for AABBCC.LLC payment processing",
```

---

#### 文件2：`api/server.js`

**位置1**：第 54 行 **【✨ 重要 - Stripe 订单描述，显示在 Stripe 后台和用户账单中】**  
**原内容**：
```javascript
description: 'Apa High Income Opportunity Fund, L.p.',
```

**修改为**：
```javascript
description: 'AABBCC.LLC',
```

**位置2**：第 56 行  
**原内容**：
```javascript
company: 'Apa High Income Opportunity Fund, L.p.',
```

**修改为**：
```javascript
company: 'AABBCC.LLC',
```

---

#### 文件3：`index.html`

**位置1**：第 6 行  
**原内容**：
```html
<title>Secure Payment Portal - Apa High Income Opportunity Fund, L.p.</title>
```

**修改为**：
```html
<title>Secure Payment Portal - AABBCC.LLC</title>
```

**位置2**：第 7 行  
**原内容**：
```html
<meta name="description" content="Secure payment portal for Apa High Income Opportunity Fund, L.p. Make payments according to your quoted solution price or discussed pricing plan." />
```

**修改为**：
```html
<meta name="description" content="Secure payment portal for AABBCC.LLC. Make payments according to your quoted solution price or discussed pricing plan." />
```

**位置3**：第 8 行  
**原内容**：
```html
<meta name="author" content="Apa High Income Opportunity Fund, L.p." />
```

**修改为**：
```html
<meta name="author" content="AABBCC.LLC" />
```

**位置4**：第 10 行  
**原内容**：
```html
<meta property="og:title" content="Secure Payment Portal - Apa High Income Opportunity Fund, L.p." />
```

**修改为**：
```html
<meta property="og:title" content="Secure Payment Portal - AABBCC.LLC" />
```

**位置5**：第 11 行  
**原内容**：
```html
<meta property="og:description" content="Secure payment portal for Apa High Income Opportunity Fund, L.p. services" />
```

**修改为**：
```html
<meta property="og:description" content="Secure payment portal for AABBCC.LLC services" />
```

---

#### 文件4：`src/components/PaymentForm.tsx`

**位置**：第 38 行  
**原内容**：
```tsx
<h1 className="text-2xl font-bold text-foreground">Apa High Income Opportunity Fund, L.p.</h1>
```

**修改为**：
```tsx
<h1 className="text-2xl font-bold text-foreground">AABBCC.LLC</h1>
```

---

#### 文件5：`src/components/PaymentFormContent.tsx`

**位置**：第 171 行  
**原内容**：
```tsx
<h1 className="text-2xl font-bold text-foreground">Apa High Income Opportunity Fund, L.p.</h1>
```

**修改为**：
```tsx
<h1 className="text-2xl font-bold text-foreground">AABBCC.LLC</h1>
```

---

### 修改完成后的操作流程

1. **检查所有文件**：确认以上 5 个文件的所有位置都已修改完成
2. **重新构建前端**：
   ```bash
   npm run build
   ```
3. **上传文件到服务器**：
   - 将 `dist/` 目录内容上传到前端网站根目录（覆盖旧文件）
   - 将 `api/server.js` 和 `api/package.json` 上传到后端目录（覆盖旧文件）
4. **重启后端服务**：在宝塔 Node 项目管理器中重启后端项目
5. **测试验证**：访问前端网站，确认公司名称已更新

---

**本方案特点：**
- ✅ 无需数据库配置
- ✅ 后端无状态，仅调用 Stripe API
- ✅ 所有支付记录存储在 Stripe 后台
- ✅ 极简部署，适合宝塔面板新手

## 系统架构

```
您的服务器
├── React 前端页面（独立网站）
│   └── 支付表单界面
└── Node.js 后端 API（独立网站/子域名）
    └── Stripe 支付接口
```

---

## 🔑 一、Stripe 密钥配置（必读）

### 1.1 获取 Stripe 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 切换到「测试模式」(Test mode)
3. 左侧菜单：**开发者 → API 密钥**
4. 获取两个密钥：
   - **公钥 (Publishable key)**：`pk_test_...`
   - **私钥 (Secret key)**：`sk_test_...`（点击「显示」查看）

### 1.2 密钥配置位置

| 密钥类型 | 配置文件 | 位置 | 何时配置 |
|---------|---------|------|---------|
| **公钥** | `.env` | 项目根目录 | 构建前端前 |
| **私钥** | `api/.env` | 后端目录 | 后端部署时 |

### 1.3 前端环境变量配置（⚠️ 关键步骤）

在项目根目录的 `.env` 文件中配置以下内容：

```bash
# 项目根目录的 .env 文件配置示例
# 注意：文件已存在，包含 VITE_SUPABASE_* 配置（不要删除）
# 你只需要在文件末尾追加以下两行：

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_你的Stripe公钥
VITE_API_URL=https://your-frontend-domain.com
```

⚠️ **VITE_API_URL 配置说明（非常重要！）**：
- **必须填写前端域名**，而不是后端域名
- 因为前端通过 Nginx 反向代理访问后端，所以 API 地址就是前端域名
- **错误示例**：`VITE_API_URL=https://api.yourdomain.com:3002` ❌
- **正确示例**：`VITE_API_URL=https://pay.yourdomain.com` ✅
- 本地开发时可以留空，会自动使用 `http://localhost:3002`

### 1.4 API 端口配置（⚠️ 必须检查）

检查并确认 `src/config/api.ts` 文件中的端口配置：

```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
```

⚠️ **重要**：
- 确认端口为 `3002`（或你实际使用的端口）
- 如果端口不匹配，会导致连接失败
- 本项目默认使用 `3002` 端口

### 1.5 后端环境变量配置

在宝塔后端目录创建 `api/.env` 文件：

```bash
# api/.env 文件配置
STRIPE_SECRET_KEY=sk_test_你的Stripe私钥
PORT=3002
```

⚠️ **重要提示**：
- `.env` 文件由系统自动创建，包含 `VITE_SUPABASE_*` 配置（**不要删除**）
- 你需要在文件末尾**追加** Stripe 和 API 配置
- `.env.example` 只是配置模板，系统不会读取它
- **每次修改 `.env` 文件后，必须重新执行 `npm run build` 构建前端**
- 前端是静态文件，环境变量在构建时被编译进代码，不会动态读取

---

## 二、准备工作

### 2.1 安装必要软件

在宝塔面板中安装：
- **Node.js 18+**
- **PM2 管理器**
- **Nginx**（通常已预装）

⚠️ **注意**：本方案**不需要**安装 MySQL 数据库。

### 2.2 准备域名

- **前端域名**（推荐）：`payment.yourdomain.com`
- **后端API域名**：`api-payment.yourdomain.com`
- 将两个域名都解析到您的服务器 IP 地址

---

## 三、前端部署（React应用）

### 3.1 配置环境变量并构建前端

在您的本地开发环境（Windows/Mac）执行：

```bash
# 进入项目根目录
cd /path/to/your/project

# 1. 编辑 .env 文件（文件已存在，不需要复制）
# 在文件末尾添加以下两行：
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_你的Stripe公钥
# VITE_API_URL=https://你的前端域名.com

# 2. 检查 src/config/api.ts 文件
# 确认端口配置为 3002：
# export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

# 3. 安装依赖
npm install

# 4. 构建前端生产版本
npm run build
```

⚠️ **环境变量配置检查清单**：
- [ ] `.env` 文件中已添加 `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] `.env` 文件中已添加 `VITE_API_URL=https://你的前端域名`（不是后端域名）
- [ ] `src/config/api.ts` 中的端口为 `3002`
- [ ] 已执行 `npm run build` 构建前端

⚠️ **重要提示**：
- **每次修改 `.env` 文件后，都必须重新执行 `npm run build`**
- 前端是静态文件，环境变量在构建时被编译进 JavaScript 代码
- 直接修改服务器上的 `.env` 文件不会生效，必须本地构建后重新上传
- 构建完成后，会生成 `dist/` 目录，包含所有前端静态文件

### 3.2 方法A：上传到已有网站（覆盖）

如果您已经有一个网站，想将支付页面部署到这个网站的根目录：

1. 登录宝塔面板，点击左侧菜单 **"网站"**
2. 找到目标网站，点击 **"根目录"** 列的路径（如 `/www/wwwroot/yourdomain.com`）
3. 进入文件管理器后，**删除**根目录下的所有旧文件
4. 将本地 `dist/` 目录下的**所有文件和文件夹**上传到这个根目录
5. 最终目录结构：
   ```
   /www/wwwroot/yourdomain.com/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── ...
   ```

### 3.3 方法B：创建新网站（推荐）

为前端应用创建一个独立的网站：

#### 步骤 1：添加站点

1. 登录宝塔面板，点击左侧菜单 **"网站"**
2. 点击 **"添加站点"**
3. 填写信息：
   - **域名**：`payment.yourdomain.com`
   - **根目录**：`/www/wwwroot/payment.yourdomain.com`
   - **FTP**：不创建
   - **数据库**：不创建
   - **PHP版本**：纯静态
4. 点击 **"提交"**

#### 步骤 2：上传前端文件

1. 在网站列表中，点击刚创建的站点的 **"根目录"** 路径
2. 进入 `/www/wwwroot/payment.yourdomain.com/` 目录
3. **删除**宝塔自动生成的示例文件（如 `index.html`）
4. 将本地 `dist/` 目录下的**所有文件和文件夹**上传到这里
5. 最终目录结构：
   ```
   /www/wwwroot/payment.yourdomain.com/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── ...
   ```

#### 步骤 3：配置 SSL 证书（强烈推荐）

1. 在网站列表中，点击站点的 **"设置"**
2. 点击 **"SSL"** 标签
3. 选择 **"Let's Encrypt"**
4. 勾选您的域名，点击 **"申请"**
5. 启用 **"强制HTTPS"**

#### 步骤 4：配置 Nginx 反向代理（连接后端API）

1. 在站点设置中，点击 **"配置文件"** 标签
2. 找到 `server` 块，在 `location /` 之前添加：

```nginx
# 反向代理 API 请求到后端
location /api {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}

# 健康检查
location /health {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
}
```

3. 保存配置并重载 Nginx

---

## 四、后端部署（Node.js API）

### 4.1 创建后端项目目录

1. 在宝塔面板左侧菜单点击 **"文件"**
2. 进入 `/www/wwwroot/` 目录
3. 点击 **"新建目录"**，创建 `stripe-payment-api`
4. 进入 `/www/wwwroot/stripe-payment-api/` 目录

### 4.2 上传后端文件

将项目中的以下文件上传到 `/www/wwwroot/stripe-payment-api/`：

```
stripe-payment-api/
├── server.js          # 后端主文件（从 api/server.js 上传）
├── package.json       # 依赖配置（从 api/package.json 上传）
└── .env              # 环境变量（稍后创建）
```

**上传方式**：
- 点击宝塔文件管理器的 **"上传"** 按钮
- 或使用 SFTP 工具（如 FileZilla）上传

### 4.3 配置环境变量

1. 在 `/www/wwwroot/stripe-payment-api/` 目录，点击 **"新建文件"**
2. 文件名：`.env`
3. 填写以下内容：

```env
# Stripe 密钥（必填）
STRIPE_SECRET_KEY=sk_test_你的Stripe测试密钥

# 服务器端口（必填）
PORT=3002
```

⚠️ **重要**：
- **测试环境**使用 `sk_test_...` 开头的密钥
- **生产环境**使用 `sk_live_...` 开头的密钥
- 确保 `.env` 文件权限设置为 **600** 或 **644**

### 4.4 使用宝塔 Node.js 管理器部署

#### 步骤 1：安装 Node 项目管理器

1. 在宝塔面板左侧菜单点击 **"软件商店"**
2. 搜索 **"Node 项目管理器"**，点击 **"安装"**（如已安装则跳过）

#### 步骤 2：添加 Node 项目

1. 安装完成后，点击左侧菜单的 **"Node项目"**
2. 点击 **"添加Node项目"**
3. 填写配置：
   - **项目名称**：`stripe-payment-api`
   - **项目路径**：`/www/wwwroot/stripe-payment-api`
   - **执行文件**：`server.js`
   - **启动端口**：`3002`（与 `.env` 中的 `PORT` 一致）
   - **Node 版本**：选择 **18.x** 或更高
   - **运行用户**：`www`
   - **启动方式**：`PM2`
4. 点击 **"提交"**

#### 步骤 3：自动安装依赖

宝塔会自动执行 `npm install` 安装依赖，此过程需要 1-2 分钟。

#### 步骤 4：验证项目状态

- 在 Node 项目列表中，确认项目状态为 **"运行中"**（绿色）
- 点击 **"日志"** 查看启动信息，应看到：
  ```
  ✅ Payment API Server running on port 3002
  📍 Health check: http://localhost:3002/health
  ```

### 4.5 配置后端 API 独立域名（可选但推荐）

如果您希望为后端 API 配置独立的域名（如 `api-payment.yourdomain.com`）：

#### 步骤 1：添加站点

1. 在宝塔面板点击 **"网站"** -> **"添加站点"**
2. 填写信息：
   - **域名**：`api-payment.yourdomain.com`
   - **根目录**：`/www/wwwroot/api-payment.yourdomain.com`（任意，因为会反向代理）
   - **PHP版本**：纯静态
3. 点击 **"提交"**

#### 步骤 2：配置反向代理

1. 在网站列表中，点击 `api-payment.yourdomain.com` 的 **"设置"**
2. 点击 **"反向代理"** 标签
3. 点击 **"添加反向代理"**
4. 填写：
   - **代理名称**：`stripe-api`
   - **目标URL**：`http://127.0.0.1:3002`
   - **发送域名**：`$host`
5. 保存配置

#### 步骤 3：申请 SSL 证书

1. 在站点设置中，点击 **"SSL"** 标签
2. 申请 Let's Encrypt 证书
3. 启用 **"强制HTTPS"**

---

## 五、测试验证

### 5.1 测试后端 API

浏览器访问：
```
https://payment.yourdomain.com/health
```
或（如果配置了独立API域名）：
```
https://api-payment.yourdomain.com/health
```

应返回：
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

### 5.2 测试前端支付页面

浏览器访问：
```
https://payment.yourdomain.com
```

应显示完整的支付表单界面。

### 5.3 测试完整支付流程

1. 在支付页面输入金额（如 `100`）
2. 使用 Stripe 测试卡号：
   - **卡号**：`4242 4242 4242 4242`
   - **有效期**：任意未来日期（如 `12/34`）
   - **CVC**：任意 3 位数字（如 `123`）
   - **邮编**：任意 5 位数字（如 `12345`）
3. 填写账单信息，点击 **"立即支付"**
4. 支付成功后，前往 [Stripe Dashboard](https://dashboard.stripe.com/test/payments) 查看支付记录

---

## 六、更新代码流程

### 6.1 更新后端代码

1. 修改本地的 `api/server.js` 或 `api/package.json`
2. 通过宝塔文件管理器上传替换文件
3. 在 **"Node项目"** 中，点击项目的 **"重启"** 按钮

### 6.2 更新前端代码

1. 本地修改前端代码后，重新构建：
   ```bash
   npm run build
   ```
2. 将新的 `dist/` 目录内容上传到前端网站的根目录，覆盖旧文件
3. 前端静态文件无需重启服务，刷新浏览器即可看到更新

---

## 七、常见问题排查

### 7.1 Node 项目启动失败

**问题**：在 Node 项目列表中显示 **"已停止"** 或错误状态

**排查步骤**：
1. 点击 **"日志"** 查看错误信息
2. 常见原因：
   - **端口占用**：确认 3002 端口未被占用
   - **环境变量错误**：检查 `.env` 文件中的 `STRIPE_SECRET_KEY` 是否正确
   - **依赖未安装**：手动进入项目目录执行 `npm install`
3. 修复问题后，点击 **"重启"**

### 7.2 访问网站显示 502 错误

**问题**：浏览器显示 `502 Bad Gateway`

**原因**：Node.js 后端未启动，或 Nginx 反向代理配置错误

**解决方法**：
1. 确认 Node 项目状态为 **"运行中"**
2. 检查 Nginx 配置中的 `proxy_pass` 端口是否为 `3002`
3. 重载 Nginx 配置

### 7.3 前端支付时提示网络错误 / ERR_CONNECTION_RESET

**问题**：前端页面无法调用后端 API，浏览器控制台显示 `Failed to fetch` 或 `ERR_CONNECTION_RESET`

**常见原因及解决方法**：

**原因1：环境变量配置错误**
- 检查 `.env` 文件中的 `VITE_API_URL` 是否填写正确
- **必须填写前端域名**，而不是后端域名
- 错误示例：`VITE_API_URL=https://api.yourdomain.com:3002` ❌
- 正确示例：`VITE_API_URL=https://pay.yourdomain.com` ✅
- 修改后必须重新执行 `npm run build` 并重新上传 `dist` 目录

**原因2：API 端口配置不匹配**
- 检查 `src/config/api.ts` 文件中的端口配置
- 确认为：`export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';`
- 端口必须与后端 `.env` 文件中的 `PORT` 一致
- 修改后必须重新执行 `npm run build` 并重新上传 `dist` 目录

**原因3：未重新构建前端**
- 每次修改 `.env` 或 `src/config/api.ts` 后，必须重新构建
- 执行：`npm run build`
- 将新生成的 `dist` 目录内容重新上传到服务器

**原因4：Nginx 反向代理未正确配置**
- 确认前端网站的 Nginx 配置中已添加 `/api` 和 `/health` 的反向代理规则
- 确认反向代理的目标地址为 `http://127.0.0.1:3002`（与后端端口一致）
- 重载 Nginx 并清空浏览器缓存

**排查步骤**：
1. 打开浏览器开发者工具（F12），查看 Network 标签
2. 检查请求的完整 URL 是否正确
3. 检查请求是否到达服务器（查看 Node 项目日志）
4. 确认后端服务正在运行（访问 `/health` 接口）

### 7.4 前端页面空白

**问题**：访问域名显示空白页

**原因**：前端文件未正确上传，或路径配置错误

**解决方法**：
1. 确认网站根目录包含 `index.html` 和 `assets/` 文件夹
2. 检查浏览器控制台（F12）是否有 404 错误
3. 确认 Nginx 站点的 **"网站目录"** 配置正确

### 7.5 SSL 证书申请失败

**问题**：Let's Encrypt 证书申请报错

**解决方法**：
1. 确认域名已正确解析到服务器 IP（可用 `ping` 命令测试）
2. 确认 80 端口开放（Let's Encrypt 验证需要）
3. 等待 DNS 完全生效（通常需要 10-30 分钟）

### 7.6 支付时提示 Stripe 错误

**问题**：前端显示 "Invalid API Key" 或类似错误

**原因**：`.env` 文件中的 `STRIPE_SECRET_KEY` 配置错误

**解决方法**：
1. 检查 `.env` 文件中的密钥格式：
   - 测试环境：`sk_test_...`
   - 生产环境：`sk_live_...`
2. 确认密钥无多余空格
3. 重启 Node 项目使配置生效

---

## 八、安全建议

### 8.1 保护敏感信息

- **永远不要**将 `.env` 文件提交到 Git 仓库
- 生产环境使用 Stripe 的 **live key**（`sk_live_...`）
- 定期在 Stripe Dashboard 中轮换 API 密钥

### 8.2 启用 HTTPS

- **必须**使用 SSL 证书（Let's Encrypt 免费）
- 启用 Nginx 的 **"强制HTTPS"**
- 确保前后端都使用 HTTPS 通信

### 8.3 防火墙配置

在宝塔 **"安全"** 面板中：
- **开放端口**：80（HTTP）、443（HTTPS）
- **关闭端口**：3002（Node.js 后端仅允许内部访问）

### 8.4 日志监控

- 定期查看 Node 项目日志（宝塔面板 -> Node项目 -> 日志）
- 监控服务器资源使用情况
- 设置 Stripe Webhook 接收支付状态通知（可选）

---

## 九、完整部署清单

前端部署：
- [ ] 本地执行 `npm run build` 生成 `dist` 目录
- [ ] 在宝塔创建前端网站（或使用已有网站）
- [ ] 上传 `dist` 目录内容到网站根目录
- [ ] 配置 SSL 证书（Let's Encrypt）
- [ ] 配置 Nginx 反向代理（`/api` 和 `/health` 指向后端）
- [ ] 测试前端页面访问

后端部署：
- [ ] 安装 Node.js 和 PM2 管理器
- [ ] 创建后端目录 `/www/wwwroot/stripe-payment-api/`
- [ ] 上传 `server.js`、`package.json` 到后端目录
- [ ] 创建 `.env` 文件并配置 `STRIPE_SECRET_KEY` 和 `PORT`
- [ ] 在宝塔 Node 项目管理器中添加项目并启动
- [ ] （可选）配置后端独立域名和 SSL
- [ ] 测试 `/health` API 接口

测试验证：
- [ ] 访问 `/health` 端点验证后端运行
- [ ] 访问前端页面验证界面显示
- [ ] 使用 Stripe 测试卡完成完整支付流程
- [ ] 在 Stripe Dashboard 中查看支付记录

---

## 十、架构说明

### 10.1 为什么不需要数据库？

本方案采用**无状态后端**设计，所有支付记录和客户信息都存储在 **Stripe 后台**：

- ✅ **简化部署**：无需配置和维护 MySQL 数据库
- ✅ **降低成本**：节省数据库服务器资源
- ✅ **提高安全性**：避免本地存储敏感支付信息
- ✅ **官方记录**：Stripe Dashboard 提供完整的支付、退款、客户管理功能

### 10.2 后端职责

后端 `api/server.js` 的唯一职责：
1. 接收前端的支付请求（金额）
2. 调用 Stripe API 创建 PaymentIntent
3. 返回 `clientSecret` 给前端
4. （可选）提供支付状态查询接口

### 10.3 数据存储位置

| 数据类型 | 存储位置 | 访问方式 |
|---------|---------|---------|
| 支付记录 | Stripe Dashboard | [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments) |
| 客户信息 | Stripe Dashboard | [https://dashboard.stripe.com/customers](https://dashboard.stripe.com/customers) |
| 退款记录 | Stripe Dashboard | [https://dashboard.stripe.com/refunds](https://dashboard.stripe.com/refunds) |

---

## 十一、支持与帮助

### 11.1 日志查看

- **Node 项目日志**：宝塔面板 -> Node项目 -> 点击项目的 "日志" 按钮
- **Nginx 错误日志**：宝塔面板 -> 网站 -> 点击站点的 "日志" 按钮
- **浏览器控制台**：按 F12 打开开发者工具，查看 Console 和 Network 标签

### 11.2 Stripe 资源

- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe API 参考](https://stripe.com/docs/api)
- [Stripe 测试卡号](https://stripe.com/docs/testing)

### 11.3 宝塔面板

- [宝塔官方文档](https://www.bt.cn/bbs/)
- [宝塔论坛](https://www.bt.cn/bbs/forum-1-1.html)

---

**部署完成！祝您使用愉快！** 🎉
