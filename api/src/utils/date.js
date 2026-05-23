/** 将 DB/ISO 值格式化为本地日历 YYYY-MM-DD（避免 toISOString 时区偏移） */
export function formatYmdLocal(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
    return m ? m[1] : value.slice(0, 10)
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const mo = `${value.getMonth() + 1}`.padStart(2, '0')
    const d = `${value.getDate()}`.padStart(2, '0')
    return `${y}-${mo}-${d}`
  }
  return String(value).slice(0, 10)
}

export function daysBetween(startDate, endDate = new Date()) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(endDate)
  const current = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const diff = current.getTime() - start.getTime()
  return Math.max(1, Math.floor(diff / 86400000) + 1)
}

export function isSameMonthDay(leftDate, rightDate = new Date()) {
  const left = new Date(`${leftDate}T00:00:00`)
  const right = new Date(rightDate)
  return left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}
