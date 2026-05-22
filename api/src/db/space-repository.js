import { dbExecute, dbQuery } from './pool.js'
import { daysBetween, isSameMonthDay } from '../utils/date.js'
import { createId } from '../utils/id.js'

export async function findSpaceById(spaceId) {
  const rows = await dbQuery(
    `SELECT id, name, subtitle, first_joined_at AS firstJoinedAt,
            love_start_date AS loveStartDate, couple_photo AS couplePhoto, invite_code AS inviteCode
     FROM spaces WHERE id = ? LIMIT 1`,
    [spaceId]
  )
  return rows?.[0] || null
}

export async function updateSpace(spaceId, payload = {}) {
  const fields = []
  const params = []
  const map = {
    name: 'name',
    subtitle: 'subtitle',
    loveStartDate: 'love_start_date',
    couplePhoto: 'couple_photo'
  }
  Object.entries(map).forEach(([key, column]) => {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      params.push(payload[key] || null)
    }
  })
  if (!fields.length) return findSpaceById(spaceId)
  params.push(spaceId)
  await dbExecute(`UPDATE spaces SET ${fields.join(', ')} WHERE id = ?`, params)
  return findSpaceById(spaceId)
}

export async function createSpaceForUser(userId, payload = {}) {
  const id = createId('space')
  const firstJoinedAt = new Date().toISOString().slice(0, 10)
  const loveStartDate = payload.loveStartDate || firstJoinedAt
  await dbExecute(
    `INSERT INTO spaces (id, name, subtitle, first_joined_at, love_start_date, couple_photo, invite_code)
     VALUES (?, ?, ?, ?, ?, ?, '')`,
    [
      id,
      payload.name || '恋爱时光',
      payload.subtitle || '记录我们的心动瞬间',
      firstJoinedAt,
      loveStartDate,
      payload.couplePhoto || ''
    ]
  )
  await dbExecute('INSERT IGNORE INTO space_members (space_id, user_id) VALUES (?, ?)', [id, userId])
  await dbExecute(
    `INSERT INTO anniversaries (id, space_id, title, anniversary_date, repeat_type)
     VALUES (?, ?, '恋爱纪念日', ?, 'yearly')`,
    [createId('a'), id, loveStartDate]
  )
  return findSpaceById(id)
}

export async function countMembers(spaceId) {
  const rows = await dbQuery('SELECT COUNT(*) AS c FROM space_members WHERE space_id = ?', [spaceId])
  return Number(rows?.[0]?.c || 0)
}

export async function saveInviteCode(spaceId, inviteCode) {
  await dbExecute('UPDATE spaces SET invite_code = ? WHERE id = ?', [inviteCode, spaceId])
  return findSpaceById(spaceId)
}

export async function findSpaceByInviteCode(inviteCode) {
  const rows = await dbQuery(
    `SELECT id, name, subtitle, first_joined_at AS firstJoinedAt,
            love_start_date AS loveStartDate, couple_photo AS couplePhoto, invite_code AS inviteCode
     FROM spaces WHERE invite_code = ? LIMIT 1`,
    [inviteCode]
  )
  return rows?.[0] || null
}

export async function joinSpace(spaceId, userId) {
  await dbExecute('INSERT IGNORE INTO space_members (space_id, user_id) VALUES (?, ?)', [spaceId, userId])
  return findSpaceById(spaceId)
}

export async function findDashboard(spaceId) {
  const space = await findSpaceById(spaceId)
  if (!space) return null

  const anniversaries = await dbQuery(
    `SELECT id, space_id AS spaceId, title, anniversary_date AS date, repeat_type AS repeatType
     FROM anniversaries WHERE space_id = ?`,
    [spaceId]
  )

  const moods = await dbQuery(
    `SELECT owner_label AS owner, avatar, mood_text AS mood
     FROM moods WHERE space_id = ? AND mood_date = CURDATE()`,
    [spaceId]
  )

  const bills = await dbQuery(
    `SELECT expense, income, bill_month AS month
     FROM bill_monthly WHERE space_id = ? AND bill_month = DATE_FORMAT(CURDATE(), '%Y-%m') LIMIT 1`,
    [spaceId]
  )

  const diaries = await dbQuery(
    `SELECT id, space_id AS spaceId, content, mood, weather, location, created_at AS createdAt
     FROM diaries WHERE space_id = ? ORDER BY created_at DESC LIMIT 1`,
    [spaceId]
  )

  const loveStartDate = space.loveStartDate || space.firstJoinedAt
  const loveDays = daysBetween(loveStartDate)
  const milestone = anniversaries?.find((a) => a.repeatType === 'yearly' && isSameMonthDay(a.date))
  let currentAnniversaryName = milestone?.title || ''
  if (!currentAnniversaryName && [99, 100, 365, 520, 999, 1314].includes(loveDays)) {
    currentAnniversaryName = `${loveDays}天纪念日`
  }

  return {
    space,
    loveDays,
    currentAnniversaryName,
    moods: moods || [],
    bills: bills?.[0] || { expense: 0, income: 0, month: '' },
    latestDiary: diaries?.[0] || null,
    anniversaries: anniversaries || []
  }
}

export async function listAnniversaries(spaceId) {
  return dbQuery(
    `SELECT id, space_id AS spaceId, title, anniversary_date AS date, repeat_type AS repeatType
     FROM anniversaries WHERE space_id = ? ORDER BY anniversary_date ASC`,
    [spaceId]
  )
}

export async function createAnniversary(spaceId, payload = {}) {
  const id = createId('a')
  await dbExecute(
    `INSERT INTO anniversaries (id, space_id, title, anniversary_date, repeat_type)
     VALUES (?, ?, ?, ?, ?)`,
    [id, spaceId, payload.title || '新的纪念日', payload.date, payload.repeatType || 'yearly']
  )
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, title, anniversary_date AS date, repeat_type AS repeatType
     FROM anniversaries WHERE id = ? LIMIT 1`,
    [id]
  )
  return rows?.[0] || null
}

export async function updateAnniversary(spaceId, id, payload = {}) {
  const fields = []
  const params = []
  const map = {
    title: 'title',
    date: 'anniversary_date',
    repeatType: 'repeat_type'
  }
  Object.entries(map).forEach(([key, column]) => {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      params.push(payload[key])
    }
  })
  if (fields.length) {
    params.push(spaceId, id)
    await dbExecute(`UPDATE anniversaries SET ${fields.join(', ')} WHERE space_id = ? AND id = ?`, params)
  }
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, title, anniversary_date AS date, repeat_type AS repeatType
     FROM anniversaries WHERE space_id = ? AND id = ? LIMIT 1`,
    [spaceId, id]
  )
  return rows?.[0] || null
}

export async function deleteAnniversary(spaceId, id) {
  const result = await dbExecute('DELETE FROM anniversaries WHERE space_id = ? AND id = ?', [spaceId, id])
  return Number(result?.affectedRows || 0) > 0
}

export async function listAllSpaces() {
  return dbQuery(
    `SELECT id, name, subtitle, first_joined_at AS firstJoinedAt,
            love_start_date AS loveStartDate, couple_photo AS couplePhoto
     FROM spaces ORDER BY created_at DESC`
  )
}

export async function listAllUsers() {
  return dbQuery(
    `SELECT id, open_id AS openId, nickname, role FROM users ORDER BY created_at DESC`
  )
}

export async function listAllDiaries() {
  return dbQuery(
    `SELECT id, space_id AS spaceId, content, mood, weather, location, created_at AS createdAt
     FROM diaries ORDER BY created_at DESC LIMIT 100`
  )
}

export async function countOverview() {
  const users = await dbQuery('SELECT COUNT(*) AS c FROM users')
  const spaces = await dbQuery('SELECT COUNT(*) AS c FROM spaces')
  const diaries = await dbQuery('SELECT COUNT(*) AS c FROM diaries')
  const moods = await dbQuery('SELECT COUNT(*) AS c FROM moods')
  return {
    userCount: Number(users?.[0]?.c ?? 0),
    spaceCount: Number(spaces?.[0]?.c ?? 0),
    diaryCount: Number(diaries?.[0]?.c ?? 0),
    moodCount: Number(moods?.[0]?.c ?? 0)
  }
}
