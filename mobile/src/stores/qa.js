import { defineStore } from 'pinia'
import { ref } from 'vue'
import qaApi from '../services/qa'
import { useAuthStore } from './auth'

export const useQaStore = defineStore('qa', () => {
  const today = ref(null)
  const history = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      await useAuthStore().ensureLogin()
      const [todayData, historyData] = await Promise.all([qaApi.today(), qaApi.history()])
      today.value = todayData
      history.value = historyData || []
    } finally {
      loading.value = false
    }
  }

  async function answer(content) {
    await qaApi.answer(content)
    await fetchAll()
  }

  return { today, history, loading, fetchAll, answer }
})
