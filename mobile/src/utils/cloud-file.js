import { WX_CLOUD_ENV_ID } from '../config'

/**
 * 将 cloud:// fileID 转为可展示的本地临时路径或 HTTPS 签名链接
 * 切勿把 cloud:// 或 COS 直链交给 Skyline image/audio，否则会 ERR_HTTP2
 */
const cache = new Map()

function remember(fileId, url) {
  if (url) cache.set(fileId, url)
  return url
}

function fetchTempUrl(fileId) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileId],
      success(res) {
        const item = res?.fileList?.[0]
        if (item?.tempFileURL) {
          resolve(remember(fileId, item.tempFileURL))
          return
        }
        reject(new Error(item?.errMsg || 'getTempFileURL failed'))
      },
      fail: reject
    })
  })
}

function downloadToLocal(fileId) {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({
      fileID: fileId,
      success(res) {
        if (res?.tempFilePath) {
          resolve(remember(fileId, res.tempFilePath))
          return
        }
        reject(new Error('downloadFile: empty tempFilePath'))
      },
      fail: reject
    })
  })
}

export function initCloudStorage() {
  // #ifdef MP-WEIXIN
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({ env: WX_CLOUD_ENV_ID, traceUser: true })
    return true
  }
  // #endif
  return false
}

export function resolveCloudFileUrl(fileId) {
  const id = String(fileId || '').trim()
  if (!id) return Promise.resolve('')
  if (!id.startsWith('cloud://')) return Promise.resolve(id)
  if (cache.has(id)) return Promise.resolve(cache.get(id))

  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    initCloudStorage()
    if (typeof wx === 'undefined' || !wx.cloud) {
      reject(new Error('wx.cloud 不可用'))
      return
    }
    downloadToLocal(id)
      .then(resolve)
      .catch(() => fetchTempUrl(id).then(resolve).catch(reject))
    // #endif
    // #ifndef MP-WEIXIN
    resolve(id)
    // #endif
  })
}
