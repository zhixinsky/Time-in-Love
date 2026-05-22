import { dbQuery, isDbEnabled } from '../db/pool.js'

const resourceMeta = {
  users: { title: '用户管理', columns: ['昵称', 'OpenID', '角色', '注册时间', '状态'] },
  spaces: { title: '情侣空间', columns: ['空间名称', '成员数', '恋爱开始日', '创建时间', '状态'] },
  diaries: { title: '心动日记', columns: ['作者', '摘要', '媒体数', '发布时间', '状态'] },
  anniversaries: { title: '纪念日', columns: ['标题', '日期', '重复规则', '空间', '状态'] },
  albums: { title: '时光相册', columns: ['资源', '类型', '关联日记', '上传时间', '状态'] },
  todos: { title: '恋爱清单', columns: ['标题', '分类', '完成状态', '官方', '创建时间'] },
  questions: { title: '甜蜜问答', columns: ['问题', '分类', '启用状态', '官方', '创建时间'] },
  bills: { title: '情侣账本', columns: ['分类', '金额', '类型', '账单日期', '备注'] },
  ai: { title: 'AI星芽', columns: ['场景', '模型', '结果摘要', '时间', '状态'] },
  reports: { title: '举报管理', columns: ['内容', '原因', '举报人', '时间', '状态'] },
  banners: { title: 'Banner管理', columns: ['标题', '位置', '排序', '时间', '状态'] },
  files: { title: '文件资源库', columns: ['文件', '类型', '来源', '时间', '状态'] },
  notifications: { title: '消息通知', columns: ['标题', '类型', '人群', '时间', '状态'] },
  admins: { title: '管理员权限', columns: ['账号', '角色', '最近登录', '时间', '状态'] }
}

function emptyResource(resource, page = 1, pageSize = 20) {
  return {
    resource,
    meta: resourceMeta[resource] || { title: resource, columns: [] },
    list: [],
    pagination: { page, pageSize, total: 0 }
  }
}

async function safeQuery(sql, params = []) {
  if (!isDbEnabled()) return []
  try {
    return (await dbQuery(sql, params)) || []
  } catch (err) {
    console.error('[admin-console] query failed', err.message)
    return []
  }
}

async function safeCount(table, where = '1=1') {
  const rows = await safeQuery(`SELECT COUNT(*) AS c FROM ${table} WHERE ${where}`)
  return Number(rows?.[0]?.c || 0)
}

function like(keyword) {
  return `%${String(keyword || '').trim()}%`
}

function pageParams(query = {}) {
  const page = Math.max(Number(query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 20, 1), 100)
  const offset = (page - 1) * pageSize
  const keyword = String(query.keyword || '').trim()
  return { page, pageSize, offset, keyword }
}

async function listWithCount(resource, query, sql, countSql, params = []) {
  const { page, pageSize, offset } = pageParams(query)
  const [list, countRows] = await Promise.all([
    safeQuery(`${sql} LIMIT ? OFFSET ?`, [...params, pageSize, offset]),
    safeQuery(countSql, params)
  ])
  return {
    resource,
    meta: resourceMeta[resource],
    list,
    pagination: { page, pageSize, total: Number(countRows?.[0]?.c || 0) }
  }
}

export async function getAdminDashboard() {
  const [users, spaces, diaries, images, aiCalls] = await Promise.all([
    safeCount('users', 'DATE(created_at) = CURDATE()'),
    safeCount('spaces', 'DATE(created_at) = CURDATE()'),
    safeCount('diaries', 'DATE(created_at) = CURDATE() AND (deleted_at IS NULL OR deleted_at = 0)'),
    safeCount('diary_media', "DATE(created_at) = CURDATE() AND type = 'image'"),
    safeCount('ai_generation_logs')
  ])
  const activeRows = await safeQuery(
    `SELECT name FROM spaces ORDER BY created_at DESC LIMIT 5`
  )
  const activityRows = await safeQuery(
    `SELECT 'diary' AS type, CONCAT('发布日记：', LEFT(content, 18)) AS title, created_at AS createdAt
     FROM diaries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`
  )
  return {
    today: { users, spaces, diaries, images, aiCalls },
    growth: [],
    ai: { diarySummary: 0, chat: 0, loveLetter: aiCalls },
    activeCouples: activeRows.map((item) => item.name),
    activities: activityRows
  }
}

export async function listAdminResource(resource, query = {}) {
  const { page, pageSize, keyword } = pageParams(query)
  if (!resourceMeta[resource]) return emptyResource(resource, page, pageSize)
  const kw = like(keyword)

  if (resource === 'users') {
    return listWithCount(
      resource,
      query,
      `SELECT id, nickname AS name, open_id AS user, role AS tag, created_at AS createdAt, '正常' AS status
       FROM users WHERE (? = '' OR nickname LIKE ? OR open_id LIKE ?) ORDER BY created_at DESC`,
      `SELECT COUNT(*) AS c FROM users WHERE (? = '' OR nickname LIKE ? OR open_id LIKE ?)`,
      [keyword, kw, kw]
    )
  }
  if (resource === 'spaces') {
    return listWithCount(
      resource,
      query,
      `SELECT s.id, s.name, CAST(COUNT(sm.user_id) AS CHAR) AS user, s.love_start_date AS tag,
              s.created_at AS createdAt, '正常' AS status
       FROM spaces s LEFT JOIN space_members sm ON sm.space_id = s.id
       WHERE (? = '' OR s.name LIKE ?)
       GROUP BY s.id ORDER BY s.created_at DESC`,
      `SELECT COUNT(*) AS c FROM spaces WHERE (? = '' OR name LIKE ?)`,
      [keyword, kw]
    )
  }
  if (resource === 'diaries') {
    return listWithCount(
      resource,
      query,
      `SELECT d.id, LEFT(d.content, 42) AS name, d.user_id AS user, CAST(COUNT(m.id) AS CHAR) AS tag,
              d.created_at AS createdAt, IF(d.deleted_at IS NULL, '正常', '已删除') AS status
       FROM diaries d LEFT JOIN diary_media m ON m.diary_id = d.id
       WHERE (? = '' OR d.content LIKE ? OR d.mood LIKE ?)
       GROUP BY d.id ORDER BY d.created_at DESC`,
      `SELECT COUNT(*) AS c FROM diaries WHERE (? = '' OR content LIKE ? OR mood LIKE ?)`,
      [keyword, kw, kw]
    )
  }
  if (resource === 'anniversaries') {
    return listWithCount(
      resource,
      query,
      `SELECT id, title AS name, space_id AS user, repeat_type AS tag, anniversary_date AS createdAt, '正常' AS status
       FROM anniversaries WHERE (? = '' OR title LIKE ?) ORDER BY anniversary_date ASC`,
      `SELECT COUNT(*) AS c FROM anniversaries WHERE (? = '' OR title LIKE ?)`,
      [keyword, kw]
    )
  }
  if (resource === 'albums' || resource === 'files') {
    return listWithCount(
      resource,
      query,
      `SELECT id, url AS name, type AS user, diary_id AS tag, created_at AS createdAt, '正常' AS status
       FROM diary_media WHERE (? = '' OR url LIKE ? OR type LIKE ?) ORDER BY created_at DESC`,
      `SELECT COUNT(*) AS c FROM diary_media WHERE (? = '' OR url LIKE ? OR type LIKE ?)`,
      [keyword, kw, kw]
    )
  }
  if (resource === 'todos') {
    return listWithCount(
      resource,
      query,
      `SELECT id, title AS name, category AS user, IF(completed, '已完成', '未完成') AS status,
              IF(official, '官方', '自定义') AS tag, created_at AS createdAt
       FROM love_check_items WHERE (? = '' OR title LIKE ? OR category LIKE ?) ORDER BY created_at DESC`,
      `SELECT COUNT(*) AS c FROM love_check_items WHERE (? = '' OR title LIKE ? OR category LIKE ?)`,
      [keyword, kw, kw]
    )
  }
  if (resource === 'questions') {
    return listWithCount(
      resource,
      query,
      `SELECT id, content AS name, category AS user, IF(enabled, '启用', '停用') AS status,
              IF(official, '官方', '自定义') AS tag, created_at AS createdAt
       FROM sweet_questions WHERE (? = '' OR content LIKE ? OR category LIKE ?) ORDER BY created_at DESC`,
      `SELECT COUNT(*) AS c FROM sweet_questions WHERE (? = '' OR content LIKE ? OR category LIKE ?)`,
      [keyword, kw, kw]
    )
  }
  if (resource === 'bills') {
    return listWithCount(
      resource,
      query,
      `SELECT id, category AS name, CAST(amount AS CHAR) AS user, type AS status, note AS tag, bill_date AS createdAt
       FROM bill_records WHERE (? = '' OR category LIKE ? OR note LIKE ?) ORDER BY bill_date DESC`,
      `SELECT COUNT(*) AS c FROM bill_records WHERE (? = '' OR category LIKE ? OR note LIKE ?)`,
      [keyword, kw, kw]
    )
  }

  return emptyResource(resource, page, pageSize)
}

export async function getReviewQueue() {
  return { list: [], summary: { pending: 0, approved: 0, rejected: 0 } }
}

export async function getSystemConfig() {
  return {
    app: { name: '星芽恋记', logo: '', defaultBackground: '', defaultAvatar: '' },
    ai: { model: process.env.MIMO_MODEL || 'mimo-v2-flash', promptTemplate: '你是星芽恋记里的温柔恋爱陪伴助手。', dailyLimit: 1000 },
    storage: { provider: 'wechat-cloud', cosBucket: process.env.COS_BUCKET || '', ossBucket: '' },
    content: { maxImages: 9, maxVideoSizeMb: 200, aiLimitPerDay: 20 }
  }
}
