<script>
import { onShow } from '@dcloudio/uni-app'
import { WX_CLOUD_ENV_ID } from './config'
import { initCloudContainer } from './services/request'

export default {
  onLaunch() {
    // #ifdef MP-WEIXIN
    initCloudContainer()
    // #endif
    console.log('星芽恋记启动', WX_CLOUD_ENV_ID)
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
@use './styles/theme.scss' as *;

page {
  min-height: 100%;
  color: $text-main;
  background: #fff4fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

view,
text,
scroll-view,
button,
input,
textarea {
  box-sizing: border-box;
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

.app-nav-page .page-inner {
  padding-top: 0;
}

.app-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76rpx;
  padding: 104rpx 210rpx 28rpx 42rpx;
  margin: 0 -24rpx;
  gap: 18rpx;
}

.app-nav__main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 18rpx;
}

.app-nav__copy {
  min-width: 0;
}

.app-nav__title {
  display: block;
  color: $text-main;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.15;
  text-align: left;
}

.app-nav__subtitle {
  display: block;
  max-width: 430rpx;
  margin-top: 10rpx;
  overflow: hidden;
  color: $text-soft;
  font-size: 24rpx;
  line-height: 1.3;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-nav__back {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  color: $text-main;
  font-size: 52rpx;
  font-weight: 300;
  line-height: 1;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: $shadow;
}

.app-nav__action {
  flex-shrink: 0;
}
</style>
