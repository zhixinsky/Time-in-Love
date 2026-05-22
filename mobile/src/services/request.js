import {
  API_BASE_URL,
  API_PREFIX,
  USE_CLOUD_CONTAINER,
  WX_CLOUD_ENV_ID,
  WX_CLOUD_SERVICE,
  getAuthHeaders
} from '../config'

function withAuth(header = {}) {
  return { ...getAuthHeaders(), ...header }
}

function normalizeBody(res) {
  const body = res?.data ?? res
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code !== 0) {
      return Promise.reject(body)
    }
    return body.data
  }
  return body
}

/** 微信云托管 callContainer（需在 app 中 wx.cloud.init） */
function cloudRequest(path, options = {}) {
  const { method = 'GET', data, header = {} } = options

  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud) {
      reject(new Error('请先 wx.cloud.init'))
      return
    }
    wx.cloud.callContainer({
      config: { env: WX_CLOUD_ENV_ID },
      path: `${API_PREFIX}${path}`,
      method,
      header: withAuth({
        'X-WX-SERVICE': WX_CLOUD_SERVICE,
        'Content-Type': 'application/json',
        ...header
      }),
      data,
      success(res) {
        try {
          resolve(normalizeBody(res))
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('callContainer 仅支持微信小程序'))
    // #endif
  })
}

/** 本地 / 公网域名 HTTP */
function httpRequest(path, options = {}) {
  const { method = 'GET', data, header = {} } = options
  const url = `${API_BASE_URL}${API_PREFIX}${path}`

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: withAuth({
        'Content-Type': 'application/json',
        ...header
      }),
      success(res) {
        try {
          resolve(normalizeBody(res))
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
  })
}

export function request(path, options = {}) {
  if (USE_CLOUD_CONTAINER) {
    return cloudRequest(path, options)
  }
  return httpRequest(path, options)
}

export function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`
  return url
}

export function uploadFile(path, filePath, formData = {}) {
  const url = `${API_BASE_URL}${API_PREFIX}${path}`
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      formData,
      header: withAuth(),
      success(res) {
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (body.code !== 0) reject(body)
          else resolve(body.data)
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
  })
}

export default request
