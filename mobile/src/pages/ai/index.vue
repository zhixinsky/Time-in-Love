<template>
  <view class="safe-page">
    <view class="page-inner simple">
      <view class="ai-head">
        <image class="avatar-img" :src="cloudLogo" mode="aspectFit" />
        <view>
          <text class="soft-title">AI星芽</text>
          <text class="soft-subtitle">今天也要好好爱彼此呀～</text>
        </view>
      </view>
      <view class="features">
        <view v-for="item in features" :key="item" class="card feature">{{ item }}</view>
      </view>
    </view>
    <LoveTabBar active="ai" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { CLOUD_LOGO } from '../../config'

const sheetVisible = ref(false)
const cloudLogo = CLOUD_LOGO
const features = ['今日恋爱小建议', '帮我写情话', '生成纪念日文案', '总结我们的恋爱日记', '生成朋友圈文案', '分析本周甜蜜指数']
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.simple {
  padding-top: 104rpx;
}

.ai-head {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.avatar-img {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: $shadow;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.feature {
  padding: 30rpx;
  color: $text-main;
  font-size: 26rpx;
  font-weight: 700;
}
</style>
