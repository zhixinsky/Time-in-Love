import { defineStore } from 'pinia'
import { ref } from 'vue'
import checklistApi from '../services/checklist'
import { useAuthStore } from './auth'

export const useChecklistStore = defineStore('checklist', () => {
  const list = ref([])
  const summary = ref({ total: 0, completed: 0, rate: 0 })
  const loading = ref(false)

  async function fetchList() {
    loading.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await checklistApi.list()
      list.value = data.list || []
      summary.value = data.summary || { total: 0, completed: 0, rate: 0 }
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    await checklistApi.create(payload)
    await fetchList()
  }

  async function toggle(item) {
    await checklistApi.update(item.id, { completed: !item.completed })
    await fetchList()
  }

  async function remove(id) {
    await checklistApi.remove(id)
    await fetchList()
  }

  return { list, summary, loading, fetchList, create, toggle, remove }
})
