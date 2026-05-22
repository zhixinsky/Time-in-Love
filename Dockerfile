# 微信云托管：请在仓库根目录构建（Dockerfile 路径 = /Dockerfile，构建上下文 = 仓库根目录）
# 勿使用「代码目录 api/ + 根目录 Dockerfile」，会导致 COPY 路径错误、构建无日志或失败

FROM node:20-alpine AS admin-builder

WORKDIR /admin
COPY admin/package.json ./
RUN npm config set registry https://registry.npmjs.org/ \
  && npm install --no-audit --no-fund

COPY admin ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY api/package.json ./
RUN npm config set registry https://registry.npmjs.org/ \
  && npm install --omit=dev --no-audit --no-fund

COPY api/src ./src
COPY api/scripts ./scripts
COPY --from=admin-builder /admin/dist ./admin-dist

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/health || exit 1

CMD ["node", "src/index.js"]
