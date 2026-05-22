<template>
  <view class="safe-page">
    <view class="page-inner simple">
      <view class="card profile-card">
        <image class="avatar-img" :src="cloudLogo" mode="aspectFill" />
        <view>
          <text class="soft-title">恋爱时光</text>
          <text class="soft-subtitle">当前空间 · 已在一起 {{ love.loveDays }} 天</text>
        </view>
      </view>
      <view class="card list">
        <text v-for="item in items" :key="item" class="row">{{ item }} <text>›</text></text>
      </view>
    </view>
    <LoveTabBar active="profile" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useLoveStore } from '../../stores/love'
import { CLOUD_LOGO } from '../../config'

const love = useLoveStore()
const cloudLogo = CLOUD_LOGO
const sheetVisible = ref(false)
const items = ['我的情侣空间', '邀请另一半', '空间资料设置', '消息提醒', '隐私设置', '关于我们']
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.simple {
  padding-top: 104rpx;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 34rpx;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);
}

.list {
  padding: 14rpx 28rpx;
  margin-top: 24rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 86rpx;
  color: $text-main;
  font-size: 27rpx;
  border-bottom: 1rpx solid rgba(157, 123, 148, 0.12);
}
</style>
