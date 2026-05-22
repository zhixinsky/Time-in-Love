<script>
import { onShow } from '@dcloudio/uni-app'
import { WX_CLOUD_ENV_ID } from './config'

export default {
  onLaunch() {
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({ env: WX_CLOUD_ENV_ID, traceUser: true })
    }
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
</style>
