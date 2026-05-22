import * as store from '../data/diary-store.js'
import { generateLoveDiarySummary } from './ai-service.js'

export function fetchByDate(spaceId, userId, date) {
  return store.getDiaryByDate(spaceId, userId, date)
}

export function fetchTimeline(spaceId, userId, page, pageSize) {
  return store.getTimeline(spaceId, userId, page, pageSize)
}

export function fetchDetail(spaceId, userId, id) {
  return store.getDiaryById(spaceId, userId, id)
}

export function create(spaceId, userId, body) {
  let aiSummary = ''
  if (body.needAiSummary) {
    aiSummary = generateLoveDiarySummary(body)
  }
  return store.createDiary(spaceId, userId, { ...body, aiSummary })
}

export function update(spaceId, userId, id, body) {
  return store.updateDiary(spaceId, userId, id, body)
}

export function remove(spaceId, userId, id) {
  return store.deleteDiary(spaceId, userId, id)
}

export function generateSummary(spaceId, userId, id) {
  const detail = store.getDiaryById(spaceId, userId, id)
  if (!detail) return null
  const summary = generateLoveDiarySummary(detail.diary)
  return store.saveAiSummary(spaceId, userId, id, summary)
}
