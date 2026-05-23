import { defineStore } from 'pinia'
import { ref } from 'vue'
import authApi, { getStoredAuth } from '../services/auth'
import { AUTH_SPACE_KEY, AUTH_TOKEN_KEY } from '../config'

export const useAuthStore = defineStore('auth', () => {
  const stored = getStoredAuth()
  const token = ref(stored.token || '')
  const user = ref(stored.user || null)
  const space = ref(stored.space || null)
  const loggingIn = ref(false)
  let loginPromise = null

  async function login() {
    if (loggingIn.value && loginPromise) return loginPromise
    if (token.value && space.value?.id) {
      return { token: token.value, user: user.value, space: space.value }
    }
    loggingIn.value = true
    loginPromise = authApi
      .loginWithWechat()
      .then((data) => {
        token.value = data.token
        user.value = data.user
        space.value = data.space
        return data
      })
      .finally(() => {
        loggingIn.value = false
        loginPromise = null
      })
    return loginPromise
  }

  async function ensureLogin() {
    if (token.value && space.value?.id) {
      return { token: token.value, user: user.value, space: space.value }
    }
    if (loginPromise) return loginPromise
    return login()
  }

  function syncSpace(nextSpace) {
    space.value = nextSpace
    uni.setStorageSync(AUTH_SPACE_KEY, nextSpace)
  }

  function applySession(data) {
    if (data.token) {
      token.value = data.token
      uni.setStorageSync(AUTH_TOKEN_KEY, data.token)
    }
    if (data.space) syncSpace(data.space)
    if (data.user) user.value = data.user
  }

  return {
    token,
    user,
    space,
    loggingIn,
    login,
    ensureLogin,
    syncSpace,
    applySession
  }
})
