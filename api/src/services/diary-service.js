import * as store from '../data/diary-store.js'
import * as diaryRepo from '../db/diary-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { generateLoveDiarySummary } from './ai-service.js'

async function tryDb(label, fn) {
  if (!isDbEnabled()) return null
  try {
    return await fn()
  } catch (err) {
    console.error(`[diary-service] db ${label} failed, fallback memory`, err.message)
    return null
  }
}

export async function fetchByDate(spaceId, userId, date) {
  const data = await tryDb('fetch by date', () => diaryRepo.findByDate(spaceId, userId, date))
  if (data) return data
  return store.getDiaryByDate(spaceId, userId, date)
}

export async function fetchTimeline(spaceId, userId, page, pageSize) {
  const data = await tryDb('timeline', () => diaryRepo.timeline(spaceId, userId, page, pageSize))
  if (data) return data
  return store.getTimeline(spaceId, userId, page, pageSize)
}

export async function fetchDetail(spaceId, userId, id) {
  const data = await tryDb('detail', () => diaryRepo.findById(spaceId, userId, id))
  if (data) return data
  return store.getDiaryById(spaceId, userId, id)
}

export async function create(spaceId, userId, body) {
  let aiSummary = ''
  if (body.needAiSummary) {
    aiSummary = generateLoveDiarySummary(body)
  }
  const payload = { ...body, aiSummary }
  const data = await tryDb('create', () => diaryRepo.createDiary(spaceId, userId, payload))
  if (data) return data
  return store.createDiary(spaceId, userId, payload)
}

export async function update(spaceId, userId, id, body) {
  const data = await tryDb('update', () => diaryRepo.updateDiary(spaceId, userId, id, body))
  if (data) return data
  return store.updateDiary(spaceId, userId, id, body)
}

export async function remove(spaceId, userId, id) {
  const data = await tryDb('delete', () => diaryRepo.softDelete(spaceId, userId, id))
  if (data !== null) return data
  return store.deleteDiary(spaceId, userId, id)
}

export async function generateSummary(spaceId, userId, id) {
  const detail = await fetchDetail(spaceId, userId, id)
  if (!detail) return null
  const summary = generateLoveDiarySummary(detail.diary)
  const data = await tryDb('ai summary', () => diaryRepo.updateAiSummary(spaceId, userId, id, summary))
  if (data) return data
  return store.saveAiSummary(spaceId, userId, id, summary)
}

export async function fetchAlbumMedia(spaceId, userId, page, pageSize) {
  const data = await tryDb('album media', () => diaryRepo.albumMedia(spaceId, userId, page, pageSize))
  if (data) return data
  return store.getAlbumMedia(spaceId, userId, page, pageSize)
}
