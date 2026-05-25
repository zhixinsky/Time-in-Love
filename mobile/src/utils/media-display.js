import { resolveMediaUrl } from '../services/request'

const VIDEO_RESOURCE_RE = /\.(mp4|mov|m4v|webm|avi)(\?|$)/i

/** 判断 URL 是否像视频文件（不宜作为 image 的 src） */
export function looksLikeVideoResource(url) {
  if (!url) return false
  const s = String(url).toLowerCase()
  if (VIDEO_RESOURCE_RE.test(s)) return true
  if (s.includes('/videos/') && !/\.(jpe?g|png|webp|gif)/i.test(s)) return true
  return false
}

/** 视频封面：仅当 cover 为有效图片地址时返回，否则空字符串由 UI 显示占位 */
export function resolveVideoPoster(coverUrl, videoUrl) {
  const video = resolveMediaUrl(videoUrl || '')
  const cover = resolveMediaUrl(coverUrl || '')
  if (!cover) return ''
  if (cover === video) return ''
  if (looksLikeVideoResource(cover)) return ''
  return cover
}

export function mapTimelineMediaItem(raw) {
  if (!raw) return null
  const type = raw.type === 'video' ? 'video' : 'image'
  const url = resolveMediaUrl(raw.url)
  let poster =
    type === 'video'
      ? resolveVideoPoster(raw.coverUrl, raw.url)
      : resolveMediaUrl(raw.coverUrl || raw.url) || url
  if (!url && !poster) return null
  return {
    type,
    url: url || poster,
    poster: poster || (type === 'image' ? url : ''),
    duration: Number(raw.duration || 0)
  }
}
