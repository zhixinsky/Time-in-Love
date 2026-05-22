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
