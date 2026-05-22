# Mobile · 微信小程序

uni-app 3 + Vue 3 + Pinia，目标平台：微信小程序（Skyline）。

## 开发

```bash
npm install   # 在 monorepo 根目录执行一次即可
npm run dev:mp-weixin -w @time-in-love/mobile
```

用微信开发者工具打开：`mobile/dist/dev/mp-weixin`

## 云存储图片（勿打进包）

`ailogo.png`、`love-bg.png`、`logo.png` 仅使用 `src/config/index.js` 中的 `cloud://` 地址，**不要**放在 `mobile/static/` 或 `mobile/` 根目录。生产构建会执行 `scripts/prune-cloud-static.cjs` 清理误拷贝文件。

## 目录

```
mobile/src/
├── pages/           # 页面
│   ├── home/        # 首页（天数、快捷入口、心情、记账）
│   ├── diary/       # 心动日记
│   ├── bill/        # 小记账
│   ├── ai/          # AI 星芽
│   └── profile/     # 我的
├── components/      # LoveTabBar、QuickSheet、LineIcon
├── stores/love.js   # 全局业务状态（当前 mock）
├── services/        # API 请求封装
│   ├── api.js
│   └── space.js
├── config/          # API 基地址
├── styles/          # 主题
└── utils/date.js
```

## 对接 API

1. 启动 `npm run dev:api`
2. 开发者工具勾选「不校验合法域名」
3. 将 `src/config/index.js` 中 `dev` 地址设为 `http://127.0.0.1:3000`
4. 在 store 或页面调用 `fetchSpaceDashboard()`（见 `services/space.js`）

生产环境填写云托管 HTTPS 域名到 `prod`，并在小程序后台配置合法域名。
