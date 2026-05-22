/**
 * 初始化云托管 MySQL：node scripts/init-db.js
 * 需先在 .env 填写 MYSQL_HOST（控制台内网地址）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { config } from '../src/config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!config.mysql.host) {
  console.error('请配置 MySQL：云托管使用 MYSQL_ADDRESS，本地 .env 可用 MYSQL_HOST 或 MYSQL_ADDRESS')
  process.exit(1)
}

async function run() {
  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true
  })

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  const seed = fs.readFileSync(path.join(__dirname, 'seed-data.sql'), 'utf8')

  await conn.query(schema)
  console.log('[init-db] schema ok')

  await conn.query(`USE ${config.mysql.database}`)
  await conn.query(seed)
  console.log('[init-db] seed ok')

  await conn.end()
  console.log('[init-db] done')
}

run().catch((err) => {
  console.error('[init-db] failed', err.message)
  process.exit(1)
})
