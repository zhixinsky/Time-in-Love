/**
 * 小程序运行配置
 * 云托管环境 ID：与微信云托管控制台一致
 */
export const WX_APP_ID = 'wxb76bea40dcb2999b'
export const WX_CLOUD_ENV_ID = 'prod-d0gd8tvq9c6e19eb3'

/** 云托管服务名称（在微信云托管创建服务时的名称，默认 api） */
export const WX_CLOUD_SERVICE = 'api'

const isProd = process.env.NODE_ENV === 'production'

/** 本地开发：直连本机 API */
const DEV_HTTP_BASE = 'http://127.0.0.1:3000'

/**
 * 生产：填云托管公网 HTTPS 域名（控制台 → 服务 → 公网访问）
 * 留空则小程序内使用 wx.cloud.callContainer 调用
 */
export const CLOUD_RUN_PUBLIC_BASE = ''

export const API_PREFIX = '/api/v1'

/** H5 / 本地调试走 HTTP */
export const API_BASE_URL = DEV_HTTP_BASE

/** 微信小程序生产优先走 callContainer */
export const USE_CLOUD_CONTAINER = isProd && !CLOUD_RUN_PUBLIC_BASE

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
