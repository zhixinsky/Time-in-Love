<template>
  <view class="safe-page">
    <view class="page-inner simple">
      <text class="soft-title">恋爱小记账</text>
      <view class="card panel">
        <text>本月总支出</text>
        <text class="amount">￥1,314.00</text>
        <text class="soft-subtitle">分类、AA 和凭证上传将在下一阶段接入。</text>
      </view>
    </view>
    <LoveTabBar active="bill" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'

const sheetVisible = ref(false)
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.simple {
  padding-top: 104rpx;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 36rpx;
  margin-top: 26rpx;
}

.amount {
  color: $text-main;
  font-size: 54rpx;
  font-weight: 900;
}
</style>
