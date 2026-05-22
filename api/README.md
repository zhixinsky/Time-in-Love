# API · 微信云托管

Node.js + Express，默认端口本地 `3000`，容器内 `80`。

## 本地运行

```bash
cd api
npm install
npm run dev
```

健康检查：`GET http://127.0.0.1:3000/api/v1/health`

## 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/health` | 健康检查 |
| POST | `/api/v1/auth/wechat-login` | 微信登录（演示） |
| GET | `/api/v1/spaces/:spaceId/dashboard` | 首页仪表盘 |
| GET | `/api/v1/spaces/:spaceId/anniversaries` | 纪念日 |
| GET | `/api/v1/spaces/:spaceId/moods` | 心情 |
| GET | `/api/v1/spaces/:spaceId/bills/summary` | 记账汇总 |
| GET | `/api/v1/spaces/:spaceId/diaries/latest` | 最新日记 |
| GET | `/api/v1/admin/*` | 管理端（需 `x-admin-token`） |

## 云托管部署步骤

1. 打开 [微信云托管控制台](https://cloud.weixin.qq.com/cloudrun)
2. 新建服务 → 选择「上传代码包」或关联 Git
3. 构建目录选 `api/`，Dockerfile 使用仓库内 `api/Dockerfile`
4. 发布版本，记录**公网访问地址**
5. 配置环境变量（可选）：
   - `ADMIN_TOKEN`：管理后台密钥
   - `NODE_ENV=production`

## 目录说明

```
api/src/
├── index.js          # 入口
├── app.js            # Express 应用
├── config/           # 端口、密钥
├── routes/           # 路由汇总
├── controllers/      # 请求处理
├── services/         # 业务逻辑
├── middleware/       # 鉴权、错误处理
├── data/seed.js      # 演示数据（待换数据库）
└── utils/date.js     # 日期工具
```
