FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY api/src ./src
COPY api/scripts ./scripts

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "src/index.js"]
