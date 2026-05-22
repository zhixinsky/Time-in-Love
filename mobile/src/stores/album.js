import { defineStore } from 'pinia'
import { ref } from 'vue'
import albumApi from '../services/album'
import { useAuthStore } from './auth'

export const useAlbumStore = defineStore('album', () => {
  const list = ref([])
  const stats = ref({ images: 0, videos: 0 })
  const total = ref(0)
  const loading = ref(false)

  async function fetchList() {
    loading.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await albumApi.listMedia({ page: 1, pageSize: 60 })
      list.value = data.list || []
      stats.value = data.stats || { images: 0, videos: 0 }
      total.value = data.total || list.value.length
    } finally {
      loading.value = false
    }
  }

  return { list, stats, total, loading, fetchList }
})
