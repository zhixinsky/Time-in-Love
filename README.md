# 星芽恋记（Time in Love）

情侣空间微信小程序 monorepo：**小程序 + 微信云托管 API + 管理后台**。

## 目录结构

| 目录 | 说明 |
|------|------|
| `mobile/` | uni-app 微信小程序（原根目录 `src` 已迁入） |
| `api/` | Express API，按根目录 `Dockerfile` 部署**微信云托管** |
| `admin/` | React + Vite + TypeScript 运营后台，生产环境由 API 容器托管到 `/admin/` |
| `docs/` | 架构与接口说明 |

详细业务梳理见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

## 快速开始

```bash
# 根目录安装全部 workspace 依赖
npm install

# 小程序（微信开发者工具导入 mobile 编译产物 dist/dev/mp-weixin）
npm run dev:mobile

# 本地 API
npm run dev:api

# 管理后台（React）
npm run dev:admin
```

## 小程序开发注意

- `mobile/static/` 仅放必须本地的小图标（音乐按钮等）；**`ailogo.png`、`love-bg.png`、`logo.png` 只走云存储**（见 `mobile/src/config/index.js` 的 `cloud://`），勿放进 `static/` 或 `mobile/` 根目录
- 微信开发者工具导入路径：`mobile/dist/dev/mp-weixin` 或 `mobile/dist/build/mp-weixin`
- 对接 API 前在 `mobile/src/config/index.js` 配置云托管域名

## 云托管部署

你的环境 ID：`prod-d0gd8tvq9c6e19eb3`。当前根目录 `Dockerfile` 会把 **API + Admin** 打到同一个容器：

- API：`/api/v1`
- 管理后台：`/admin/`

完整步骤见 [docs/CLOUD_SETUP.md](./docs/CLOUD_SETUP.md)。

## 环境要求

- Node.js 18+
- 微信开发者工具（小程序 + 云托管）
