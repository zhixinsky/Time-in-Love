import { dbExecute, dbQuery } from './pool.js'
import { createId } from '../utils/id.js'

function monthRange(month) {
  const value = month || new Date().toISOString().slice(0, 7)
  return {
    month: value,
    start: `${value}-01`,
    end: `${value}-31`
  }
}

export async function listBills(spaceId, { month, page = 1, pageSize = 50 } = {}) {
  const range = monthRange(month)
  const offset = (Number(page) - 1) * Number(pageSize)
  return dbQuery(
    `SELECT id, space_id AS spaceId, user_id AS userId, type, category, amount, note,
            bill_date AS billDate, created_at AS createdAt
     FROM bill_records
     WHERE space_id = ? AND bill_date BETWEEN ? AND ?
     ORDER BY bill_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [spaceId, range.start, range.end, Number(pageSize), offset]
  )
}

export async function getBillSummary(spaceId, { month } = {}) {
  const range = monthRange(month)
  const totals = await dbQuery(
    `SELECT type, SUM(amount) AS total
     FROM bill_records
     WHERE space_id = ? AND bill_date BETWEEN ? AND ?
     GROUP BY type`,
    [spaceId, range.start, range.end]
  )
  const categories = await dbQuery(
    `SELECT category, type, SUM(amount) AS total, COUNT(*) AS count
     FROM bill_records
     WHERE space_id = ? AND bill_date BETWEEN ? AND ?
     GROUP BY category, type
     ORDER BY total DESC`,
    [spaceId, range.start, range.end]
  )
  return {
    month: range.month,
    expense: Number(totals?.find((item) => item.type === 'expense')?.total || 0),
    income: Number(totals?.find((item) => item.type === 'income')?.total || 0),
    categories: (categories || []).map((item) => ({
      category: item.category,
      type: item.type,
      total: Number(item.total || 0),
      count: Number(item.count || 0)
    }))
  }
}

export async function createBill(spaceId, userId, payload = {}) {
  const id = createId('bill')
  await dbExecute(
    `INSERT INTO bill_records (id, space_id, user_id, type, category, amount, note, bill_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      spaceId,
      userId,
      payload.type === 'income' ? 'income' : 'expense',
      payload.category || '其他',
      Number(payload.amount || 0),
      payload.note || '',
      payload.billDate || new Date().toISOString().slice(0, 10)
    ]
  )
  const rows = await dbQuery(
    `SELECT id, space_id AS spaceId, user_id AS userId, type, category, amount, note,
            bill_date AS billDate, created_at AS createdAt
     FROM bill_records WHERE id = ? LIMIT 1`,
    [id]
  )
  return rows?.[0] || null
}

export async function deleteBill(spaceId, id) {
  const result = await dbExecute('DELETE FROM bill_records WHERE space_id = ? AND id = ?', [spaceId, id])
  return Number(result?.affectedRows || 0) > 0
}
