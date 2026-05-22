/**
 * 小程序运行配置
 * 云托管环境 ID：与微信云托管控制台一致
 */
export const WX_APP_ID = 'wxb76bea40dcb2999b'
export const WX_CLOUD_ENV_ID = 'prod-d0gd8tvq9c6e19eb3'

/**
 * 云托管「服务列表」里的名称（不是版本名！）
 * 控制台：云托管 → 服务管理 → 服务列表 → 服务名称
 * 若默认 api 报 INVALID_HOST，请改成你实际的名称（如 express-xxxx）
 */
export const WX_CLOUD_SERVICE = 'express-op14'

const isProd = process.env.NODE_ENV === 'production'

/** 本地开发：直连本机 API */
const DEV_HTTP_BASE = 'http://127.0.0.1:3000'

/**
 * 云托管公网 HTTPS 根地址（末尾不要 /）
 * 填写后走 HTTPS，不再走 callContainer（需在小程序后台配置 request 合法域名）
 * 例：https://api-xxxxx.ap-shanghai.app.tcloudbase.com
 * callContainer 报 INVALID_HOST 时，可优先填此项
 */
export const CLOUD_RUN_PUBLIC_BASE = ''

export const API_PREFIX = '/api/v1'

/**
 * 本地联调：true → http://127.0.0.1:3000（需勾选不校验合法域名）
 * false → 走云托管 wx.cloud.callContainer（无需配置 request 合法域名）
 */
export const USE_LOCAL_API = false

/** H5 / 本地调试走 HTTP */
export const API_BASE_URL = USE_LOCAL_API ? DEV_HTTP_BASE : CLOUD_RUN_PUBLIC_BASE || DEV_HTTP_BASE

/** 微信小程序走云托管 callContainer（需 USE_LOCAL_API=false 且已 wx.cloud.init） */
export const USE_CLOUD_CONTAINER = !USE_LOCAL_API && !CLOUD_RUN_PUBLIC_BASE

/** 无后端时是否仅用 Pinia mock */
export const USE_MOCK = false

/** 云存储桶（与云托管 COS_BUCKET 一致） */
export const COS_BUCKET = '7072-prod-d0gd8tvq9c6e19eb3-1435802081'

export function cloudAsset(key) {
  const path = String(key || '').replace(/^\//, '')
  return `cloud://${WX_CLOUD_ENV_ID}.${COS_BUCKET}/${path}`
}

export const CLOUD_LOGO = cloudAsset('logo.png')
export const CLOUD_AI_LOGO = cloudAsset('ailogo.png')
export const CLOUD_LOVE_BG = cloudAsset('love-bg.png')

/** 演示鉴权头，后续接微信登录 */
export const DEMO_USER_ID = 'u_me'
export const DEMO_SPACE_ID = 'space_demo'
export const AUTH_TOKEN_KEY = 'til_auth_token'
export const AUTH_USER_KEY = 'til_auth_user'
export const AUTH_SPACE_KEY = 'til_auth_space'

export function getAuthHeaders() {
  const token = uni.getStorageSync(AUTH_TOKEN_KEY)
  const space = uni.getStorageSync(AUTH_SPACE_KEY)
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      ...(space?.id ? { 'X-Space-Id': space.id } : {})
    }
  }
  return {
    'X-User-Id': DEMO_USER_ID,
    'X-Space-Id': DEMO_SPACE_ID
  }
}
