import request from './request'
import { AUTH_SPACE_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../config'

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res.code),
      fail: reject
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(`dev_${Date.now()}`)
    // #endif
  })
}

export async function loginWithWechat() {
  const code = await wxLoginCode()
  const data = await request('/auth/wechat-login', {
    method: 'POST',
    data: { code }
  })
  uni.setStorageSync(AUTH_TOKEN_KEY, data.token)
  uni.setStorageSync(AUTH_USER_KEY, data.user)
  uni.setStorageSync(AUTH_SPACE_KEY, data.space)
  return data
}

export function getStoredAuth() {
  return {
    token: uni.getStorageSync(AUTH_TOKEN_KEY),
    user: uni.getStorageSync(AUTH_USER_KEY),
    space: uni.getStorageSync(AUTH_SPACE_KEY)
  }
}

export function clearAuth() {
  uni.removeStorageSync(AUTH_TOKEN_KEY)
  uni.removeStorageSync(AUTH_USER_KEY)
  uni.removeStorageSync(AUTH_SPACE_KEY)
}

export default {
  loginWithWechat,
  getStoredAuth,
  clearAuth
}
