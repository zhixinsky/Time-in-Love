<template>
  <view class="tabbar-anchor">
    <view class="tabbar-capsule">
      <view class="glass-layer glass-base" />
      <view class="glass-layer glass-shine" />
      <view class="glass-layer glass-rim" />

      <view v-if="!isCenterActive" class="slider-track">
        <view class="slider-glow" :style="sliderStyle" />
      </view>

      <view class="tab-row">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: resolved === tab.key, center: tab.center }]"
          @tap="onTap(tab)"
          @longpress="onLongPress(tab)"
        >
          <template v-if="tab.center">
            <view class="center-orb">
              <view class="orb-logo-wrap">
                <CloudImage image-class="orb-logo" :file-id="CLOUD_AI_LOGO" mode="aspectFit" />
              </view>
            </view>
          </template>
          <template v-else>
            <view class="icon-wrap">
              <image
                class="tab-svg"
                :src="resolved === tab.key ? tab.iconActive : tab.icon"
                mode="aspectFit"
              />
            </view>
            <text class="tab-text">{{ tab.label }}</text>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import CloudImage from './CloudImage.vue'
import { CLOUD_AI_LOGO } from '../config'

const props = defineProps({
  active: { type: String, default: 'home' },
  current: { type: String, default: '' }
})

const emit = defineEmits(['create'])

const resolved = computed(() => props.current || props.active || 'home')

function svg(paths, color) {
  const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  // #ifdef H5
  return `data:image/svg+xml,${encodeURIComponent(raw)}`
  // #endif
  // #ifndef H5
  const buffer = new Uint8Array([...raw].map((c) => c.charCodeAt(0))).buffer
  // #ifdef MP-WEIXIN
  const encoded = wx.arrayBufferToBase64(buffer)
  // #endif
  // #ifndef MP-WEIXIN
  const encoded = ''
  // #endif
  return `data:image/svg+xml;base64,${encoded}`
  // #endif
}

const gray = '#9f90a8'
const activeColor = '#9b77c9'

const iconPaths = {
  home: '<path d="M4 19V5"/><path d="M10 19V10"/><path d="M16 19v-5"/><path d="M22 19V8"/>',
  bill: '<path d="M6 4h12v16H6z"/><path d="M9 8h6"/><path d="M9 12h4"/>',
  diary:
    '<path d="M12 20.5s-6.2-4.1-8.4-7.2C1.8 10.6 3.2 6.4 6.6 5c2-.9 3.6.4 5.4 2.4 1.8-2 3.4-3.3 5.4-2.4 3.4 1.4 4.8 5.6 3 8.3-2.2 3.1-8.4 7.2-8.4 7.2z"/>',
  profile: '<circle cx="12" cy="8.5" r="3.8"/><path d="M5.5 21.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>'
}

const tabs = [
  { key: 'home', label: '首页', icon: svg(iconPaths.home, gray), iconActive: svg(iconPaths.home, activeColor), center: false },
  { key: 'bill', label: '小记账', icon: svg(iconPaths.bill, gray), iconActive: svg(iconPaths.bill, activeColor), center: false },
  { key: 'ai', label: '', icon: '', iconActive: '', center: true },
  { key: 'diary', label: '日记', icon: svg(iconPaths.diary, gray), iconActive: svg(iconPaths.diary, activeColor), center: false },
  { key: 'profile', label: '我的', icon: svg(iconPaths.profile, gray), iconActive: svg(iconPaths.profile, activeColor), center: false }
]

const sliderIndex = computed(() => {
  const idx = tabs.findIndex((t) => t.key === resolved.value)
  return idx >= 0 ? idx : 2
})

const isCenterActive = computed(() => resolved.value === 'ai')

const sliderStyle = computed(() => ({
  transform: `translateX(${sliderIndex.value * 100}%)`
}))

const routes = {
  home: '/pages/home/index',
  bill: '/pages/bill/index',
  ai: '/pages/ai/index',
  diary: '/pages/diary/index',
  profile: '/pages/profile/index'
}

function onTap(tab) {
  if (tab.center) {
    if (resolved.value === 'ai') {
      emit('create')
      return
    }
    go(routes.ai)
    return
  }
  if (tab.key === resolved.value) return
  go(routes[tab.key])
}

function onLongPress(tab) {
  if (tab.center) {
    emit('create')
  }
}

function go(path) {
  uni.redirectTo({ url: path })
}
</script>

<style lang="scss" scoped>
.tabbar-anchor {
  position: fixed;
  z-index: 9999;
  right: 28rpx;
  bottom: env(safe-area-inset-bottom, 0px);
  left: 28rpx;
  pointer-events: none;
}

.tabbar-capsule {
  position: relative;
  border-radius: 999rpx;
  padding: 0 4rpx;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(40px) saturate(165%);
  -webkit-backdrop-filter: blur(40px) saturate(165%);
}

.glass-layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 999rpx;
  pointer-events: none;
}

.glass-base {
  box-shadow:
    0 12rpx 40rpx rgba(255, 170, 210, 0.12),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.88);
}

.glass-shine {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 55%);
  opacity: 0.65;
}

.glass-rim {
  border: 1rpx solid rgba(255, 255, 255, 0.55);
}

.slider-track {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  bottom: 4rpx;
  left: 4rpx;
  pointer-events: none;
}

.slider-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 20%;
  height: 100%;
  border-radius: 999rpx;
  background: rgba(255, 214, 232, 0.22);
  transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.tab-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 6rpx 0 2rpx;
  box-sizing: border-box;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  height: 100%;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
}

.tab-svg {
  width: 42rpx;
  height: 42rpx;
  transition: transform 0.28s ease;
}

.tab-item.active .tab-svg {
  transform: scale(1.08);
}

.tab-text {
  display: block;
  width: 100%;
  color: #9f90a8;
  font-size: 20rpx;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

.tab-item.active .tab-text {
  color: #9b77c9;
  font-weight: 700;
}

.tab-item.center {
  flex: 1.12;
  justify-content: center;
}

.center-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  margin-top: -32rpx;
  background: transparent;
}

.orb-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  transition:
    transform 0.32s cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 0.32s ease;
}

.tab-item.center.active .orb-logo-wrap {
  transform: translateY(-6rpx) scale(1.08);
  box-shadow: 0 20rpx 40rpx rgba(255, 154, 198, 0.42);
}

.orb-logo {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}
</style>
