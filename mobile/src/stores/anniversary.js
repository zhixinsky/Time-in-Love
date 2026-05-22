import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import anniversaryApi from '../services/anniversary'
import { useAuthStore } from './auth'

function toDate(value) {
  return new Date(`${value}T00:00:00`)
}

function daysUntil(date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let target = toDate(date)
  target = new Date(today.getFullYear(), target.getMonth(), target.getDate())
  if (target < today) target.setFullYear(target.getFullYear() + 1)
  return Math.round((target - today) / 86400000)
}

export const useAnniversaryStore = defineStore('anniversary', () => {
  const list = ref([])
  const loading = ref(false)

  const upcoming = computed(() =>
    list.value
      .map((item) => ({ ...item, remainDays: item.repeatType === 'yearly' ? daysUntil(item.date) : 0 }))
      .sort((a, b) => a.remainDays - b.remainDays)
  )

  async function fetchList() {
    loading.value = true
    try {
      await useAuthStore().ensureLogin()
      list.value = await anniversaryApi.list()
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    await useAuthStore().ensureLogin()
    const item = await anniversaryApi.create(payload)
    list.value = [...list.value, item]
    return item
  }

  async function update(id, payload) {
    const item = await anniversaryApi.update(id, payload)
    list.value = list.value.map((old) => (old.id === id ? item : old))
    return item
  }

  async function remove(id) {
    await anniversaryApi.remove(id)
    list.value = list.value.filter((item) => item.id !== id)
  }

  return { list, upcoming, loading, fetchList, create, update, remove }
})
