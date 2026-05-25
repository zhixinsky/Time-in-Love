<script>
import { onShow } from '@dcloudio/uni-app'
import { WX_CLOUD_ENV_ID } from './config'
import { initCloudContainer } from './services/request'
import { useAuthStore } from './stores/auth'
import { useDiaryStore } from './stores/diary'

export default {
  onLaunch() {
    // #ifdef MP-WEIXIN
    initCloudContainer()
    // #endif
    console.log('星芽恋记启动', WX_CLOUD_ENV_ID)
    const auth = useAuthStore()
    void auth.ensureLogin().then(() => {
      const diary = useDiaryStore()
      void diary.fetchTimeline(10, 1, { skipAuth: true })
    })
  },
  onShow() {
    setTimeout(() => {
      const pages = getCurrentPages()
      const top = pages[pages.length - 1]
      const route = top?.route || ''
      if (route.includes('home/index')) {
        uni.$emit('love-music-resume')
      }
    }, 0)
  }
}
</script>

<style lang="scss">
@use './styles/animation.scss';
@use './styles/theme.scss' as *;

page {
  min-height: 100%;
  color: $text-main;
  @include romantic-page-gradient-fill;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

scroll-view,
scroll-view.content-scroll {
  box-sizing: border-box;
  background-color: transparent !important;
  background-image: none !important;
}

button {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
  line-height: 1;
}

button::after {
  border: 0;
}

.tap-scale:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.add-btn,
.save-btn,
.generate-btn,
.empty-btn {
  @include jelly-primary-button;
}

.ghost-btn {
  @include liquid-secondary-button;
}

.input,
.answer-input,
.ai-input,
.field-textarea,
.textarea-shell,
.date-input {
  @include apple-liquid-input;
}

input,
textarea {
  color: $text-main;
}

input::placeholder,
textarea::placeholder {
  color: rgba(125, 100, 113, 0.48);
}

/* 子页标题区：垂直间距由 .page-hero-nav 承担，与首页 .hero 一致 */
.app-nav--flat {
  position: relative;
  z-index: 10;
  margin: 0;
  padding: 0 0 28rpx;
}

.app-nav__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $page-hero-row-gap-top;
  gap: 18rpx;
}

.app-nav__main {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 18rpx;
}

.app-nav__copy {
  min-width: 0;
}

.app-nav__title-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
}

.app-nav__title {
  display: block;
  color: $text-main;
  font-size: $page-title-font-size;
  font-weight: 700;
  line-height: $page-title-line-height;
  text-align: left;
}

.app-nav__title-action {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.app-nav__subtitle {
  display: block;
  max-width: 430rpx;
  margin-top: 12rpx;
  overflow: hidden;
  color: $text-soft;
  font-size: 26rpx;
  line-height: 1.3;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-nav__back {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: $page-title-music-size;
  height: $page-title-music-size;
}

.app-nav__back-glass {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.38);
  box-shadow:
    0 10rpx 26rpx rgba(196, 118, 172, 0.08),
    inset 0 1rpx rgba(255, 255, 255, 0.46);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.app-nav__back-icon {
  position: relative;
  z-index: 1;
  width: 36rpx;
  height: 36rpx;
  margin-left: -4rpx;
}

.app-nav__action-wrap {
  flex-shrink: 0;
}
</style>
