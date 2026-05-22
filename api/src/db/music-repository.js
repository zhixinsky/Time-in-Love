import { dbExecute, dbQuery } from './pool.js'
import { createId } from '../utils/id.js'

function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    singer: row.singer,
    epname: row.epname,
    fileId: row.fileId,
    coverImgUrl: row.coverImgUrl,
    enabled: Boolean(row.enabled),
    loopEnabled: Boolean(row.loopEnabled),
    sort: Number(row.sort || 0),
    remark: row.remark,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export async function listAll() {
  const rows = await dbQuery(
    `SELECT id, title, singer, epname, file_id AS fileId, cover_img_url AS coverImgUrl,
            enabled, loop_enabled AS loopEnabled, sort, remark,
            created_at AS createdAt, updated_at AS updatedAt
     FROM love_background_music
     ORDER BY sort ASC, created_at DESC`
  )
  return rows.map(mapRow)
}

export async function listLoop() {
  const rows = await dbQuery(
    `SELECT id, title, singer, epname, file_id AS fileId, cover_img_url AS coverImgUrl,
            enabled, loop_enabled AS loopEnabled, sort, remark,
            created_at AS createdAt, updated_at AS updatedAt
     FROM love_background_music
     WHERE enabled = 1 AND loop_enabled = 1
     ORDER BY sort ASC, created_at DESC`
  )
  return rows.map(mapRow)
}

export async function findById(id) {
  const rows = await dbQuery(
    `SELECT id, title, singer, epname, file_id AS fileId, cover_img_url AS coverImgUrl,
            enabled, loop_enabled AS loopEnabled, sort, remark,
            created_at AS createdAt, updated_at AS updatedAt
     FROM love_background_music WHERE id = ? LIMIT 1`,
    [id]
  )
  return mapRow(rows[0])
}

export async function findByFileId(fileId) {
  const rows = await dbQuery(
    `SELECT id FROM love_background_music WHERE file_id = ? LIMIT 1`,
    [fileId]
  )
  return rows[0]?.id || null
}

export async function maxSort() {
  const rows = await dbQuery('SELECT MAX(sort) AS m FROM love_background_music')
  return Number(rows[0]?.m || 0)
}

export async function createItem(payload) {
  const id = createId('bgm')
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await dbExecute(
    `INSERT INTO love_background_music
      (id, title, singer, epname, file_id, cover_img_url, enabled, loop_enabled, sort, remark, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.title,
      payload.singer,
      payload.epname,
      payload.fileId,
      payload.coverImgUrl || null,
      payload.enabled ? 1 : 0,
      payload.loopEnabled ? 1 : 0,
      payload.sort,
      payload.remark || null,
      now,
      now
    ]
  )
  return findById(id)
}

export async function updateItem(id, payload) {
  const fields = []
  const params = []
  const map = {
    title: 'title',
    singer: 'singer',
    epname: 'epname',
    fileId: 'file_id',
    coverImgUrl: 'cover_img_url',
    enabled: 'enabled',
    loopEnabled: 'loop_enabled',
    sort: 'sort',
    remark: 'remark'
  }
  Object.entries(map).forEach(([key, col]) => {
    if (payload[key] === undefined) return
    fields.push(`${col} = ?`)
    if (key === 'enabled' || key === 'loopEnabled') params.push(payload[key] ? 1 : 0)
    else params.push(payload[key])
  })
  if (!fields.length) return findById(id)
  fields.push('updated_at = ?')
  params.push(new Date().toISOString().slice(0, 19).replace('T', ' '))
  params.push(id)
  await dbExecute(`UPDATE love_background_music SET ${fields.join(', ')} WHERE id = ?`, params)
  return findById(id)
}

export async function removeItem(id) {
  const result = await dbExecute('DELETE FROM love_background_music WHERE id = ?', [id])
  return result.affectedRows > 0
}

export async function importRows(rows = []) {
  let imported = 0
  for (const row of rows) {
    if (!row.fileId) continue
    const exists = await findByFileId(row.fileId)
    if (exists) continue
    await createItem(row)
    imported += 1
  }
  return imported
}
