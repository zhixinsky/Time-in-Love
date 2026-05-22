FROM node:20-alpine AS admin-builder

WORKDIR /workspace

COPY package*.json ./
COPY admin/package.json ./admin/package.json
COPY api/package.json ./api/package.json
RUN npm install

COPY admin ./admin
RUN npm run build -w @time-in-love/admin

FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY api/src ./src
COPY api/scripts ./scripts
COPY --from=admin-builder /workspace/admin/dist ./admin-dist

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "src/index.js"]
