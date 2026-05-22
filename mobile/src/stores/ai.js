import { defineStore } from 'pinia'
import { ref } from 'vue'
import aiApi from '../services/ai'
import { useAuthStore } from './auth'

export const useAiStore = defineStore('ai', () => {
  const result = ref('')
  const generating = ref(false)
  const lastType = ref('')

  async function generate(type, input) {
    generating.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await aiApi.generate({ type, input })
      result.value = data.result
      lastType.value = data.type
      return data
    } finally {
      generating.value = false
    }
  }

  return { result, generating, lastType, generate }
})
