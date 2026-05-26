import { defineStore } from 'pinia'
import { ref } from 'vue'
import diaryApi from '../services/diary'
import { useAuthStore } from './auth'
import { buildRecentDays, formatYmd, normalizeYmd } from '../utils/diary-date'

export const useDiaryStore = defineStore('diary', () => {
  const selectedDate = ref(formatYmd(new Date()))
  const currentDiary = ref(null)
  const currentMedia = ref([])
  const currentAuthor = ref(null)
  const aiSummary = ref('')
  const timelineList = ref([])
  const recentDiaryMarks = ref({})
  const resolvedDiaryMarks = ref({})
  const loading = ref(false)
  const submitting = ref(false)
  const aiGenerating = ref(false)

  const diaryDetailCache = new Map()
  const diaryDetailPromiseMap = new Map()
  let timelinePromise = null
  let warmRecentPromise = null
  let warmRecentKey = ''
  let activeDiaryRequestId = 0
  const lastFetchedDate = ref('')

  async function selectDate(date) {
    const todayYmd = formatYmd(new Date())
    const normalized = normalizeYmd(date)
    const ymd = normalized && normalized > todayYmd ? todayYmd : normalized
    if (!ymd) return
    selectedDate.value = ymd
    const cachedDetail = getCachedDiaryDetail(ymd)
    if (cachedDetail) {
      applyDiaryDetail(cachedDetail, { syncSelectedDate: false })
      lastFetchedDate.value = ymd
      loading.value = false
      void fetchDiaryByDate(ymd, { silent: true, skipAuth: true })
      return
    }
    if (isRecentDate(ymd)) {
      void warmRecentDays({ skipAuth: true })
    }
    await fetchDiaryByDate(ymd)
  }

  function recentDateKeys(count = 7, endDate = formatYmd(new Date())) {
    return buildRecentDays(count, endDate).map((item) => item.ymd)
  }

  function isRecentDate(date, count = 7, endDate = formatYmd(new Date())) {
    const ymd = normalizeYmd(date)
    return recentDateKeys(count, endDate).includes(ymd)
  }

  function normalizeDiaryDetail(data) {
    return {
      diary: data?.diary || null,
      mediaList: Array.isArray(data?.mediaList) ? data.mediaList : [],
      author: data?.author || null,
      aiSummary: data?.aiSummary || data?.diary?.aiSummary || ''
    }
  }

  function cacheDiaryDetail(date, data) {
    const ymd = normalizeYmd(date || data?.diary?.diaryDate)
    if (!ymd) return
    const detail = normalizeDiaryDetail(data)
    diaryDetailCache.set(ymd, detail)
    resolvedDiaryMarks.value = {
      ...resolvedDiaryMarks.value,
      [ymd]: true
    }
    recentDiaryMarks.value = {
      ...recentDiaryMarks.value,
      [ymd]: Boolean(detail.diary)
    }
  }

  function getCachedDiaryDetail(date) {
    const ymd = normalizeYmd(date)
    if (!ymd) return null
    return diaryDetailCache.get(ymd) || null
  }

  function cacheEmptyDiaryDetail(date) {
    const ymd = normalizeYmd(date)
    if (!ymd) return
    diaryDetailPromiseMap.delete(ymd)
    diaryDetailCache.set(ymd, normalizeDiaryDetail(null))
    resolvedDiaryMarks.value = {
      ...resolvedDiaryMarks.value,
      [ymd]: true
    }
    recentDiaryMarks.value = {
      ...recentDiaryMarks.value,
      [ymd]: false
    }
  }

  function syncRecentMarksFromTimeline(list = []) {
    const nextMarks = { ...recentDiaryMarks.value }
    for (const item of list) {
      const ymd = normalizeYmd(item?.date)
      if (!ymd || !isRecentDate(ymd)) continue
      nextMarks[ymd] = true
    }
    recentDiaryMarks.value = nextMarks
  }

  function applyRecentDetails(items = []) {
    const nextMarks = {}
    const nextResolved = {}
    for (const item of items) {
      const ymd = normalizeYmd(item?.date)
      if (!ymd) continue
      nextMarks[ymd] = Boolean(item?.hasDiary)
      nextResolved[ymd] = true
      diaryDetailPromiseMap.delete(ymd)
      diaryDetailCache.set(ymd, normalizeDiaryDetail(item?.detail))
    }
    recentDiaryMarks.value = nextMarks
    resolvedDiaryMarks.value = {
      ...resolvedDiaryMarks.value,
      ...nextResolved
    }
  }

  async function fetchDiaryDetailData(ymd, options = {}) {
    const { skipAuth = false } = options
    const key = normalizeYmd(ymd)
    if (!key) return normalizeDiaryDetail(null)
    const inflight = diaryDetailPromiseMap.get(key)
    if (inflight) return inflight

    const requestPromise = (async () => {
      if (!skipAuth) await useAuthStore().ensureLogin()
      const data = normalizeDiaryDetail(await diaryApi.getByDate(key))
      cacheDiaryDetail(key, data)
      return data
    })().finally(() => {
      diaryDetailPromiseMap.delete(key)
    })

    diaryDetailPromiseMap.set(key, requestPromise)
    return requestPromise
  }

  async function warmRecentDays(options = {}) {
    const { skipAuth = false } = options
    const todayYmd = formatYmd(new Date())
    const requestKey = `7:${todayYmd}`
    if (warmRecentPromise && warmRecentKey === requestKey) return warmRecentPromise

    warmRecentPromise = (async () => {
      if (!skipAuth) await useAuthStore().ensureLogin()
      try {
        const data = await diaryApi.getRecentDetails(7, todayYmd)
        applyRecentDetails(data?.items || [])
        return data?.items || []
      } catch (error) {
        console.warn('[diary] recent-details unavailable, fallback to single fetch', error)
        const fallbackDates = recentDateKeys(7, todayYmd)
        const items = await Promise.all(
          fallbackDates.map(async (ymd) => {
            try {
              const detail = await fetchDiaryDetailData(ymd, { skipAuth: true })
              return {
                date: ymd,
                hasDiary: Boolean(detail?.diary),
                detail
              }
            } catch (e) {
              console.warn('[diary] warmRecentDays fallback failed', ymd, e)
              return {
                date: ymd,
                hasDiary: false,
                detail: normalizeDiaryDetail(null)
              }
            }
          })
        )
        applyRecentDetails(items)
        return items
      }
    })().finally(() => {
      warmRecentPromise = null
      warmRecentKey = ''
    })

    warmRecentKey = requestKey
    return warmRecentPromise
  }

  function applyDiaryDetail(data, options = {}) {
    const { syncSelectedDate = false } = options
    const detail = normalizeDiaryDetail(data)
    const diaryRow = detail.diary
    currentDiary.value = diaryRow
    currentMedia.value = detail.mediaList
    currentAuthor.value = detail.author
    aiSummary.value = detail.aiSummary
    if (syncSelectedDate && diaryRow?.diaryDate) {
      selectedDate.value = normalizeYmd(diaryRow.diaryDate)
    }
  }

  async function fetchDiaryByDate(date = selectedDate.value, options = {}) {
    const { silent = false, skipAuth = false } = options
    const ymd = normalizeYmd(date)
    if (!ymd) return

    const requestId = ++activeDiaryRequestId
    const cachedDetail = getCachedDiaryDetail(ymd)
    const hasCurrent =
      currentDiary.value?.id && normalizeYmd(currentDiary.value.diaryDate) === ymd
    const hasCached = Boolean(cachedDetail) || hasCurrent
    if (cachedDetail && !hasCurrent) {
      applyDiaryDetail(cachedDetail, { syncSelectedDate: false })
      lastFetchedDate.value = ymd
    }
    if (!silent && !hasCached) loading.value = true

    try {
      const data = await fetchDiaryDetailData(ymd, { skipAuth })
      if (requestId !== activeDiaryRequestId) return
      applyDiaryDetail(data, { syncSelectedDate: false })
      lastFetchedDate.value = ymd
    } catch (e) {
      if (requestId !== activeDiaryRequestId) return
      if (!hasCached) {
        currentDiary.value = null
        currentMedia.value = []
        currentAuthor.value = null
        aiSummary.value = ''
      }
      console.warn('[diary] fetchByDate failed', e)
    } finally {
      if (requestId === activeDiaryRequestId && (!silent || !hasCached)) loading.value = false
    }
  }

  async function fetchDiaryById(id, options = {}) {
    if (!id) return
    const { skipAuth = false } = options
    const requestId = ++activeDiaryRequestId
    loading.value = true
    try {
      if (!skipAuth) await useAuthStore().ensureLogin()
      const data = await diaryApi.getDetail(id)
      if (requestId !== activeDiaryRequestId) return
      cacheDiaryDetail(data?.diary?.diaryDate, data)
      applyDiaryDetail(data, { syncSelectedDate: true })
      if (data?.diary?.diaryDate) {
        lastFetchedDate.value = normalizeYmd(data.diary.diaryDate)
      }
    } catch (e) {
      if (requestId !== activeDiaryRequestId) return
      currentDiary.value = null
      currentMedia.value = []
      currentAuthor.value = null
      aiSummary.value = ''
      console.warn('[diary] fetchById failed', e)
    } finally {
      if (requestId === activeDiaryRequestId) loading.value = false
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
        syncRecentMarksFromTimeline(list)
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

  async function deleteDiary(id, options = {}) {
    const ymd = normalizeYmd(options?.date)
    await useAuthStore().ensureLogin()
    await diaryApi.remove(id)
    timelineList.value = timelineList.value.filter((item) => item?.id !== id)
    if (ymd) {
      cacheEmptyDiaryDetail(ymd)
      if (isRecentDate(ymd)) {
        recentDiaryMarks.value = {
          ...recentDiaryMarks.value,
          [ymd]: false
        }
      }
    }
    if (currentDiary.value?.id === id) {
      currentDiary.value = null
      currentMedia.value = []
      currentAuthor.value = null
      aiSummary.value = ''
    }
    if (ymd && selectedDate.value === ymd) {
      await refreshAfterSave(ymd)
      return
    }
    await fetchTimeline(10, 1, { skipAuth: true })
    void warmRecentDays({ skipAuth: true })
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
    if (isRecentDate(selectedDate.value)) {
      await Promise.all([
        fetchTimeline(10, 1, { skipAuth: true }),
        warmRecentDays({ skipAuth: true })
      ])
      const detail = getCachedDiaryDetail(selectedDate.value)
      if (detail) {
        applyDiaryDetail(detail, { syncSelectedDate: false })
        lastFetchedDate.value = normalizeYmd(selectedDate.value)
        loading.value = false
        return
      }
    }
    await Promise.all([
      fetchDiaryByDate(selectedDate.value, { skipAuth: true }),
      fetchTimeline(10, 1, { skipAuth: true }),
      warmRecentDays({ skipAuth: true })
    ])
  }

  /** 优先展示当日日记，时间线在后台刷新 */
  async function initPage() {
    await useAuthStore().ensureLogin()
    const ymd = selectedDate.value
    const alreadyLoaded = lastFetchedDate.value === ymd

    void warmRecentDays({ skipAuth: true })

    if (alreadyLoaded) {
      void fetchDiaryByDate(ymd, { skipAuth: true, silent: true })
    } else {
      if (isRecentDate(ymd)) {
        await warmRecentDays({ skipAuth: true })
        const warmedDetail = getCachedDiaryDetail(ymd)
        if (warmedDetail) {
          applyDiaryDetail(warmedDetail, { syncSelectedDate: false })
          lastFetchedDate.value = ymd
        } else {
          await fetchDiaryByDate(ymd, { skipAuth: true })
        }
      } else {
        await fetchDiaryByDate(ymd, { skipAuth: true })
      }
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
    recentDiaryMarks,
    resolvedDiaryMarks,
    loading,
    submitting,
    aiGenerating,
    selectDate,
    fetchDiaryByDate,
    fetchDiaryById,
    fetchTimeline,
    warmRecentDays,
    createDiary,
    updateDiary,
    deleteDiary,
    generateAiSummary,
    initPage
  }
})
