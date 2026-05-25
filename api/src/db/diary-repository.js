import { dbExecute, dbQuery } from './pool.js'
import { formatYmdLocal } from '../utils/date.js'
import { createId } from '../utils/id.js'

function formatDate(value) {
  return formatYmdLocal(value)
}

function normalizeDiary(row) {
  if (!row) return null
  return {
    id: row.id,
    spaceId: row.spaceId,
    userId: row.userId,
    content: row.content || '',
    mood: row.mood || '',
    weather: row.weather || '',
    temperature: row.temperature || '',
    locationName: row.locationName || '',
    locationLat: row.locationLat ?? null,
    locationLng: row.locationLng ?? null,
    visibility: row.visibility || 'both',
    aiSummary: row.aiSummary || '',
    loveDay: Number(row.loveDay || 1),
    diaryDate: formatDate(row.diaryDate),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    deletedAt: row.deletedAt || null
  }
}

function normalizeMedia(row) {
  return {
    id: row.id,
    diaryId: row.diaryId,
    type: row.type,
    url: row.url,
    coverUrl: row.coverUrl || '',
    duration: Number(row.duration || 0),
    sort: Number(row.sort || 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt
  }
}

function detailPayload(diary, media = []) {
  if (!diary) {
    return { diary: null, mediaList: [], author: null, aiSummary: '' }
  }
  return {
    diary,
    mediaList: media,
    author: { id: diary.userId, nickname: '我', avatar: '💕' },
    aiSummary: diary.aiSummary
  }
}

function selectDiarySql(where) {
  return `SELECT id, space_id AS spaceId, user_id AS userId, content, mood, weather, temperature,
                 location_name AS locationName, location_lat AS locationLat, location_lng AS locationLng,
                 visibility, ai_summary AS aiSummary, love_day AS loveDay, diary_date AS diaryDate,
                 created_at AS createdAt, updated_at AS updatedAt, deleted_at AS deletedAt
          FROM diaries
          WHERE ${where}`
}

export async function mediaByDiaryId(diaryId) {
  const rows = await dbQuery(
    `SELECT id, diary_id AS diaryId, type, url, cover_url AS coverUrl, duration, sort, created_at AS createdAt
     FROM diary_media WHERE diary_id = ? ORDER BY sort ASC`,
    [diaryId]
  )
  return (rows || []).map(normalizeMedia)
}

/** 批量拉取媒体，避免时间线 N+1 查询 */
async function mediaMapByDiaryIds(diaryIds = []) {
  const ids = [...new Set(diaryIds.filter(Boolean))]
  if (!ids.length) return new Map()
  const placeholders = ids.map(() => '?').join(',')
  const rows = await dbQuery(
    `SELECT id, diary_id AS diaryId, type, url, cover_url AS coverUrl, duration, sort, created_at AS createdAt
     FROM diary_media WHERE diary_id IN (${placeholders}) ORDER BY diary_id ASC, sort ASC`,
    ids
  )
  const map = new Map()
  for (const row of rows || []) {
    const media = normalizeMedia(row)
    if (!map.has(media.diaryId)) map.set(media.diaryId, [])
    map.get(media.diaryId).push(media)
  }
  return map
}

function mapTimelineItem(diary, media = []) {
  const cover =
    media.find((item) => item.type === 'image') ||
    media.find((item) => item.type === 'video' && item.coverUrl) ||
    media.find((item) => item.type === 'video')
  const content = (diary.content || '').replace(/\s+/g, ' ').trim()
  return {
    id: diary.id,
    contentPreview: content.length > 48 ? `${content.slice(0, 48)}…` : content,
    date: diary.diaryDate,
    loveDay: diary.loveDay,
    coverImage: cover?.coverUrl || cover?.url || '',
    mood: diary.mood,
    isAnniversary: false,
    author: '我',
    content: diary.content,
    mediaList: media.map((m) => ({
      type: m.type,
      url: m.url,
      coverUrl: m.coverUrl || '',
      duration: m.duration || 0
    }))
  }
}

function canViewSql(userId) {
  return `(visibility <> 'self' OR user_id = '${String(userId).replace(/'/g, "''")}')`
}

export async function findByDate(spaceId, userId, date) {
  const rows = await dbQuery(
    `${selectDiarySql(`space_id = ? AND diary_date = ? AND deleted_at IS NULL AND ${canViewSql(userId)}`)}
     ORDER BY created_at DESC LIMIT 1`,
    [spaceId, date]
  )
  const diary = normalizeDiary(rows?.[0])
  if (!diary) return null
  return detailPayload(diary, await mediaByDiaryId(diary.id))
}

export async function findRecentDetails(spaceId, userId, dates = []) {
  const normalizedDates = [...new Set((dates || []).map(formatDate).filter(Boolean))]
  if (!normalizedDates.length) return []

  const placeholders = normalizedDates.map(() => '?').join(',')
  const rows = await dbQuery(
    `${selectDiarySql(`space_id = ? AND diary_date IN (${placeholders}) AND deleted_at IS NULL AND ${canViewSql(userId)}`)}
     ORDER BY diary_date DESC, created_at DESC`,
    [spaceId, ...normalizedDates]
  )

  const diaryMap = new Map()
  for (const row of rows || []) {
    const diary = normalizeDiary(row)
    const key = formatDate(diary?.diaryDate)
    if (key && !diaryMap.has(key)) {
      diaryMap.set(key, diary)
    }
  }

  const mediaMap = await mediaMapByDiaryIds([...diaryMap.values()].map((item) => item.id))
  return normalizedDates.map((date) => {
    const diary = diaryMap.get(date) || null
    return {
      date,
      hasDiary: Boolean(diary),
      detail: detailPayload(diary, diary ? mediaMap.get(diary.id) || [] : [])
    }
  })
}

export async function timeline(spaceId, userId, page = 1, pageSize = 10) {
  const limit = Number(pageSize)
  const offset = (Number(page) - 1) * limit
  const where = `space_id = ? AND deleted_at IS NULL AND ${canViewSql(userId)}`
  const [countRows, rows] = await Promise.all([
    dbQuery(`SELECT COUNT(*) AS c FROM diaries WHERE ${where}`, [spaceId]),
    dbQuery(
      `${selectDiarySql(where)} ORDER BY diary_date DESC, created_at DESC LIMIT ? OFFSET ?`,
      [spaceId, limit, offset]
    )
  ])
  const diaries = (rows || []).map(normalizeDiary)
  const mediaMap = await mediaMapByDiaryIds(diaries.map((d) => d.id))
  const list = diaries.map((diary) => mapTimelineItem(diary, mediaMap.get(diary.id) || []))
  return { total: Number(countRows?.[0]?.c || 0), list }
}

export async function findById(spaceId, userId, id) {
  const rows = await dbQuery(
    `${selectDiarySql(`space_id = ? AND id = ? AND deleted_at IS NULL AND ${canViewSql(userId)}`)} LIMIT 1`,
    [spaceId, id]
  )
  const diary = normalizeDiary(rows?.[0])
  if (!diary) return null
  return detailPayload(diary, await mediaByDiaryId(diary.id))
}

async function replaceMedia(diaryId, mediaList = [], createdAt = new Date()) {
  await dbExecute('DELETE FROM diary_media WHERE diary_id = ?', [diaryId])
  for (let index = 0; index < mediaList.length; index += 1) {
    const item = mediaList[index]
    await dbExecute(
      `INSERT INTO diary_media (id, diary_id, type, url, cover_url, duration, sort, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createId('dm'),
        diaryId,
        item.type === 'video' ? 'video' : 'image',
        item.url,
        item.coverUrl || '',
        Number(item.duration || 0),
        index,
        createdAt
      ]
    )
  }
}

export async function createDiary(spaceId, userId, payload) {
  const id = createId('d')
  const now = new Date()
  await dbExecute(
    `INSERT INTO diaries (
      id, space_id, user_id, content, mood, weather, temperature, location_name, location_lat, location_lng,
      visibility, ai_summary, love_day, diary_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      spaceId,
      userId,
      payload.content || '',
      payload.mood || '',
      payload.weather || '',
      payload.temperature || '',
      payload.locationName || '',
      payload.locationLat ?? null,
      payload.locationLng ?? null,
      payload.visibility === 'self' ? 'self' : 'both',
      payload.aiSummary || '',
      Number(payload.loveDay || 1),
      payload.diaryDate,
      now,
      now
    ]
  )
  await replaceMedia(id, payload.mediaList || [], now)
  return findById(spaceId, userId, id)
}

export async function updateDiary(spaceId, userId, id, payload) {
  const detail = await findById(spaceId, userId, id)
  if (!detail) return null
  if (detail.diary.userId !== userId) {
    const err = new Error('只有作者可以修改日记')
    err.status = 403
    err.code = 'FORBIDDEN'
    throw err
  }
  const fields = []
  const params = []
  const map = {
    content: 'content',
    mood: 'mood',
    weather: 'weather',
    temperature: 'temperature',
    locationName: 'location_name',
    locationLat: 'location_lat',
    locationLng: 'location_lng',
    visibility: 'visibility',
    aiSummary: 'ai_summary',
    loveDay: 'love_day',
    diaryDate: 'diary_date'
  }
  Object.entries(map).forEach(([key, column]) => {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      params.push(payload[key])
    }
  })
  fields.push('updated_at = ?')
  const now = new Date()
  params.push(now, spaceId, id)
  await dbExecute(`UPDATE diaries SET ${fields.join(', ')} WHERE space_id = ? AND id = ?`, params)
  if (payload.mediaList) await replaceMedia(id, payload.mediaList, now)
  return findById(spaceId, userId, id)
}

export async function softDelete(spaceId, userId, id) {
  const detail = await findById(spaceId, userId, id)
  if (!detail) return false
  if (detail.diary.userId !== userId) {
    const err = new Error('只有作者可以删除日记')
    err.status = 403
    err.code = 'FORBIDDEN'
    throw err
  }
  const result = await dbExecute('UPDATE diaries SET deleted_at = ? WHERE space_id = ? AND id = ?', [new Date(), spaceId, id])
  return Number(result?.affectedRows || 0) > 0
}

export async function updateAiSummary(spaceId, userId, id, summary) {
  await dbExecute('UPDATE diaries SET ai_summary = ?, updated_at = ? WHERE space_id = ? AND id = ?', [
    summary,
    new Date(),
    spaceId,
    id
  ])
  return findById(spaceId, userId, id)
}

export async function albumMedia(spaceId, userId, page = 1, pageSize = 30) {
  const rows = await dbQuery(
    `SELECT m.id, m.diary_id AS diaryId, m.type, m.url, m.cover_url AS coverUrl, m.duration, m.created_at AS createdAt,
            d.diary_date AS date, d.mood, d.location_name AS locationName, d.content
     FROM diary_media m
     INNER JOIN diaries d ON d.id = m.diary_id
     WHERE d.space_id = ? AND d.deleted_at IS NULL AND ${canViewSql(userId)}
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [spaceId, Number(pageSize), (Number(page) - 1) * Number(pageSize)]
  )
  const countRows = await dbQuery(
    `SELECT m.type, COUNT(*) AS c
     FROM diary_media m INNER JOIN diaries d ON d.id = m.diary_id
     WHERE d.space_id = ? AND d.deleted_at IS NULL AND ${canViewSql(userId)}
     GROUP BY m.type`,
    [spaceId]
  )
  const list = (rows || []).map((row) => ({
    id: row.id,
    diaryId: row.diaryId,
    type: row.type,
    url: row.url,
    coverUrl: row.coverUrl || row.url,
    duration: Number(row.duration || 0),
    date: formatDate(row.date),
    mood: row.mood || '',
    locationName: row.locationName || '',
    contentPreview: (row.content || '').slice(0, 32),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt
  }))
  const images = Number(countRows?.find((item) => item.type === 'image')?.c || 0)
  const videos = Number(countRows?.find((item) => item.type === 'video')?.c || 0)
  return { total: images + videos, list, stats: { images, videos } }
}
