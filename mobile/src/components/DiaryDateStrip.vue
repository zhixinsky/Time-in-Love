<template>
  <view class="date-strip-host">
    <scroll-view
      class="date-strip"
      scroll-x
      enhanced
      :show-scrollbar="false"
      scroll-with-animation
      :scroll-left="scrollLeft"
    >
      <view class="date-strip-inner" :style="innerStyle">
        <view
          v-for="item in strip"
          :id="`date-${item.ymd}`"
          :key="item.ymd"
          class="date-pill tap-scale"
          @tap="onTapDay(item.ymd)"
        >
          <text class="date-week" :style="weekStyle(item.ymd)">
            {{ item.weekday }}
          </text>
          <view class="date-day-ring" :style="ringStyle(item.ymd)">
            <text class="date-day" :style="dayStyle(item.ymd)">{{ item.day }}</text>
          </view>
          <view v-if="isSelected(item.ymd)" class="date-active-dot" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref, watch, nextTick, getCurrentInstance } from 'vue'
import { buildDateStrip, normalizeYmd } from '../utils/diary-date'

const props = defineProps({
  selected: { type: String, default: '' },
  radius: { type: Number, default: 45 }
})

const emit = defineEmits(['select'])

const instance = getCurrentInstance()
const activeYmd = computed(() => normalizeYmd(props.selected))
const strip = computed(() => buildDateStrip(activeYmd.value, props.radius))
const scrollLeft = ref(0)
const sidePaddingPx = ref(0)

const innerStyle = computed(() => {
  const pad = sidePaddingPx.value
  if (!pad) return {}
  return {
    paddingLeft: `${pad}px`,
    paddingRight: `${pad}px`
  }
})

const ACTIVE = {
  weekColor: '#ff82ae',
  ringBg: '#ff7eaa',
  ringShadow: '0 5px 12px rgba(255, 126, 170, 0.35)',
  dayColor: '#ffffff',
  ringBorder: 'none'
}

const INACTIVE = {
  weekColor: '#9b8c9f',
  ringBg: 'transparent',
  ringShadow: 'none',
  dayColor: '#6f5d73',
  ringBorder: 'none'
}

function isSelected(ymd) {
  return normalizeYmd(ymd) === activeYmd.value
}

function weekStyle(ymd) {
  const on = isSelected(ymd)
  return {
    color: on ? ACTIVE.weekColor : INACTIVE.weekColor,
    fontWeight: on ? '600' : '400'
  }
}

function ringStyle(ymd) {
  const on = isSelected(ymd)
  return {
    backgroundColor: on ? ACTIVE.ringBg : INACTIVE.ringBg,
    boxShadow: on ? ACTIVE.ringShadow : INACTIVE.ringShadow,
    border: on ? ACTIVE.ringBorder : INACTIVE.ringBorder
  }
}

function dayStyle(ymd) {
  return {
    color: isSelected(ymd) ? ACTIVE.dayColor : INACTIVE.dayColor
  }
}

function onTapDay(ymd) {
  emit('select', ymd)
}

function measureSidePadding() {
  if (!instance) return
  const query = uni.createSelectorQuery().in(instance)
  query.select('.date-strip').boundingClientRect()
  query.exec((res) => {
    const viewW = res?.[0]?.width || 0
    if (!viewW) return
    const pillW = (uni.getSystemInfoSync().windowWidth / 750) * 76
    sidePaddingPx.value = Math.max(0, Math.round(viewW / 2 - pillW / 2))
  })
}

function centerSelectedDate(ymd) {
  const key = normalizeYmd(ymd)
  if (!key || !instance) return
  const query = uni.createSelectorQuery().in(instance)
  query.select('.date-strip').boundingClientRect()
  query.select('.date-strip-inner').boundingClientRect()
  query.select(`#date-${key}`).boundingClientRect()
  query.exec((res) => {
    const viewRect = res?.[0]
    const innerRect = res?.[1]
    const pillRect = res?.[2]
    if (!viewRect?.width || !innerRect?.width || !pillRect?.width) return

    const pillLeftInInner = pillRect.left - innerRect.left
    const pillCenter = pillLeftInInner + pillRect.width / 2
    const target = pillCenter - viewRect.width / 2
    const maxScroll = Math.max(0, innerRect.width - viewRect.width)
    scrollLeft.value = Math.max(0, Math.min(maxScroll, Math.round(target)))
  })
}

function scrollToSelected(ymd) {
  nextTick(() => {
    measureSidePadding()
    centerSelectedDate(ymd)
    setTimeout(() => {
      measureSidePadding()
      centerSelectedDate(ymd)
    }, 80)
  })
}

watch(activeYmd, (ymd) => scrollToSelected(ymd), { immediate: true })
</script>

<style lang="scss" scoped>
.date-strip-host {
  flex-shrink: 0;
  width: 100%;
  height: 132rpx;
  margin: 8rpx 0 16rpx;
  overflow: hidden;
}

.date-strip {
  width: 100%;
  height: 132rpx;
  white-space: nowrap;
}

.date-strip-inner {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 14rpx;
  height: 132rpx;
  padding-top: 8rpx;
  padding-bottom: 12rpx;
  box-sizing: border-box;
}

.date-pill {
  flex-shrink: 0;
  width: 76rpx;
  padding: 8rpx 0 10rpx;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.date-week {
  font-size: 22rpx;
  line-height: 1.2;
}

.date-day-ring {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-day {
  font-size: 28rpx;
  font-weight: 700;
}

.date-active-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ff7eaa;
}
</style>
