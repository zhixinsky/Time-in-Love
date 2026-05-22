import { dbExecute, dbQuery } from './pool.js'
import { createId } from '../utils/id.js'

function todayYmd() {
  return new Date().toISOString().slice(0, 10)
}

export async function findUserByOpenId(openId) {
  const rows = await dbQuery(
    `SELECT id, open_id AS openId, nickname, avatar_url AS avatarUrl, role, created_at AS createdAt
     FROM users WHERE open_id = ? LIMIT 1`,
    [openId]
  )
  return rows?.[0] || null
}

export async function findUserById(userId) {
  const rows = await dbQuery(
    `SELECT id, open_id AS openId, nickname, avatar_url AS avatarUrl, role, created_at AS createdAt
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  )
  return rows?.[0] || null
}

export async function createUser({ openId, nickname = '我', avatarUrl = '' }) {
  const id = createId('u')
  await dbExecute(
    `INSERT INTO users (id, open_id, nickname, avatar_url, role)
     VALUES (?, ?, ?, ?, 'member')`,
    [id, openId, nickname, avatarUrl]
  )
  return findUserById(id)
}

export async function touchUserLogin(userId) {
  try {
    await dbExecute('UPDATE users SET nickname = nickname WHERE id = ?', [userId])
  } catch {
    // Older schemas do not have last_login_at; keeping this hook harmless.
  }
}

export async function findCurrentSpaceForUser(userId) {
  const rows = await dbQuery(
    `SELECT s.id, s.name, s.subtitle, s.first_joined_at AS firstJoinedAt,
            s.love_start_date AS loveStartDate, s.couple_photo AS couplePhoto,
            s.created_at AS createdAt
     FROM spaces s
     INNER JOIN space_members sm ON sm.space_id = s.id
     WHERE sm.user_id = ?
     ORDER BY s.created_at ASC
     LIMIT 1`,
    [userId]
  )
  return rows?.[0] || null
}

export async function createDefaultSpaceForUser(userId) {
  const id = createId('space')
  const joinedAt = todayYmd()
  await dbExecute(
    `INSERT INTO spaces (id, name, subtitle, first_joined_at, love_start_date, couple_photo)
     VALUES (?, '恋爱时光', '记录我们的心动瞬间', ?, ?, '')`,
    [id, joinedAt, joinedAt]
  )
  await dbExecute('INSERT INTO space_members (space_id, user_id) VALUES (?, ?)', [id, userId])
  await dbExecute(
    `INSERT INTO anniversaries (id, space_id, title, anniversary_date, repeat_type)
     VALUES (?, ?, '恋爱纪念日', ?, 'yearly')`,
    [createId('a'), id, joinedAt]
  )
  return findCurrentSpaceForUser(userId)
}

export async function ensureCurrentSpace(userId) {
  const existing = await findCurrentSpaceForUser(userId)
  if (existing) return existing
  return createDefaultSpaceForUser(userId)
}
