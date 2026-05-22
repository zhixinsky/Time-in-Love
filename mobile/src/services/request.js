import {
  API_BASE_URL,
  API_PREFIX,
  COS_BUCKET,
  USE_CLOUD_CONTAINER,
  WX_CLOUD_ENV_ID,
  WX_CLOUD_SERVICE,
  getAuthHeaders
} from '../config'

let cloudReady = false

/** 小程序启动时调用，避免 onLaunch 顺序导致 callContainer 失败 */
export function initCloudContainer() {
  // #ifdef MP-WEIXIN
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({ env: WX_CLOUD_ENV_ID, traceUser: true })
    cloudReady = true
    console.log('[cloud] init ok, env:', WX_CLOUD_ENV_ID, 'service:', WX_CLOUD_SERVICE)
    return true
  }
  // #endif
  return false
}

function ensureCloudContainer() {
  if (cloudReady) return true
  return initCloudContainer()
}

function withAuth(header = {}) {
  return { ...getAuthHeaders(), ...header }
}

function parseContainerBody(res) {
  const raw = res?.data ?? res
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed)
      } catch {
        return raw
      }
    }
    return raw
  }
  return raw
}

function normalizeBody(res) {
  const body = parseContainerBody(res)
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code !== 0) {
      return Promise.reject(body)
    }
    return body.data
  }
  return body
}

function formatCloudError(err) {
  const msg = String(err?.errMsg || err?.message || err || '')
  if (/INVALID_HOST|invalid host|-501000/i.test(msg)) {
    return new Error(
      `云托管 INVALID_HOST：请在开发者工具「云开发」选择环境 ${WX_CLOUD_ENV_ID}，并在 config 中把 WX_CLOUD_SERVICE 改成控制台「服务列表」里的名称（当前为 ${WX_CLOUD_SERVICE}，不要带版本号）。或填写 CLOUD_RUN_PUBLIC_BASE 走公网 HTTPS。`
    )
  }
  return err instanceof Error ? err : new Error(msg || '请求失败')
}

/** 微信云托管 callContainer */
function cloudRequest(path, options = {}) {
  const { method = 'GET', data, header = {}, timeout = 30000 } = options

  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!ensureCloudContainer()) {
      reject(new Error('请先 wx.cloud.init'))
      return
    }
    const reqPath = `${API_PREFIX}${path}`
    wx.cloud.callContainer({
      config: { env: WX_CLOUD_ENV_ID },
      path: reqPath,
      method,
      timeout,
      header: withAuth({
        'X-WX-SERVICE': WX_CLOUD_SERVICE,
        'content-type': 'application/json',
        ...header
      }),
      data: data ?? {},
      success(res) {
        const status = res?.statusCode ?? 200
        if (status >= 200 && status < 300) {
          try {
            resolve(normalizeBody(res))
          } catch (e) {
            reject(e)
          }
          return
        }
        const body = parseContainerBody(res)
        reject(body?.message ? new Error(body.message) : new Error(`HTTP ${status}`))
      },
      fail(err) {
        reject(formatCloudError(err))
      }
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('callContainer 仅支持微信小程序'))
    // #endif
  })
}

/** 云托管公网 HTTPS / 本地 HTTP */
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
  if (USE_CLOUD_CONTAINER === true) {
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

/** 与 Moona 一致：仅 getTempFileURL，失败则保留 cloud://（海报/分享等需 HTTPS 时用） */
const cloudTempUrlCache = new Map()

export function resolveCloudFileUrl(fileId) {
  const fileID = String(fileId || '').trim()
  if (!fileID || !fileID.startsWith('cloud://')) return Promise.resolve(fileID)
  const cached = cloudTempUrlCache.get(fileID)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    if (!ensureCloudContainer() || typeof wx === 'undefined' || !wx.cloud?.getTempFileURL) {
      resolve(fileID)
      return
    }
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success(res) {
        const tempUrl = res?.fileList?.[0]?.tempFileURL || ''
        if (tempUrl) {
          cloudTempUrlCache.set(fileID, tempUrl)
          resolve(tempUrl)
          return
        }
        resolve(fileID)
      },
      fail: () => resolve(fileID)
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(fileID)
    // #endif
  })
}

export function uploadFile(path, filePath, formData = {}) {
  // #ifdef MP-WEIXIN
  if (USE_CLOUD_CONTAINER && typeof wx !== 'undefined' && wx.cloud) {
    ensureCloudContainer()
    const ext = String(filePath || '').split('.').pop() || (path.includes('video') ? 'mp4' : 'jpg')
    const folder = path.includes('video') ? 'uploads/videos' : 'avatars'
    const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success(res) {
          resolve({
            url: res.fileID,
            coverUrl: res.fileID,
            duration: Number(formData.duration || 0)
          })
        },
        fail: reject
      })
    })
  }
  // #endif

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
