import * as repo from '../db/checklist-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { createId } from '../utils/id.js'

const officialTemplates = [
  { title: '一起看一场日落', category: '浪漫', official: true },
  { title: '一起做一顿晚饭', category: '日常', official: true },
  { title: '拍一组情侣合照', category: '记录', official: true },
  { title: '一起去一次短途旅行', category: '旅行', official: true },
  { title: '写一封给对方的信', category: '甜蜜', official: true },
  { title: '一起看一部老电影', category: '约会', official: true }
]

const memoryItems = new Map()

function normalize(item) {
  return {
    ...item,
    official: Boolean(item.official),
    completed: Boolean(item.completed)
  }
}

function ensureMemory(spaceId, userId) {
  if (!memoryItems.has(spaceId)) {
    memoryItems.set(
      spaceId,
      officialTemplates.map((item) => ({
        id: createId('check'),
        spaceId,
        userId,
        title: item.title,
        category: item.category,
        official: true,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      }))
    )
  }
}

function buildPayload(list) {
  const total = list.length
  const completed = list.filter((item) => item.completed).length
  return {
    list: list.map(normalize),
    summary: {
      total,
      completed,
      rate: total ? Math.round((completed / total) * 100) : 0
    }
  }
}

export async function listChecklist(spaceId, userId) {
  if (isDbEnabled()) {
    try {
      if ((await repo.countItems(spaceId)) === 0) {
        await repo.bulkCreate(spaceId, userId, officialTemplates)
      }
      const list = await repo.listItems(spaceId)
      return buildPayload(list || [])
    } catch (err) {
      console.error('[checklist-service] db list failed, fallback memory', err.message)
    }
  }
  ensureMemory(spaceId, userId)
  return buildPayload(memoryItems.get(spaceId) || [])
}

export async function createChecklistItem(spaceId, userId, payload = {}) {
  const title = String(payload.title || '').trim()
  if (!title) {
    const err = new Error('请输入清单内容')
    err.status = 400
    err.code = 'CHECK_TITLE_REQUIRED'
    throw err
  }
  if (isDbEnabled()) {
    try {
      return normalize(await repo.createItem(spaceId, userId, { ...payload, title }))
    } catch (err) {
      console.error('[checklist-service] db create failed, fallback memory', err.message)
    }
  }
  ensureMemory(spaceId, userId)
  const item = {
    id: createId('check'),
    spaceId,
    userId,
    title,
    category: payload.category || '日常',
    official: false,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString()
  }
  memoryItems.get(spaceId).unshift(item)
  return item
}

export async function updateChecklistItem(spaceId, id, payload = {}) {
  if (isDbEnabled()) {
    try {
      const item = await repo.updateItem(spaceId, id, payload)
      return item ? normalize(item) : null
    } catch (err) {
      console.error('[checklist-service] db update failed, fallback memory', err.message)
    }
  }
  const list = memoryItems.get(spaceId) || []
  const index = list.findIndex((item) => item.id === id)
  if (index < 0) return null
  list[index] = {
    ...list[index],
    ...payload,
    completedAt: payload.completed ? new Date().toISOString() : null
  }
  memoryItems.set(spaceId, list)
  return normalize(list[index])
}

export async function deleteChecklistItem(spaceId, id) {
  if (isDbEnabled()) {
    try {
      return await repo.deleteItem(spaceId, id)
    } catch (err) {
      console.error('[checklist-service] db delete failed, fallback memory', err.message)
    }
  }
  const list = memoryItems.get(spaceId) || []
  const next = list.filter((item) => item.id !== id)
  memoryItems.set(spaceId, next)
  return next.length !== list.length
}
