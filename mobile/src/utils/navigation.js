/**
 * 页面跳转（Skyline 切换动效由目标页 .safe-page 的 CSS 进入动画完成，无需额外 setData）
 */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function navigateTo(url, options = {}) {
  return uni.navigateTo({
    url,
    ...options
  })
}

export function redirectTo(url, options = {}) {
  return uni.redirectTo({
    url,
    ...options
  })
}

export function goHome() {
  return redirectTo('/pages/home/index')
}

export { EASE }
