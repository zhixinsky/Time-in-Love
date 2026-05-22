import { seed } from '../data/seed.js'
import * as dbRepo from '../db/space-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { daysBetween, isSameMonthDay } from '../utils/date.js'
import { createId } from '../utils/id.js'

const memorySpaces = new Map(seed.spaces.map((space) => [space.id, { ...space }]))
const memoryMembers = new Map([['u_me', 'space_demo'], ['u_ta', 'space_demo']])

function normalizeSpace(space) {
  if (!space) return null
  return {
    id: space.id,
    name: space.name,
    subtitle: space.subtitle,
    firstJoinedAt: space.firstJoinedAt,
    loveStartDate: space.loveStartDate,
    couplePhoto: space.couplePhoto || '',
    inviteCode: space.inviteCode || ''
  }
}

function getDashboardFromSeed(spaceId) {
  const space = memorySpaces.get(spaceId) || seed.spaces.find((s) => s.id === spaceId)
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
      ...normalizeSpace(space)
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
  return normalizeSpace(memorySpaces.get(spaceId) || seed.spaces.find((s) => s.id === spaceId))
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
  return Array.from(memorySpaces.values()).map(normalizeSpace)
}

export async function updateCurrentSpace(spaceId, payload) {
  if (isDbEnabled()) {
    try {
      return await dbRepo.updateSpace(spaceId, payload)
    } catch (err) {
      console.error('[space-service] db update space failed, fallback memory', err.message)
    }
  }
  const current = memorySpaces.get(spaceId)
  if (!current) return null
  const next = { ...current }
  ;['name', 'subtitle', 'loveStartDate', 'couplePhoto'].forEach((key) => {
    if (payload[key] !== undefined) next[key] = payload[key]
  })
  memorySpaces.set(spaceId, next)
  return normalizeSpace(next)
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createInvite(spaceId) {
  const inviteCode = createInviteCode()
  if (isDbEnabled()) {
    try {
      const memberCount = await dbRepo.countMembers(spaceId)
      if (memberCount >= 2) {
        const err = new Error('当前空间已满员')
        err.status = 400
        err.code = 'SPACE_FULL'
        throw err
      }
      const space = await dbRepo.saveInviteCode(spaceId, inviteCode)
      return { inviteCode, space }
    } catch (err) {
      if (err.code === 'SPACE_FULL') throw err
      console.error('[space-service] db create invite failed, fallback memory', err.message)
    }
  }
  const space = memorySpaces.get(spaceId)
  if (!space) return null
  space.inviteCode = inviteCode
  memorySpaces.set(spaceId, space)
  return { inviteCode, space: normalizeSpace(space) }
}

export async function createSpace(userId, payload) {
  if (isDbEnabled()) {
    try {
      return await dbRepo.createSpaceForUser(userId, payload)
    } catch (err) {
      console.error('[space-service] db create space failed, fallback memory', err.message)
    }
  }
  const id = createId('space')
  const today = new Date().toISOString().slice(0, 10)
  const space = {
    id,
    name: payload.name || '恋爱时光',
    subtitle: payload.subtitle || '记录我们的心动瞬间',
    firstJoinedAt: today,
    loveStartDate: payload.loveStartDate || today,
    couplePhoto: payload.couplePhoto || '',
    inviteCode: ''
  }
  memorySpaces.set(id, space)
  memoryMembers.set(userId, id)
  return normalizeSpace(space)
}

export async function joinSpaceByInvite(userId, inviteCode) {
  const normalized = String(inviteCode || '').trim().toUpperCase()
  if (!normalized) {
    const err = new Error('请输入邀请码')
    err.status = 400
    err.code = 'INVITE_CODE_REQUIRED'
    throw err
  }
  if (isDbEnabled()) {
    try {
      const space = await dbRepo.findSpaceByInviteCode(normalized)
      if (!space) {
        const err = new Error('邀请码无效或已过期')
        err.status = 404
        err.code = 'INVITE_NOT_FOUND'
        throw err
      }
      const memberCount = await dbRepo.countMembers(space.id)
      if (memberCount >= 2) {
        const err = new Error('当前空间已满员')
        err.status = 400
        err.code = 'SPACE_FULL'
        throw err
      }
      return await dbRepo.joinSpace(space.id, userId)
    } catch (err) {
      if (['INVITE_NOT_FOUND', 'SPACE_FULL'].includes(err.code)) throw err
      console.error('[space-service] db join space failed, fallback memory', err.message)
    }
  }
  const target = Array.from(memorySpaces.values()).find((space) => space.inviteCode === normalized)
  if (!target) {
    const err = new Error('邀请码无效或已过期')
    err.status = 404
    err.code = 'INVITE_NOT_FOUND'
    throw err
  }
  memoryMembers.set(userId, target.id)
  return normalizeSpace(target)
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
