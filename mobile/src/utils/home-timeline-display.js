import { resolveMediaUrl } from '../services/request'
import { parseYmd } from './diary-date'
import { mapTimelineMediaItem, resolveVideoPoster } from './media-display'

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function mapHomeTimelineItem(item) {
  const dateStr = String(item?.date || '').slice(0, 10)
  const dateObj = dateStr ? parseYmd(dateStr) : new Date()
  const media = (item?.mediaList || [])
    .map(mapTimelineMediaItem)
    .filter(Boolean)

  // 兼容旧数据：仅有 coverImage 时补一条（跳过视频 URL）
  if (!media.length && item?.coverImage) {
    const cover = resolveMediaUrl(item.coverImage)
    const asPoster = resolveVideoPoster(cover, '') || cover
    if (asPoster) {
      media.push({ type: 'image', url: asPoster, poster: asPoster, duration: 0 })
    }
  }

  return {
    id: item.id,
    type: item.isAnniversary ? 'date' : 'daily',
    date: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
    week: WEEK_LABELS[dateObj.getDay()] || '',
    title: item.contentPreview || item.content || '心动瞬间',
    tag: item.isAnniversary ? '纪念日' : '心动日记',
    copy: item.content || '',
    media,
    mood: item.mood || '',
    moodIcon: '💗',
    eventDate: dateStr
  }
}

export function daysUntilNextDate(dateStr) {
  if (!dateStr) return 0
  const today = new Date()
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const parts = String(dateStr).slice(0, 10).split('-')
  const m = Number(parts[1]) - 1
  const d = Number(parts[2])
  let target = new Date(today.getFullYear(), m, d).getTime()
  if (target < t0) target = new Date(today.getFullYear() + 1, m, d).getTime()
  return Math.max(0, Math.round((target - t0) / 86400000))
}
