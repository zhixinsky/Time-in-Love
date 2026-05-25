/** 与 Moona 一致：SVG 转 data URI，供返回按钮等使用 */
const BACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>'
const CALENDAR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9b77c9" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5.5" width="16" height="14" rx="3"/><path d="M8 3.8v3.4M16 3.8v3.4M4 9.3h16"/></svg>'

function toBase64(raw) {
  return uni.arrayBufferToBase64(
    new Uint8Array([...raw].map((c) => c.charCodeAt(0))).buffer
  )
}

export function svgToUri(raw) {
  // #ifdef H5
  return `data:image/svg+xml,${encodeURIComponent(raw)}`
  // #endif
  // #ifndef H5
  return `data:image/svg+xml;base64,${toBase64(raw)}`
  // #endif
}

export const backIcon = svgToUri(BACK_SVG)
export const calendarIcon = svgToUri(CALENDAR_SVG)
