import { seed } from '../data/seed.js'
import * as dbRepo from '../db/space-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { daysBetween, isSameMonthDay } from '../utils/date.js'

function getDashboardFromSeed(spaceId) {
  const space = seed.spaces.find((s) => s.id === spaceId)
  if (!space) return null

  const loveStartDate = space.loveStartDate || space.firstJoinedAt
  const loveDays = daysBetween(loveStartDate)
  const anniversaries = seed.anniversaries.filter((a) => a.spaceId === spaceId)
  const milestone = anniversaries.find((a) => a.repeatType === 'yearly' && isSameMonthDay(a.date))
  let currentAnniversaryName = milestone?.title || ''
  if (!currentAnniversaryName && [99, 100, 365, 520, 999, 1314].includes(loveDays)) {
    currentAnniversaryName = `${loveDays}天纪念日`
  }

  return {
    space: {
      id: space.id,
      name: space.name,
      subtitle: space.subtitle,
      firstJoinedAt: space.firstJoinedAt,
      loveStartDate: space.loveStartDate,
      couplePhoto: space.couplePhoto
    },
    loveDays,
    currentAnniversaryName,
    moods: seed.moods.filter((m) => m.spaceId === spaceId),
    bills: seed.bills[spaceId] || { expense: 0, income: 0, month: '' },
    latestDiary:
      seed.diaries.filter((d) => d.spaceId === spaceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ||
      null,
    anniversaries
  }
}

export async function getSpace(spaceId) {
  if (isDbEnabled()) {
    try {
      const row = await dbRepo.findSpaceById(spaceId)
      if (row) return row
    } catch (err) {
      console.error('[space-service] db get space failed, fallback seed', err.message)
    }
  }
  return seed.spaces.find((s) => s.id === spaceId) || null
}

export async function getDashboard(spaceId) {
  if (isDbEnabled()) {
    try {
      const data = await dbRepo.findDashboard(spaceId)
      if (data) return data
    } catch (err) {
      console.error('[space-service] db dashboard failed, fallback seed', err.message)
    }
  }
  return getDashboardFromSeed(spaceId)
}

export async function listSpaces() {
  if (isDbEnabled()) {
    try {
      const rows = await dbRepo.listAllSpaces()
      if (rows?.length) return rows
    } catch (err) {
      console.error('[space-service] db list spaces failed', err.message)
    }
  }
  return seed.spaces
}

export async function getAdminOverview() {
  if (isDbEnabled()) {
    try {
      return await dbRepo.countOverview()
    } catch (err) {
      console.error('[space-service] db overview failed', err.message)
    }
  }
  return {
    userCount: seed.users.length,
    spaceCount: seed.spaces.length,
    diaryCount: seed.diaries.length,
    moodCount: seed.moods.length
  }
}

export async function listUsers() {
  if (isDbEnabled()) {
    try {
      return (await dbRepo.listAllUsers()) || []
    } catch (err) {
      console.error('[space-service] db users failed', err.message)
    }
  }
  return seed.users
}

export async function listDiaries() {
  if (isDbEnabled()) {
    try {
      return (await dbRepo.listAllDiaries()) || []
    } catch (err) {
      console.error('[space-service] db diaries failed', err.message)
    }
  }
  return seed.diaries
}
