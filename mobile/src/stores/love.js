import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createSpace, createSpaceInvite, fetchSpaceDashboard, joinSpace, updateCurrentSpace } from '../services/space'
import { useAuthStore } from './auth'
import { daysBetween, isSameMonthDay } from '../utils/date'

export const useLoveStore = defineStore('love', () => {
  const space = ref({
    name: '恋爱时光',
    subtitle: '记录我们的心动瞬间',
    firstJoinedAt: '2024-12-19',
    loveStartDate: '',
    couplePhoto: ''
  })

  const anniversaries = ref([
    {
      title: '恋爱纪念日',
      date: '2024-12-19',
      repeatType: 'yearly'
    },
    {
      title: '第一次约会',
      date: '2025-01-12',
      repeatType: 'yearly'
    }
  ])

  const moods = ref([
    { owner: '我', avatar: '👧🏻', mood: '很幸福' },
    { owner: 'Ta', avatar: '👦🏻', mood: '想见你' }
  ])

  const bills = ref({
    expense: 1314,
    income: 520
  })

  const diary = ref({
    content: '今天一起去看了日落，他的侧脸在夕阳下好温柔。走在海边吹着风，突然觉得能和他一起看很多很多次日落，真的是很幸福的事呀～',
    mood: '很幸福',
    weather: '晴 26℃',
    location: '海边'
  })

  const loveStartDate = computed(() => space.value.loveStartDate || space.value.firstJoinedAt)
  const loveDays = computed(() => daysBetween(loveStartDate.value))
  const currentAnniversaryName = computed(() => {
    const milestone = anniversaries.value.find((item) => item.repeatType === 'yearly' && isSameMonthDay(item.date))
    if (milestone) return milestone.title
    if ([99, 100, 365, 520, 999, 1314].includes(loveDays.value)) return `${loveDays.value}天纪念日`
    return ''
  })

  function setLoveStartDate(date) {
    space.value.loveStartDate = date
  }

  function setCouplePhoto(url) {
    space.value.couplePhoto = url
  }

  /** 从云托管同步首页数据（失败时保持本地 mock） */
  async function loadDashboard(spaceId = 'current') {
    try {
      const auth = useAuthStore()
      await auth.ensureLogin()
      const data = await fetchSpaceDashboard(spaceId)
      if (!data) return false
      space.value = { ...space.value, ...data.space }
      auth.syncSpace(space.value)
      anniversaries.value = data.anniversaries || anniversaries.value
      moods.value = data.moods || moods.value
      bills.value = data.bills || bills.value
      if (data.latestDiary) diary.value = data.latestDiary
      return true
    } catch (e) {
      console.warn('[love] loadDashboard failed, using mock', e)
      return false
    }
  }

  async function saveSpace(payload) {
    const auth = useAuthStore()
    await auth.ensureLogin()
    const nextSpace = await updateCurrentSpace(payload)
    space.value = { ...space.value, ...nextSpace }
    auth.syncSpace(space.value)
    return nextSpace
  }

  async function resetSpace(payload = {}) {
    const auth = useAuthStore()
    await auth.ensureLogin()
    const data = await createSpace(payload)
    auth.applySession(data)
    space.value = { ...space.value, ...data.space }
    await loadDashboard()
    return data.space
  }

  async function invitePartner() {
    const auth = useAuthStore()
    await auth.ensureLogin()
    return createSpaceInvite()
  }

  async function joinByInvite(inviteCode) {
    const auth = useAuthStore()
    await auth.ensureLogin()
    const data = await joinSpace(inviteCode)
    auth.applySession(data)
    space.value = { ...space.value, ...data.space }
    await loadDashboard()
    return data.space
  }

  return {
    space,
    anniversaries,
    moods,
    bills,
    diary,
    loveStartDate,
    loveDays,
    currentAnniversaryName,
    setLoveStartDate,
    setCouplePhoto,
    loadDashboard,
    saveSpace,
    resetSpace,
    invitePartner,
    joinByInvite
  }
})
