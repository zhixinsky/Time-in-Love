# 微信云托管 · 对接说明

根据你提供的云环境信息已写入项目配置。

| 项 | 值 |
|----|-----|
| 小程序名称 | 星芽恋记 |
| AppID | `wxb76bea40dcb2999b` |
| 环境 ID | `prod-d0gd8tvq9c6e19eb3` |
| 数据库 | 云托管 MySQL（模板自动创建） |

> **安全提示**：数据库密码曾在聊天/截图中出现，建议在 [微信云托管控制台](https://cloud.weixin.qq.com/cloudrun) → 数据库 → MySQL **尽快修改密码**，并同步更新 `api/.env`（勿提交 Git）。

---

## 一、部署 API + Admin 到云托管

1. 云托管控制台 → 环境 `prod-d0gd8tvq9c6e19eb3` → 服务名 **`express-op14`**（与 `mobile/src/config/index.js` 中 `WX_CLOUD_SERVICE` 一致）
2. **Git 构建必须这样配**（配错会构建失败且运行日志为空）：

| 配置项 | 正确值 | 错误示例 |
|--------|--------|----------|
| 代码 / 构建上下文 | **仓库根目录** `Time-in-Love` | 只选 `api/` 子目录 |
| Dockerfile 路径 | **`/Dockerfile`**（根目录） | 用 `api/Dockerfile` 却选根目录上下文 |
| 服务端口 | `80` | `3000` |

3. 环境变量（控制台配置，不要写进 Git）：

当前根目录 `Dockerfile` 会先构建 `admin/`，再把 `admin/dist` 复制进 API 容器。发布后访问路径：

| 路径 | 说明 |
|------|------|
| `/api/v1` | 小程序与后台接口 |
| `/admin/` | 管理后台 |

**云托管绑定 MySQL / 云存储后，平台会自动注入：**

| 变量名（平台注入） | 说明 |
|-------------------|------|
| `MYSQL_ADDRESS` | 内网地址，格式 `ip:3306` |
| `MYSQL_USERNAME` | 数据库用户名 |
| `MYSQL_PASSWORD` | 数据库密码 |
| `COS_BUCKET` | 云存储桶名 |
| `COS_REGION` | 云存储地域，如 `ap-shanghai` |

**需你在服务里手动添加：**

| 变量名 | 说明 |
|--------|------|
| `PORT` | `80` |
| `NODE_ENV` | `production` |
| `ADMIN_TOKEN` | 兼容旧管理接口的密钥 |
| `ADMIN_JWT_SECRET` | 管理后台 JWT 密钥，生产必须设置强随机值 |
| `WX_CLOUD_ENV_ID` | `prod-d0gd8tvq9c6e19eb3` |
| `WX_APPID` | `wxb76bea40dcb2999b` |
| `MYSQL_DATABASE` | `love`（若平台未注入） |
| `MIMO_APIKEY` | 小米 MiMo 大模型 API Key |
| `MIMO_BASE_URL` | OpenAI 兼容地址，默认 `https://api.mimo-v2.com/v1` |
| `MIMO_MODEL` | 模型名，默认 `mimo-v2-flash` |

> 本地 `.env` 仍可用 `MYSQL_HOST` / `MYSQL_USER` 等别名，代码会自动兼容。

4. 发布服务，记录 **公网访问域名**（可选）

### 部署失败、看不到错误日志？

| 阶段 | 去哪里看日志 |
|------|----------------|
| **镜像构建失败** | 云托管 → 服务 → **构建记录 / 持续集成**（不是「运行日志」） |
| **容器启动失败** | **运行日志**，搜 `[api] starting` / `[api] listening` |
| **探活失败** | 运行日志里是否有 `listening on 0.0.0.0:80`；访问 `/health` 应返回 `{"ok":true}` |

常见原因：

1. **Dockerfile 与代码目录不匹配**（最常见）：根目录 Dockerfile 必须配合**仓库根**构建。
2. **旧版 Dockerfile 用 monorepo `npm install`**：在云端易超时/OOM，已改为 `admin/`、`api/` 独立安装。
3. **启动时先连 MySQL 再监听端口**：旧版会探活失败；现已先 `listen` 再后台 `bootstrap`。
4. **未绑定 MySQL**：可启动但日志为 `memory seed`；绑定后需 `MYSQL_DATABASE=love`。

仅部署 API、不要 Admin 时：代码目录选 `api/`，Dockerfile 选 **`api/Dockerfile`**（不要用根目录 Dockerfile）。

---

## 二、初始化 MySQL 表

> MySQL 使用云托管注入的 `MYSQL_ADDRESS`（内网 `ip:3306`），仅云托管内 `api` 服务可访问；本机 `npm run db:init` 通常会失败，属正常。

**API 启动时会自动执行** `scripts/schema.sql` 等脚本，创建 `love` 库与表（日志出现 `[db-bootstrap] ready: love` 即成功）。若日志仍是 `Unknown database 'love'`，请确认服务环境变量已配置 **`MYSQL_DATABASE=love`**，并重新发布 `express-op14`。

### 方式 A：控制台 SQL 执行（推荐）

云托管 → 数据库 → MySQL → **SQL 执行**，依次粘贴运行：

1. `api/scripts/schema.sql`
2. `api/scripts/seed-data.sql`

如果你已经部署过旧版本，再额外执行一次：

```sql
api/scripts/schema-space-v2.sql
api/scripts/schema-bill-v1.sql
api/scripts/schema-checklist-v1.sql
api/scripts/schema-qa-v1.sql
api/scripts/schema-diary-v2.sql
```

### 方式 B：API 服务内执行（部署后）

服务发布且环境变量配好后，在「云端调试」终端：

```bash
node scripts/init-db.js
```

---

## 三、小程序如何调 API

### 方式 A：云托管 callContainer（推荐）

1. `mobile/src/config/index.js` 中 `WX_CLOUD_SERVICE` 与服务名一致（当前 `express-op14`）
2. `App.vue` 已 `wx.cloud.init({ env: 'prod-d0gd8tvq9c6e19eb3' })`
3. 生产包 `USE_CLOUD_CONTAINER` 为 true 时走 `wx.cloud.callContainer`

### 方式 B：HTTPS 公网域名

1. 将公网域名填入 `CLOUD_RUN_PUBLIC_BASE`
2. 小程序后台 → 开发 → 开发管理 → 服务器域名 → **request 合法域名** 添加该域名

本地调试：

小程序默认 **`USE_LOCAL_API = false`**，通过 `wx.cloud.callContainer` 访问云托管服务 **`express-op14`**，无需配置 `127.0.0.1` 合法域名。

仅本地直连本机 API 时设 `USE_LOCAL_API = true`，并勾选「不校验合法域名」+ `npm run dev:api`。

### callContainer 报 INVALID_HOST 时

按顺序排查：

1. **微信开发者工具** → 顶部 **「云开发」** → 选择环境 **`prod-d0gd8tvq9c6e19eb3`**（必须与本项目一致）
2. **云托管控制台** → 服务管理 → **服务列表** → 复制 **服务名称**（不是版本名）→ 填入 `mobile/src/config/index.js` 的 **`WX_CLOUD_SERVICE`**
3. 确认该服务 **已发布** 且至少有一个在线版本
4. 若仍失败：在云托管控制台复制 **公网访问 HTTPS 地址**，填入 **`CLOUD_RUN_PUBLIC_BASE`**（并在小程序后台 → 开发管理 → 服务器域名 → request 合法域名 中添加该域名），然后重新构建

当前项目 `WX_CLOUD_SERVICE = 'express-op14'`，须与控制台「服务列表」名称完全一致。

---

## 四、验证

```bash
# API 健康检查
curl http://127.0.0.1:3000/api/v1/health

# 仪表盘
curl http://127.0.0.1:3000/api/v1/spaces/space_demo/dashboard
```

返回 `database: "mysql"` 表示已连上数据库；`memory-seed` 表示仍用内存演示数据。

---

## 五、管理后台

```bash
npm run dev:admin
```

浏览器打开后使用管理员账号登录：

```text
admin / admin123456
```

生产环境请在首次部署后改造为数据库管理员账号，并设置强 `ADMIN_JWT_SECRET`。

Admin 前端生产环境默认请求同域 `/api/v1`，并由 API 容器托管在 `/admin/`。本地开发由 Vite 代理到 `http://127.0.0.1:3000`。

如果以后改成独立部署 Admin 静态站点，需要设置：

```bash
VITE_API_BASE=https://你的-api-域名/api/v1
```

侧栏 **AI星芽 / 系统配置 / 内容审核 / 资源库** 等页面已按运营后台信息架构实现；恋爱音乐接口仍保留在 API：

```text
GET /api/v1/love-space/background-music/loop
GET /api/v1/admin/love-background-music
```

> **注意**：COS 扫描依赖微信开放接口 `/_/cos/getauth`，通常仅在**云托管运行环境**内可用；本地 `npm run dev:api` 点同步可能失败，属正常。可在云端部署后于 Admin 同步，或手动填写 `cloud://` fileId。

小程序首页进入后会请求 `GET /api/v1/love-space/background-music/loop`，并用 `wx.getBackgroundAudioManager` 自动播放 `cloud://` 音源。

### 云存储静态图（勿打进小程序包）

以下文件应只存在于云存储桶根目录，由 `mobile/src/config/index.js` 的 `cloudAsset()` 引用（微信云托管 CloudID 格式 `cloud://环境ID.存储桶ID/路径`，与控制台复制的一致，例如 `cloud://prod-d0gd8tvq9c6e19eb3.7072-prod-d0gd8tvq9c6e19eb3-1435802081/love-bg.png`）：

| 文件 | 用途 |
|------|------|
| `ailogo.png` | TabBar 中间 AI 球 |
| `love-bg.png` | 首页 / 日记背景 |
| `logo.png` | AI 页、我的页头像 |

**不要**放到 `mobile/static/` 或 `mobile/` 根目录。执行 `npm run build:mp-weixin -w @time-in-love/mobile` 会自动运行 `scripts/prune-cloud-static.cjs` 删除误拷贝的本地副本。
