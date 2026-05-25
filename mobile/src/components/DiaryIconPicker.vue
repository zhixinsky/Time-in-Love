<template>
  <view :class="['icon-pick-row', `icon-pick-row--${variant}`]">
    <view
      v-for="item in options"
      :key="item.value"
      :class="[
        'icon-pick tap-scale',
        `icon-pick--${variant}`,
        {
          active: modelValue === item.value,
          bounce: bounceKey === item.value
        }
      ]"
      @tap="onPick(item)"
    >
      <text class="icon-pick-emoji">{{ item.icon }}</text>
      <text class="icon-pick-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  variant: { type: String, default: 'premium' }
})

const emit = defineEmits(['update:modelValue', 'select'])

const bounceKey = ref('')

function onPick(item) {
  bounceKey.value = item.value
  emit('update:modelValue', item.value)
  emit('select', item.value)
  setTimeout(() => {
    if (bounceKey.value === item.value) bounceKey.value = ''
  }, 480)
}
</script>

<style lang="scss" scoped>
.icon-pick-row {
  display: flex;
  flex-wrap: wrap;
}

.icon-pick-row--premium {
  justify-content: space-between;
  gap: 12rpx;
}

.icon-pick {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.icon-pick--premium {
  flex: 1;
  min-width: 0;
  max-width: 118rpx;
  min-height: 116rpx;
  padding: 13rpx 6rpx 14rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.42);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  box-shadow:
    0 8rpx 24rpx rgba(255, 192, 203, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.icon-pick--premium.active {
  background: linear-gradient(135deg, rgba(255, 143, 177, 0.5), rgba(255, 182, 201, 0.42), rgba(255, 200, 184, 0.4));
  border-color: rgba(255, 152, 194, 0.72);
  box-shadow: 0 10rpx 26rpx rgba(239, 103, 157, 0.16);
}

.icon-pick--premium.active::after {
  position: absolute;
  left: 50%;
  bottom: -17rpx;
  width: 32rpx;
  height: 7rpx;
  border-radius: 999rpx;
  background: #f05e99;
  transform: translateX(-50%);
  content: '';
}

.icon-pick-emoji {
  position: relative;
  z-index: 1;
  font-size: 42rpx;
  line-height: 1.1;
}

.icon-pick-label {
  position: relative;
  z-index: 1;
  margin-top: 9rpx;
  font-size: 23rpx;
  color: #26242b;
  text-align: center;
  line-height: 1.2;
}

.icon-pick--premium.active .icon-pick-label {
  color: #e25491;
  font-weight: 800;
}

.icon-pick.bounce {
  animation: iconPickBounce 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes iconPickBounce {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.12);
  }

  70% {
    transform: scale(0.96);
  }

  100% {
    transform: scale(1);
  }
}

.tap-scale:active {
  opacity: 0.88;
}
</style>
