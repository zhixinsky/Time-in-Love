import dotenv from 'dotenv'

dotenv.config()

/** 解析云托管 MYSQL_ADDRESS（格式：host 或 host:port） */
function parseMysqlAddress(raw) {
  const value = (raw || '').trim()
  if (!value) return { host: '', port: 3306 }
  if (value.includes(':')) {
    const [host, port] = value.split(':')
    return { host: host.trim(), port: Number(port) || 3306 }
  }
  return { host: value, port: 3306 }
}

const mysqlFromAddress = parseMysqlAddress(process.env.MYSQL_ADDRESS)
const mysqlHost = mysqlFromAddress.host || process.env.MYSQL_HOST || ''
const mysqlPort = mysqlFromAddress.port || Number(process.env.MYSQL_PORT || 3306)

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  adminToken: process.env.ADMIN_TOKEN || 'dev-admin-token-change-me',
  jwtSecret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'til-admin-jwt-change-me',
  wx: {
    appId: process.env.WX_APPID || 'wxb76bea40dcb2999b',
    appSecret: process.env.WX_APP_SECRET || '',
    cloudEnvId: process.env.WX_CLOUD_ENV_ID || 'prod-d0gd8tvq9c6e19eb3'
  },
  mysql: {
    host: mysqlHost,
    port: mysqlPort,
    /** 云托管注入：MYSQL_USERNAME；本地 .env 可用 MYSQL_USER */
    user: process.env.MYSQL_USERNAME || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'love'
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'xiaomi',
    apiKey: process.env.XIAOMI_API_KEY || process.env.AI_API_KEY || '',
    baseUrl: process.env.XIAOMI_AI_BASE_URL || process.env.AI_BASE_URL || 'https://api.mimo-v2.com/v1',
    model: process.env.XIAOMI_AI_MODEL || process.env.AI_MODEL || 'mimo-v2-flash',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 20000)
  },
  music: {
    cloudEnv: process.env.LOVE_MUSIC_CLOUD_ENV || process.env.WX_CLOUD_ENV_ID || 'prod-d0gd8tvq9c6e19eb3',
    /** 云托管注入：COS_BUCKET / COS_REGION */
    bucket:
      process.env.COS_BUCKET ||
      process.env.LOVE_MUSIC_COS_BUCKET ||
      '7072-prod-d0gd8tvq9c6e19eb3-1435802081',
    region: process.env.COS_REGION || process.env.LOVE_MUSIC_COS_REGION || 'ap-shanghai',
    prefix: process.env.LOVE_MUSIC_COS_PREFIX || 'music/',
    coverKey: process.env.LOVE_MUSIC_COVER_KEY || 'love-bg.png'
  }
}
