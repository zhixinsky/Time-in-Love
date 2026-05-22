import { answerToday, getTodayQuestion, listQaHistory } from '../services/qa-service.js'

export async function todayQuestionHandler(req, res) {
  const data = await getTodayQuestion(req.spaceId, req.user.id)
  res.json({ code: 0, data })
}

export async function answerTodayHandler(req, res) {
  const data = await answerToday(req.spaceId, req.user.id, req.body || {})
  res.json({ code: 0, data })
}

export async function qaHistoryHandler(req, res) {
  const data = await listQaHistory(req.spaceId)
  res.json({ code: 0, data })
}
