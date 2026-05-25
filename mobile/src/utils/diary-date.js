const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']

/** 统一为 YYYY-MM-DD，避免 picker / API 格式不一致导致无法匹配高亮 */
export function normalizeYmd(value) {
  if (!value) return ''
  const s = String(value).trim()
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return s.slice(0, 10)
  return `${m[1]}-${`${m[2]}`.padStart(2, '0')}-${`${m[3]}`.padStart(2, '0')}`
}

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

/** 以选中日期为中心，生成可横向滚动的日期条（左右各 radius 天） */
export function buildDateStrip(centerYmd, radius = 45) {
  const center = parseYmd(normalizeYmd(centerYmd) || formatYmd(new Date()))
  const todayYmd = formatYmd(new Date())
  const items = []
  for (let offset = -radius; offset <= radius; offset += 1) {
    const date = new Date(center)
    date.setDate(center.getDate() + offset)
    const ymd = formatYmd(date)
    items.push({
      ymd,
      weekday: WEEKDAY_SHORT[date.getDay()],
      day: date.getDate(),
      isToday: ymd === todayYmd
    })
  }
  return items
}

/** 以周一为一周起点，weekOffset 为相对锚点日所在周的偏移 */
export function buildWeekDays(anchorYmd, weekOffset = 0) {
  const anchor = parseYmd(normalizeYmd(anchorYmd) || formatYmd(new Date()))
  const start = new Date(anchor)
  const day = anchor.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  start.setDate(anchor.getDate() - mondayOffset + weekOffset * 7)
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

/** 固定展示最近 count 天，最右侧始终是今天 */
export function buildRecentDays(count = 7, endYmd = formatYmd(new Date())) {
  const end = parseYmd(normalizeYmd(endYmd) || formatYmd(new Date()))
  const todayYmd = formatYmd(new Date())
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (count - 1 - i))
    const ymd = formatYmd(date)
    return {
      ymd,
      weekday: WEEKDAY_SHORT[date.getDay()],
      day: date.getDate(),
      isToday: ymd === todayYmd
    }
  })
}
