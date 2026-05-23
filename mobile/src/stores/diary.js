import { defineStore } from 'pinia'
import { ref } from 'vue'
import diaryApi from '../services/diary'
import { useAuthStore } from './auth'
import { formatYmd, normalizeYmd } from '../utils/diary-date'

export const useDiaryStore = defineStore('diary', () => {
  const selectedDate = ref(formatYmd(new Date()))
  const currentDiary = ref(null)
  const currentMedia = ref([])
  const currentAuthor = ref(null)
  const aiSummary = ref('')
  const timelineList = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const aiGenerating = ref(false)

  let timelinePromise = null
  const lastFetchedDate = ref('')

  async function selectDate(date) {
    const ymd = normalizeYmd(date)
    if (!ymd) return
    selectedDate.value = ymd
    const cached =
      currentDiary.value?.id && normalizeYmd(currentDiary.value.diaryDate) === ymd
    await fetchDiaryByDate(ymd, { silent: cached })
  }

  function applyDiaryDetail(data) {
    const diaryRow = data?.diary || null
    currentDiary.value = diaryRow
    currentMedia.value = data?.mediaList || []
    currentAuthor.value = data?.author || null
    aiSummary.value = data?.aiSummary || diaryRow?.aiSummary || ''
    if (diaryRow?.diaryDate) {
      selectedDate.value = normalizeYmd(diaryRow.diaryDate)
    }
  }

  async function fetchDiaryByDate(date = selectedDate.value, options = {}) {
    const { silent = false, skipAuth = false } = options
    const ymd = normalizeYmd(date)
    if (!ymd) return

    const hasCached =
      currentDiary.value?.id && normalizeYmd(currentDiary.value.diaryDate) === ymd
    if (!silent && !hasCached) loading.value = true

    try {
      if (!skipAuth) await useAuthStore().ensureLogin()
      const data = await diaryApi.getByDate(ymd)
      applyDiaryDetail(data)
      lastFetchedDate.value = ymd
    } catch (e) {
      if (!hasCached) {
        currentDiary.value = null
        currentMedia.value = []
        currentAuthor.value = null
        aiSummary.value = ''
      }
      console.warn('[diary] fetchByDate failed', e)
    } finally {
      if (!silent || !hasCached) loading.value = false
    }
  }

  async function fetchDiaryById(id, options = {}) {
    if (!id) return
    const { skipAuth = false } = options
    loading.value = true
    try {
      if (!skipAuth) await useAuthStore().ensureLogin()
      const data = await diaryApi.getDetail(id)
      applyDiaryDetail(data)
      if (data?.diary?.diaryDate) {
        lastFetchedDate.value = normalizeYmd(data.diary.diaryDate)
      }
    } catch (e) {
      currentDiary.value = null
      currentMedia.value = []
      currentAuthor.value = null
      aiSummary.value = ''
      console.warn('[diary] fetchById failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeline(pageSize = 10, page = 1, options = {}) {
    const { skipAuth = false } = options
    if (timelinePromise) return timelinePromise

    timelinePromise = (async () => {
      try {
        if (!skipAuth) await useAuthStore().ensureLogin()
        const data = await diaryApi.getTimeline(page, pageSize)
        const list = Array.isArray(data) ? data : data?.list || data?.items || []
        timelineList.value = list
        return list
      } catch (e) {
        console.warn('[diary] fetchTimeline failed', e)
        return timelineList.value
      } finally {
        timelinePromise = null
      }
    })()

    return timelinePromise
  }

  async function createDiary(payload) {
    submitting.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await diaryApi.create(payload)
      await refreshAfterSave(payload.diaryDate)
      return data
    } finally {
      submitting.value = false
    }
  }

  async function updateDiary(id, payload) {
    submitting.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await diaryApi.update(id, payload)
      await refreshAfterSave(payload.diaryDate || selectedDate.value)
      return data
    } finally {
      submitting.value = false
    }
  }

  async function deleteDiary(id) {
    await useAuthStore().ensureLogin()
    await diaryApi.remove(id)
    await refreshAfterSave(selectedDate.value)
  }

  async function generateAiSummary(id) {
    aiGenerating.value = true
    try {
      await useAuthStore().ensureLogin()
      const data = await diaryApi.generateAiSummary(id)
      if (data?.diary) {
        currentDiary.value = data.diary
        aiSummary.value = data.aiSummary || data.diary.aiSummary || ''
      }
      return data
    } finally {
      aiGenerating.value = false
    }
  }

  async function refreshAfterSave(date) {
    if (date && date !== selectedDate.value) {
      selectedDate.value = normalizeYmd(date)
    }
    await useAuthStore().ensureLogin()
    await Promise.all([
      fetchDiaryByDate(selectedDate.value, { skipAuth: true }),
      fetchTimeline(10, 1, { skipAuth: true })
    ])
  }

  /** 优先展示当日日记，时间线在后台刷新 */
  async function initPage() {
    await useAuthStore().ensureLogin()
    const ymd = selectedDate.value
    const alreadyLoaded = lastFetchedDate.value === ymd

    if (alreadyLoaded) {
      void fetchDiaryByDate(ymd, { skipAuth: true, silent: true })
    } else {
      await fetchDiaryByDate(ymd, { skipAuth: true })
    }
    void fetchTimeline(10, 1, { skipAuth: true })
  }

  return {
    selectedDate,
    currentDiary,
    currentMedia,
    currentAuthor,
    aiSummary,
    timelineList,
    loading,
    submitting,
    aiGenerating,
    selectDate,
    fetchDiaryByDate,
    fetchDiaryById,
    fetchTimeline,
    createDiary,
    updateDiary,
    deleteDiary,
    generateAiSummary,
    initPage
  }
})
