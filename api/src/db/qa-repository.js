import { dbExecute, dbQuery } from './pool.js'
import { createId } from '../utils/id.js'

export async function countQuestions() {
  const rows = await dbQuery('SELECT COUNT(*) AS c FROM sweet_questions WHERE enabled = 1')
  return Number(rows?.[0]?.c || 0)
}

export async function seedQuestions(questions = []) {
  for (const item of questions) {
    await dbExecute(
      `INSERT INTO sweet_questions (id, category, content, official, enabled)
       VALUES (?, ?, ?, 1, 1)`,
      [createId('q'), item.category || '日常', item.content]
    )
  }
}

export async function listQuestions() {
  return dbQuery(
    `SELECT id, category, content, official, enabled, created_at AS createdAt
     FROM sweet_questions WHERE enabled = 1 ORDER BY created_at ASC`
  )
}

export async function findAnswer(spaceId, questionId, userId) {
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, question_id AS questionId, user_id AS userId,
            answer, answer_date AS answerDate, created_at AS createdAt, updated_at AS updatedAt
     FROM sweet_answers WHERE space_id = ? AND question_id = ? AND user_id = ? LIMIT 1`,
    [spaceId, questionId, userId]
  )
  return rows?.[0] || null
}

export async function upsertAnswer(spaceId, questionId, userId, answer, answerDate) {
  const existing = await findAnswer(spaceId, questionId, userId)
  if (existing) {
    await dbExecute(
      `UPDATE sweet_answers SET answer = ?, answer_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [answer, answerDate, existing.id]
    )
    return findAnswer(spaceId, questionId, userId)
  }
  const id = createId('ans')
  await dbExecute(
    `INSERT INTO sweet_answers (id, space_id, question_id, user_id, answer, answer_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, spaceId, questionId, userId, answer, answerDate]
  )
  return findAnswer(spaceId, questionId, userId)
}

export async function listHistory(spaceId, limit = 30) {
  return dbQuery(
    `SELECT a.id, a.space_id AS spaceId, a.question_id AS questionId, a.user_id AS userId,
            a.answer, a.answer_date AS answerDate, a.created_at AS createdAt,
            q.content AS question, q.category
     FROM sweet_answers a
     LEFT JOIN sweet_questions q ON q.id = a.question_id
     WHERE a.space_id = ?
     ORDER BY a.answer_date DESC, a.created_at DESC
     LIMIT ?`,
    [spaceId, Number(limit)]
  )
}
