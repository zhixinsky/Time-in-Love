const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']

export function formatYmd(date = new Date()) {
  const d = date instanceof Date ? date : new Date(`${date}T00:00:00`)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseYmd(value) {
  return new Date(`${value.replace(/\./g, '-')}T00:00:00`)
}

export function formatVideoDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${`${s}`.padStart(2, '0')}`
}

export function formatDiaryTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

/** 以周日为一周起点，weekOffset 为相对锚点日所在周的偏移 */
export function buildWeekDays(anchorYmd, weekOffset = 0) {
  const anchor = parseYmd(anchorYmd)
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - anchor.getDay() + weekOffset * 7)
  const todayYmd = formatYmd(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const ymd = formatYmd(date)
    return {
      ymd,
      weekday: WEEKDAY_SHORT[date.getDay()],
      day: date.getDate(),
      isToday: ymd === todayYmd
    }
  })
}
