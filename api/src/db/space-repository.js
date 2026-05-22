import { dbQuery } from './pool.js'
import { daysBetween, isSameMonthDay } from '../utils/date.js'

export async function findSpaceById(spaceId) {
  const rows = await dbQuery(
    `SELECT id, name, subtitle, first_joined_at AS firstJoinedAt,
            love_start_date AS loveStartDate, couple_photo AS couplePhoto
     FROM spaces WHERE id = ? LIMIT 1`,
    [spaceId]
  )
  return rows?.[0] || null
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
