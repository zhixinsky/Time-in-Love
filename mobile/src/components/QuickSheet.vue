<template>
  <view v-if="visible" class="sheet-mask" @tap="$emit('close')">
    <view class="sheet card" @tap.stop>
      <view class="sheet-handle"></view>
      <view class="sheet-title">记录新的心动</view>
      <view class="quick-grid">
        <button v-for="item in actions" :key="item.label" class="quick-action" @tap="select(item)">
          <text class="icon-bubble">{{ item.icon }}</text>
          <text>{{ item.label }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const actions = [
  { label: '记心情', icon: '💗' },
  { label: '写日记', icon: '✎', url: '/pages/diary/index' },
  { label: '记纪念日', icon: '🎀' },
  { label: '上传照片', icon: '☾' },
  { label: '记消费', icon: '¥', url: '/pages/bill/index' },
  { label: '记礼物', icon: '✦' }
]

function select(item) {
  emit('close')
  if (item.url) {
    uni.redirectTo({ url: item.url })
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as *;

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  padding: 32rpx;
  background: rgba(74, 44, 66, 0.18);
}

.sheet {
  width: 100%;
  padding: 20rpx 26rpx 38rpx;
  border-radius: 36rpx;
}

.sheet-handle {
  width: 68rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 8rpx;
  background: rgba(157, 123, 148, 0.24);
}

.sheet-title {
  margin-bottom: 24rpx;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 28rpx;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: $text-soft;
  font-size: 23rpx;
}
</style>
