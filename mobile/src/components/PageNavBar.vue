<template>
  <view class="page-hero-nav">
    <view class="app-nav app-nav--flat">
      <view class="app-nav__row">
        <view class="app-nav__main">
          <view v-if="showBack" class="app-nav__back tap-scale" @tap="handleBack">
            <view class="app-nav__back-glass" />
            <image class="app-nav__back-icon" :src="backIcon" mode="aspectFit" />
          </view>
          <view class="app-nav__copy">
            <text class="app-nav__title">{{ title }}</text>
            <text v-if="subtitle" class="app-nav__subtitle">{{ subtitle }}</text>
          </view>
        </view>
        <view v-if="$slots.action" class="app-nav__action-wrap">
          <slot name="action" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { backIcon } from '../utils/icons'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  /** home：回首页；back：返回上一页 */
  backMode: { type: String, default: 'home' }
})

const emit = defineEmits(['back'])

function handleBack() {
  emit('back')
  if (props.backMode === 'back') {
    uni.navigateBack({
      fail: () => uni.redirectTo({ url: '/pages/home/index' })
    })
    return
  }
  uni.redirectTo({ url: '/pages/home/index' })
}
</script>
