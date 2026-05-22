import mysql from 'mysql2/promise'
import { config } from '../config/index.js'

let pool = null

export function isDbEnabled() {
  return Boolean(config.mysql.host && config.mysql.password)
}

export function getPool() {
  if (!isDbEnabled()) return null
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+08:00'
    })
  }
  return pool
}

export async function dbQuery(sql, params = []) {
  const p = getPool()
  if (!p) return null
  const [rows] = await p.query(sql, params)
  return rows
}
