import * as billRepo from '../db/bill-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { createId } from '../utils/id.js'

const memoryBills = new Map()

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function filterBills(spaceId, month = currentMonth()) {
  return (memoryBills.get(spaceId) || [])
    .filter((item) => item.billDate?.startsWith(month))
    .sort((a, b) => `${b.billDate}${b.createdAt}`.localeCompare(`${a.billDate}${a.createdAt}`))
}

function summarize(list, month = currentMonth()) {
  const summary = {
    month,
    expense: 0,
    income: 0,
    categories: []
  }
  const categoryMap = new Map()
  list.forEach((item) => {
    const amount = Number(item.amount || 0)
    summary[item.type === 'income' ? 'income' : 'expense'] += amount
    const key = `${item.type}:${item.category}`
    const row = categoryMap.get(key) || { category: item.category, type: item.type, total: 0, count: 0 }
    row.total += amount
    row.count += 1
    categoryMap.set(key, row)
  })
  summary.categories = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
  return summary
}

export async function listBills(spaceId, query = {}) {
  const month = query.month || currentMonth()
  if (isDbEnabled()) {
    try {
      const [list, summary] = await Promise.all([
        billRepo.listBills(spaceId, { month, page: query.page || 1, pageSize: query.pageSize || 50 }),
        billRepo.getBillSummary(spaceId, { month })
      ])
      return { list: list || [], summary }
    } catch (err) {
      console.error('[bill-service] db list failed, fallback memory', err.message)
    }
  }
  const list = filterBills(spaceId, month)
  return { list, summary: summarize(list, month) }
}

export async function createBill(spaceId, userId, payload = {}) {
  const amount = Number(payload.amount || 0)
  if (!amount || amount <= 0) {
    const err = new Error('请输入有效金额')
    err.status = 400
    err.code = 'INVALID_AMOUNT'
    throw err
  }
  if (isDbEnabled()) {
    try {
      return await billRepo.createBill(spaceId, userId, payload)
    } catch (err) {
      console.error('[bill-service] db create failed, fallback memory', err.message)
    }
  }
  const item = {
    id: createId('bill'),
    spaceId,
    userId,
    type: payload.type === 'income' ? 'income' : 'expense',
    category: payload.category || '其他',
    amount,
    note: payload.note || '',
    billDate: payload.billDate || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  }
  const list = memoryBills.get(spaceId) || []
  list.unshift(item)
  memoryBills.set(spaceId, list)
  return item
}

export async function deleteBill(spaceId, id) {
  if (isDbEnabled()) {
    try {
      return await billRepo.deleteBill(spaceId, id)
    } catch (err) {
      console.error('[bill-service] db delete failed, fallback memory', err.message)
    }
  }
  const list = memoryBills.get(spaceId) || []
  const next = list.filter((item) => item.id !== id)
  memoryBills.set(spaceId, next)
  return next.length !== list.length
}
