import * as diaryService from '../services/diary-service.js'

export async function getDiaryByDateHandler(req, res) {
  const date = req.query.date
  if (!date) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: '缺少 date 参数' })
  }
  const data = await diaryService.fetchByDate(req.spaceId, req.user.id, date)
  res.json({ code: 0, data: data || { diary: null, mediaList: [], author: null, aiSummary: '' } })
}

export async function getTimelineHandler(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10))
  const data = await diaryService.fetchTimeline(req.spaceId, req.user.id, page, pageSize)
  res.json({ code: 0, data })
}

export async function getDiaryDetailHandler(req, res) {
  const data = await diaryService.fetchDetail(req.spaceId, req.user.id, req.params.id)
  if (!data) return res.status(404).json({ code: 'NOT_FOUND', message: '日记不存在或无权查看' })
  res.json({ code: 0, data })
}

export async function createDiaryHandler(req, res) {
  if (!req.body?.diaryDate) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: '缺少 diaryDate' })
  }
  const data = await diaryService.create(req.spaceId, req.user.id, req.body)
  res.status(201).json({ code: 0, data })
}

export async function updateDiaryHandler(req, res) {
  try {
    const data = await diaryService.update(req.spaceId, req.user.id, req.params.id, req.body)
    if (!data) return res.status(404).json({ code: 'NOT_FOUND', message: '日记不存在' })
    res.json({ code: 0, data })
  } catch (e) {
    if (e.status === 403) return res.status(403).json({ code: e.code, message: e.message })
    throw e
  }
}

export async function deleteDiaryHandler(req, res) {
  try {
    const ok = await diaryService.remove(req.spaceId, req.user.id, req.params.id)
    if (!ok) return res.status(404).json({ code: 'NOT_FOUND', message: '日记不存在' })
    res.json({ code: 0, data: { success: true } })
  } catch (e) {
    if (e.status === 403) return res.status(403).json({ code: e.code, message: e.message })
    throw e
  }
}

export async function generateAiSummaryHandler(req, res) {
  const data = await diaryService.generateSummary(req.spaceId, req.user.id, req.params.id)
  if (!data) return res.status(404).json({ code: 'NOT_FOUND', message: '日记不存在或无权查看' })
  res.json({ code: 0, data })
}
