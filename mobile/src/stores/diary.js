import { defineStore } from 'pinia'
import { ref } from 'vue'
import diaryApi from '../services/diary'
import { buildWeekDays, formatYmd } from '../utils/diary-date'

export const useDiaryStore = defineStore('diary', () => {
  const selectedDate = ref(formatYmd(new Date()))
  const weekOffset = ref(0)
  const weekDays = ref(buildWeekDays(selectedDate.value, 0))
  const currentDiary = ref(null)
  const currentMedia = ref([])
  const currentAuthor = ref(null)
  const aiSummary = ref('')
  const timelineList = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const aiGenerating = ref(false)

  function getWeekDays(date, offset = weekOffset.value) {
    return buildWeekDays(date || selectedDate.value, offset)
  }

  function switchWeek(direction) {
    weekOffset.value += direction === 'next' ? 1 : -1
    weekDays.value = getWeekDays(selectedDate.value, weekOffset.value)
  }

  async function selectDate(date) {
    selectedDate.value = date
    weekDays.value = getWeekDays(date, weekOffset.value)
    await fetchDiaryByDate(date)
  }

  async function fetchDiaryByDate(date = selectedDate.value) {
    loading.value = true
    try {
      const data = await diaryApi.getByDate(date)
      currentDiary.value = data?.diary || null
      currentMedia.value = data?.mediaList || []
      currentAuthor.value = data?.author || null
      aiSummary.value = data?.aiSummary || data?.diary?.aiSummary || ''
    } catch (e) {
      currentDiary.value = null
      currentMedia.value = []
      currentAuthor.value = null
      aiSummary.value = ''
      console.warn('[diary] fetchByDate failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeline(pageSize = 5) {
    try {
      const data = await diaryApi.getTimeline(1, pageSize)
      timelineList.value = data?.list || []
    } catch (e) {
      timelineList.value = []
      console.warn('[diary] fetchTimeline failed', e)
    }
  }

  async function createDiary(payload) {
    submitting.value = true
    try {
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
      const data = await diaryApi.update(id, payload)
      await refreshAfterSave(payload.diaryDate || selectedDate.value)
      return data
    } finally {
      submitting.value = false
    }
  }

  async function deleteDiary(id) {
    await diaryApi.remove(id)
    await refreshAfterSave(selectedDate.value)
  }

  async function generateAiSummary(id) {
    aiGenerating.value = true
    try {
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
      weekOffset.value = 0
      selectedDate.value = date
      weekDays.value = getWeekDays(date, 0)
    }
    await Promise.all([fetchDiaryByDate(selectedDate.value), fetchTimeline()])
  }

  async function initPage() {
    weekOffset.value = 0
    weekDays.value = getWeekDays(selectedDate.value, 0)
    await Promise.all([fetchDiaryByDate(selectedDate.value), fetchTimeline()])
  }

  return {
    selectedDate,
    weekOffset,
    weekDays,
    currentDiary,
    currentMedia,
    currentAuthor,
    aiSummary,
    timelineList,
    loading,
    submitting,
    aiGenerating,
    getWeekDays,
    switchWeek,
    selectDate,
    fetchDiaryByDate,
    fetchTimeline,
    createDiary,
    updateDiary,
    deleteDiary,
    generateAiSummary,
    initPage
  }
})
