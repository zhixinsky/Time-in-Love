import { seed } from './seed.js'
import { daysBetween } from '../utils/date.js'
import { createId } from '../utils/id.js'

const state = {
  diaries: [],
  media: []
}

function loveStartDate(spaceId) {
  const space = seed.spaces.find((s) => s.id === spaceId)
  return space?.loveStartDate || space?.firstJoinedAt || '2024-12-19'
}

function calcLoveDay(spaceId, diaryDate) {
  return daysBetween(loveStartDate(spaceId), diaryDate)
}

function seedInitial() {
  const d = {
    id: 'd1',
    spaceId: 'space_demo',
    userId: 'u_me',
    content:
      '今天一起去看了日落，他的侧脸在夕阳下好温柔。走在海边吹着风，突然觉得能和他一起看很多很多次日落，真的是很幸福的事呀～',
    mood: '很幸福',
    weather: '晴',
    temperature: '26℃',
    locationName: '海边',
    locationLat: null,
    locationLng: null,
    visibility: 'both',
    aiSummary: '看得出来，今天是和他一起度过的温暖又浪漫的一天呢～',
    loveDay: calcLoveDay('space_demo', '2026-05-22'),
    diaryDate: '2026-05-22',
    createdAt: '2026-05-22T10:00:00.000Z',
    updatedAt: '2026-05-22T10:00:00.000Z',
    deletedAt: null
  }
  state.diaries.push(d)
  const d2 = {
    id: 'd2',
    spaceId: 'space_demo',
    userId: 'u_me',
    content: '一起做了晚饭，虽然有点糊掉，但他说很好吃。这种笨拙的日常，也让我觉得很安心。',
    mood: '开心',
    weather: '多云',
    temperature: '22℃',
    locationName: '家里',
    locationLat: null,
    locationLng: null,
    visibility: 'both',
    aiSummary: '这样松弛又陪伴感满满的一天，真的很让人羡慕呢～',
    loveDay: calcLoveDay('space_demo', '2026-05-21'),
    diaryDate: '2026-05-21',
    createdAt: '2026-05-21T18:30:00.000Z',
    updatedAt: '2026-05-21T18:30:00.000Z',
    deletedAt: null
  }
  state.diaries.push(d2)

  state.media.push(
    {
      id: 'dm1',
      diaryId: 'd1',
      type: 'image',
      url: '/uploads/demo/sunset1.jpg',
      coverUrl: '',
      duration: 0,
      sort: 0,
      createdAt: d.createdAt
    },
    {
      id: 'dm2',
      diaryId: 'd1',
      type: 'image',
      url: '/uploads/demo/sunset2.jpg',
      coverUrl: '',
      duration: 0,
      sort: 1,
      createdAt: d.createdAt
    }
  )
}

seedInitial()

function activeDiaries(spaceId) {
  return state.diaries.filter((d) => d.spaceId === spaceId && !d.deletedAt)
}

function canView(diary, userId) {
  if (diary.visibility === 'self') return diary.userId === userId
  return true
}

function getMediaByDiaryId(diaryId) {
  return state.media.filter((m) => m.diaryId === diaryId).sort((a, b) => a.sort - b.sort)
}

function authorOf(userId) {
  const user = seed.users.find((u) => u.id === userId)
  return {
    id: userId,
    nickname: user?.nickname || '我',
    avatar: userId === 'u_me' ? '👧🏻' : '👦🏻'
  }
}

function preview(content, max = 48) {
  const text = (content || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

function coverImage(diaryId) {
  const list = getMediaByDiaryId(diaryId)
  const video = list.find((m) => m.type === 'video')
  if (video) return video.coverUrl || video.url
  const image = list.find((m) => m.type === 'image')
  return image?.url || ''
}

function isAnniversary(spaceId, diaryDate) {
  return seed.anniversaries.some(
    (a) => a.spaceId === spaceId && a.date.slice(5) === diaryDate.slice(5)
  )
}

export function getDiaryByDate(spaceId, userId, date) {
  const list = activeDiaries(spaceId)
    .filter((d) => d.diaryDate === date && canView(d, userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const diary = list[0]
  if (!diary) return null
  return {
    diary,
    mediaList: getMediaByDiaryId(diary.id),
    author: authorOf(diary.userId),
    aiSummary: diary.aiSummary || ''
  }
}

export function getTimeline(spaceId, userId, page = 1, pageSize = 10) {
  const list = activeDiaries(spaceId)
    .filter((d) => canView(d, userId))
    .sort((a, b) => {
      const dateCmp = b.diaryDate.localeCompare(a.diaryDate)
      if (dateCmp !== 0) return dateCmp
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  const total = list.length
  const start = (page - 1) * pageSize
  const slice = list.slice(start, start + pageSize)
  return {
    total,
    list: slice.map((d) => ({
      id: d.id,
      contentPreview: preview(d.content),
      date: d.diaryDate,
      loveDay: d.loveDay,
      coverImage: coverImage(d.id),
      mood: d.mood,
      isAnniversary: isAnniversary(spaceId, d.diaryDate),
      author: authorOf(d.userId).nickname,
      content: d.content
    }))
  }
}

export function getDiaryById(spaceId, userId, id) {
  const diary = activeDiaries(spaceId).find((d) => d.id === id)
  if (!diary || !canView(diary, userId)) return null
  return {
    diary,
    mediaList: getMediaByDiaryId(diary.id),
    author: authorOf(diary.userId),
    aiSummary: diary.aiSummary || ''
  }
}

export function createDiary(spaceId, userId, payload) {
  const now = new Date().toISOString()
  const diary = {
    id: createId('d'),
    spaceId,
    userId,
    content: payload.content || '',
    mood: payload.mood || '',
    weather: payload.weather || '',
    temperature: payload.temperature || '',
    locationName: payload.locationName || '',
    locationLat: payload.locationLat ?? null,
    locationLng: payload.locationLng ?? null,
    visibility: payload.visibility === 'self' ? 'self' : 'both',
    aiSummary: payload.aiSummary || '',
    loveDay: calcLoveDay(spaceId, payload.diaryDate),
    diaryDate: payload.diaryDate,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  state.diaries.unshift(diary)
  ;(payload.mediaList || []).forEach((item, index) => {
    state.media.push({
      id: createId('dm'),
      diaryId: diary.id,
      type: item.type === 'video' ? 'video' : 'image',
      url: item.url,
      coverUrl: item.coverUrl || '',
      duration: item.duration || 0,
      sort: index,
      createdAt: now
    })
  })
  return getDiaryById(spaceId, userId, diary.id)
}

export function updateDiary(spaceId, userId, id, payload) {
  const diary = activeDiaries(spaceId).find((d) => d.id === id)
  if (!diary) return null
  if (diary.userId !== userId) {
    const err = new Error('只有作者可以修改日记')
    err.status = 403
    err.code = 'FORBIDDEN'
    throw err
  }
  const fields = [
    'content',
    'mood',
    'weather',
    'temperature',
    'locationName',
    'locationLat',
    'locationLng',
    'visibility',
    'aiSummary',
    'diaryDate'
  ]
  fields.forEach((key) => {
    if (payload[key] !== undefined) diary[key] = payload[key]
  })
  if (payload.diaryDate) diary.loveDay = calcLoveDay(spaceId, payload.diaryDate)
  diary.updatedAt = new Date().toISOString()
  if (payload.mediaList) {
    state.media = state.media.filter((m) => m.diaryId !== id)
    payload.mediaList.forEach((item, index) => {
      state.media.push({
        id: createId('dm'),
        diaryId: id,
        type: item.type === 'video' ? 'video' : 'image',
        url: item.url,
        coverUrl: item.coverUrl || '',
        duration: item.duration || 0,
        sort: index,
        createdAt: diary.updatedAt
      })
    })
  }
  return getDiaryById(spaceId, userId, id)
}

export function deleteDiary(spaceId, userId, id) {
  const diary = activeDiaries(spaceId).find((d) => d.id === id)
  if (!diary) return false
  if (diary.userId !== userId) {
    const err = new Error('只有作者可以删除日记')
    err.status = 403
    err.code = 'FORBIDDEN'
    throw err
  }
  diary.deletedAt = new Date().toISOString()
  return true
}

export function saveAiSummary(spaceId, userId, id, summary) {
  const diary = activeDiaries(spaceId).find((d) => d.id === id)
  if (!diary || !canView(diary, userId)) return null
  diary.aiSummary = summary
  diary.updatedAt = new Date().toISOString()
  return getDiaryById(spaceId, userId, id)
}
