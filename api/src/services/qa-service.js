import * as repo from '../db/qa-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { createId } from '../utils/id.js'

const questionTemplates = [
  { category: '初识', content: '你第一次觉得对方很特别，是在哪个瞬间？' },
  { category: '恋爱', content: '最近一次让你心动的小细节是什么？' },
  { category: '日常', content: '如果今天能一起做一件小事，你最想做什么？' },
  { category: '未来', content: '你希望我们今年一起完成哪件事？' },
  { category: '甜蜜', content: '用一句话夸夸今天的对方吧。' },
  { category: '深夜话题', content: '有没有一句话，是你一直想对我说的？' }
]

const memoryQuestions = questionTemplates.map((item) => ({ id: createId('q'), ...item, official: true, enabled: true }))
const memoryAnswers = new Map()

function today() {
  return new Date().toISOString().slice(0, 10)
}

function questionIndex(date, length) {
  const raw = String(date || today()).replace(/-/g, '')
  return Number(raw) % length
}

async function ensureQuestions() {
  if (isDbEnabled()) {
    try {
      if ((await repo.countQuestions()) === 0) await repo.seedQuestions(questionTemplates)
      return await repo.listQuestions()
    } catch (err) {
      console.error('[qa-service] db questions failed, fallback memory', err.message)
    }
  }
  return memoryQuestions
}

function answerKey(spaceId, questionId, userId) {
  return `${spaceId}:${questionId}:${userId}`
}

function historyForMemory(spaceId) {
  return Array.from(memoryAnswers.values())
    .filter((item) => item.spaceId === spaceId)
    .sort((a, b) => `${b.answerDate}${b.createdAt}`.localeCompare(`${a.answerDate}${a.createdAt}`))
}

export async function getTodayQuestion(spaceId, userId) {
  const questions = await ensureQuestions()
  const question = questions[questionIndex(today(), questions.length)]
  let myAnswer = null
  let answeredCount = 0
  if (isDbEnabled()) {
    try {
      myAnswer = await repo.findAnswer(spaceId, question.id, userId)
      const history = await repo.listHistory(spaceId, 100)
      answeredCount = history.filter((item) => item.questionId === question.id).length
    } catch (err) {
      console.error('[qa-service] db today failed, fallback memory', err.message)
    }
  }
  if (!myAnswer) myAnswer = memoryAnswers.get(answerKey(spaceId, question.id, userId)) || null
  if (!answeredCount) {
    answeredCount = historyForMemory(spaceId).filter((item) => item.questionId === question.id).length
  }
  return { question, myAnswer, answeredCount, partnerAnswered: answeredCount > (myAnswer ? 1 : 0) }
}

export async function answerToday(spaceId, userId, payload = {}) {
  const answer = String(payload.answer || '').trim()
  if (!answer) {
    const err = new Error('请输入你的回答')
    err.status = 400
    err.code = 'ANSWER_REQUIRED'
    throw err
  }
  const todayData = await getTodayQuestion(spaceId, userId)
  const question = todayData.question
  if (isDbEnabled()) {
    try {
      return await repo.upsertAnswer(spaceId, question.id, userId, answer, today())
    } catch (err) {
      console.error('[qa-service] db answer failed, fallback memory', err.message)
    }
  }
  const key = answerKey(spaceId, question.id, userId)
  const item = {
    id: memoryAnswers.get(key)?.id || createId('ans'),
    spaceId,
    questionId: question.id,
    userId,
    answer,
    answerDate: today(),
    question: question.content,
    category: question.category,
    createdAt: memoryAnswers.get(key)?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  memoryAnswers.set(key, item)
  return item
}

export async function listQaHistory(spaceId) {
  if (isDbEnabled()) {
    try {
      return (await repo.listHistory(spaceId, 50)) || []
    } catch (err) {
      console.error('[qa-service] db history failed, fallback memory', err.message)
    }
  }
  return historyForMemory(spaceId)
}
