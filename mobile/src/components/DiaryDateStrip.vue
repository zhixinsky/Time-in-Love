<template>
  <view class="date-strip-host">
    <view class="date-strip">
      <view
        v-for="item in strip"
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
        <view
          v-if="hasDiary(item.ymd)"
          :class="['date-bottom-dot', { 'date-bottom-dot--active': isSelected(item.ymd) }]"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { buildRecentDays, formatYmd, normalizeYmd } from '../utils/diary-date'

const props = defineProps({
  selected: { type: String, default: '' },
  diaryMarks: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['select'])

const activeYmd = computed(() => normalizeYmd(props.selected))
const todayYmd = formatYmd(new Date())
const strip = computed(() => buildRecentDays(7, todayYmd))

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

function hasDiary(ymd) {
  return Boolean(props.diaryMarks?.[normalizeYmd(ymd)])
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
</script>

<style lang="scss" scoped>
.date-strip-host {
  flex-shrink: 0;
  width: 100%;
  height: 132rpx;
  margin: 8rpx 0 16rpx;
}

.date-strip {
  width: 100%;
  height: 132rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8rpx;
  padding-top: 8rpx;
  padding-bottom: 12rpx;
  padding-left: 6rpx;
  padding-right: 6rpx;
  box-sizing: border-box;
}

.date-pill {
  flex: 1;
  min-width: 0;
  padding: 8rpx 0 10rpx;
  display: flex;
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

.date-bottom-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(255, 126, 170, 0.28);
}

.date-bottom-dot--active {
  background: #ff7eaa;
}
</style>
