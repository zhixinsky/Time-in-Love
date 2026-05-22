import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { config } from '../config/index.js'
import { isDbEnabled } from './pool.js'
import { toCloudFileId } from '../utils/cloud-file-id.js'
import { createId } from '../utils/id.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCRIPTS_DIR = path.join(__dirname, '../../scripts')

const SCHEMA_FILES = [
  'schema.sql',
  'schema-space-v2.sql',
  'schema-diary.sql',
  'schema-diary-v2.sql',
  'schema-bill-v1.sql',
  'schema-checklist-v1.sql',
  'schema-qa-v1.sql',
  'schema-music.sql'
]

const IGNORABLE_CODES = new Set([
  'ER_DB_CREATE_EXISTS',
  'ER_TABLE_EXISTS_ERROR',
  'ER_DUP_FIELDNAME',
  'ER_DUP_KEYNAME',
  'ER_DUP_ENTRY',
  'ER_CANT_DROP_FIELD_OR_KEY'
])

function isIgnorableSqlError(err) {
  if (IGNORABLE_CODES.has(err?.code)) return true
  const msg = String(err?.message || '')
  return /Duplicate column|already exists|Duplicate key/i.test(msg)
}

async function runSqlFile(conn, filename, { optional = false } = {}) {
  const filePath = path.join(SCRIPTS_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.warn(`[db-bootstrap] skip missing ${filename}`)
    return
  }
  const sql = fs.readFileSync(filePath, 'utf8')
  try {
    await conn.query(sql)
    console.log(`[db-bootstrap] applied ${filename}`)
  } catch (err) {
    if (optional || isIgnorableSqlError(err)) {
      console.warn(`[db-bootstrap] ${filename} (ignored):`, err.message)
      return
    }
    throw err
  }
}

async function ensureDefaultBackgroundMusic(conn) {
  const db = config.mysql.database
  await conn.query(`USE \`${db}\``)
  const [rows] = await conn.query('SELECT COUNT(*) AS c FROM love_background_music')
  if (Number(rows[0]?.c || 0) > 0) return
  const cover = toCloudFileId(config.music.cloudEnv, config.music.bucket, config.music.coverKey)
  const fileId = toCloudFileId(config.music.cloudEnv, config.music.bucket, 'music/love-bgm.mp3')
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await conn.query(
    `INSERT INTO love_background_music
      (id, title, singer, epname, file_id, cover_img_url, enabled, loop_enabled, sort, remark, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?, ?)`,
    [createId('bgm'), '恋爱时光', 'AI星芽', '星芽恋记情侣空间', fileId, cover, '默认背景音乐', now, now]
  )
  console.log('[db-bootstrap] default background music inserted')
}

async function needsSeed(conn) {
  const db = config.mysql.database
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await conn.query(`USE \`${db}\``)
  const [rows] = await conn.query('SELECT COUNT(*) AS c FROM users')
  return Number(rows[0]?.c || 0) === 0
}

/** 云托管首次部署：自动创建 love 库并建表（解决 Unknown database 'love'） */
export async function bootstrapDatabase() {
  if (!isDbEnabled()) {
    console.log('[db-bootstrap] skip: mysql not configured')
    return false
  }

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000)
  })

  try {
    for (const file of SCHEMA_FILES) {
      await runSqlFile(conn, file, { optional: file !== 'schema.sql' })
    }

    if (await needsSeed(conn)) {
      await runSqlFile(conn, 'seed-data.sql', { optional: true })
      console.log('[db-bootstrap] seed applied')
    } else {
      console.log('[db-bootstrap] seed skipped (users exist)')
    }

    await ensureDefaultBackgroundMusic(conn)

    console.log(`[db-bootstrap] ready: ${config.mysql.database}`)
    return true
  } finally {
    await conn.end()
  }
}
