/** 标记即将打开系统媒体预览，关闭后 onShow 不应整页刷新 */
let mediaPreviewPending = false

export function markMediaPreviewOpening() {
  mediaPreviewPending = true
}

export function consumeMediaPreviewReturn() {
  const pending = mediaPreviewPending
  mediaPreviewPending = false
  return pending
}
