import { defineStore } from 'pinia'
import { ref } from 'vue'
import billApi from '../services/bill'
import { useAuthStore } from './auth'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export const useBillStore = defineStore('bill', () => {
  const month = ref(currentMonth())
  const list = ref([])
  const summary = ref({ month: month.value, expense: 0, income: 0, categories: [] })
  const loading = ref(false)

  async function fetchList(nextMonth = month.value) {
    loading.value = true
    try {
      await useAuthStore().ensureLogin()
      month.value = nextMonth || currentMonth()
      const data = await billApi.list({ month: month.value })
      list.value = data.list || []
      summary.value = data.summary || { month: month.value, expense: 0, income: 0, categories: [] }
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    await useAuthStore().ensureLogin()
    await billApi.create(payload)
    await fetchList(month.value)
  }

  async function remove(id) {
    await billApi.remove(id)
    await fetchList(month.value)
  }

  return { month, list, summary, loading, fetchList, create, remove }
})
