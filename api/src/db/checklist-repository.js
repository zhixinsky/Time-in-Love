import { dbExecute, dbQuery } from './pool.js'
import { createId } from '../utils/id.js'

export async function countItems(spaceId) {
  const rows = await dbQuery('SELECT COUNT(*) AS c FROM love_check_items WHERE space_id = ?', [spaceId])
  return Number(rows?.[0]?.c || 0)
}

export async function bulkCreate(spaceId, userId, items = []) {
  for (const item of items) {
    await dbExecute(
      `INSERT INTO love_check_items (id, space_id, user_id, title, category, official)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [createId('check'), spaceId, userId, item.title, item.category || '日常', item.official ? 1 : 0]
    )
  }
}

export async function listItems(spaceId) {
  return dbQuery(
    `SELECT id, space_id AS spaceId, user_id AS userId, title, category,
            official, completed, completed_at AS completedAt, created_at AS createdAt
     FROM love_check_items WHERE space_id = ? ORDER BY official DESC, completed ASC, created_at ASC`,
    [spaceId]
  )
}

export async function createItem(spaceId, userId, payload = {}) {
  const id = createId('check')
  await dbExecute(
    `INSERT INTO love_check_items (id, space_id, user_id, title, category, official)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, spaceId, userId, payload.title, payload.category || '日常']
  )
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, user_id AS userId, title, category,
            official, completed, completed_at AS completedAt, created_at AS createdAt
     FROM love_check_items WHERE id = ? LIMIT 1`,
    [id]
  )
  return rows?.[0] || null
}

export async function updateItem(spaceId, id, payload = {}) {
  const fields = []
  const params = []
  if (payload.title !== undefined) {
    fields.push('title = ?')
    params.push(payload.title)
  }
  if (payload.category !== undefined) {
    fields.push('category = ?')
    params.push(payload.category)
  }
  if (payload.completed !== undefined) {
    fields.push('completed = ?')
    fields.push('completed_at = ?')
    params.push(payload.completed ? 1 : 0, payload.completed ? new Date() : null)
  }
  if (fields.length) {
    params.push(spaceId, id)
    await dbExecute(`UPDATE love_check_items SET ${fields.join(', ')} WHERE space_id = ? AND id = ?`, params)
  }
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, user_id AS userId, title, category,
            official, completed, completed_at AS completedAt, created_at AS createdAt
     FROM love_check_items WHERE space_id = ? AND id = ? LIMIT 1`,
    [spaceId, id]
  )
  return rows?.[0] || null
}

export async function deleteItem(spaceId, id) {
  const result = await dbExecute('DELETE FROM love_check_items WHERE space_id = ? AND id = ?', [spaceId, id])
  return Number(result?.affectedRows || 0) > 0
}
