# 仅构建 API（不含 Admin 静态页）。云托管推荐改用仓库根目录的 /Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/health || exit 1

CMD ["node", "src/index.js"]
