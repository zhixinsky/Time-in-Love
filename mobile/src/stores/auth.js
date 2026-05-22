import { defineStore } from 'pinia'
import { ref } from 'vue'
import authApi, { getStoredAuth } from '../services/auth'
import { AUTH_SPACE_KEY } from '../config'

export const useAuthStore = defineStore('auth', () => {
  const stored = getStoredAuth()
  const token = ref(stored.token || '')
  const user = ref(stored.user || null)
  const space = ref(stored.space || null)
  const loggingIn = ref(false)

  async function login() {
    if (loggingIn.value) return { token: token.value, user: user.value, space: space.value }
    loggingIn.value = true
    try {
      const data = await authApi.loginWithWechat()
      token.value = data.token
      user.value = data.user
      space.value = data.space
      return data
    } finally {
      loggingIn.value = false
    }
  }

  async function ensureLogin() {
    if (token.value && space.value?.id) return { token: token.value, user: user.value, space: space.value }
    return login()
  }

  function syncSpace(nextSpace) {
    space.value = nextSpace
    uni.setStorageSync(AUTH_SPACE_KEY, nextSpace)
  }

  return {
    token,
    user,
    space,
    loggingIn,
    login,
    ensureLogin,
    syncSpace
  }
})
