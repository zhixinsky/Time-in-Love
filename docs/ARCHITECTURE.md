# 星芽恋记 · 项目架构说明

## 一、Monorepo 目录

```
time-in-love/
├── mobile/          # 微信小程序（uni-app + Vue3 + Pinia）
├── api/             # 后端 API（Node.js + Express，部署微信云托管）
├── admin/           # 管理后台（Vue3 + Vite）
└── docs/            # 文档
```

## 二、业务模块映射

| 小程序页面/模块 | Pinia / 组件 | API 路由 | Admin |
|----------------|-------------|----------|-------|
| 首页 · 恋爱天数 | `stores/love` → space, loveDays | `GET /spaces/:id/dashboard` | 情侣空间列表 |
| 首页 · 快捷入口 | `pages/home` entries | 各子模块 API（待扩展） | — |
| 心动日记 | `stores/love.diary` | `GET /spaces/:id/diaries/latest` | 日记列表 |
| 今日心情 | `stores/love.moods` | `GET /spaces/:id/moods` | 概览统计 |
| 恋爱小记账 | `stores/love.bills` | `GET /spaces/:id/bills/summary` | 待扩展 |
| 纪念日 | `stores/love.anniversaries` | `GET /spaces/:id/anniversaries` | 待扩展 |
| AI 星芽 | `pages/ai` | 待接入大模型 | — |
| 我的 | `pages/profile` | `POST /auth/wechat-login` | 用户列表 |
| 底部 Tab + 发布 | `LoveTabBar` + `QuickSheet` | — | — |

## 三、数据流（目标态）

```
微信小程序 (mobile)
    │ wx.login → code
    ▼
POST /api/v1/auth/wechat-login  ──►  api (云托管)
    │                                  │
    │ token + spaceId                  ├─► 云数据库 / MySQL（下一阶段）
    ▼                                  │
GET /api/v1/spaces/:id/dashboard       │
    │                                  │
    ▼                                  ▼
Pinia store 渲染 UI              admin 管理端查询/运营
```

**当前阶段**：`api/src/data/seed.js` 内存假数据；`mobile` 默认仍用 Pinia 本地 mock，可通过配置切换请求 API。

## 四、微信云托管部署（api）

1. 微信开发者工具 → 云开发 → 云托管 → 新建服务
2. Git 构建：**仓库根目录** + **`/Dockerfile`**（详见 `docs/CLOUD_SETUP.md`）
3. 服务监听端口 **80**（`container.config.json` 已配置）
4. 获得公网域名后，填入 `mobile/src/config/index.js` 的 `prod` 地址
5. 小程序后台配置 **request 合法域名** 为该域名

本地调试：

```bash
npm run dev:api          # http://127.0.0.1:3000
npm run dev:admin        # http://127.0.0.1:5174 ，代理到 API
```

## 五、管理端鉴权

- 请求头：`x-admin-token: <ADMIN_TOKEN>`
- 环境变量：`api` 服务设置 `ADMIN_TOKEN`
- `admin` 概览页可保存 token 到 `localStorage`

## 六、后续迭代建议

1. **数据库**：云开发 MySQL 或 TencentDB，替换 `seed.js`
2. **登录**：`auth-controller` 接入 `code2Session` + JWT
3. **mobile**：在 `stores/love.js` 增加 `loadDashboard()` 调用 `services/space.js`
4. **对象存储**：相册、头像走 COS / 云存储
5. **CI**：云托管关联 Git 仓库自动构建 `api/Dockerfile`
