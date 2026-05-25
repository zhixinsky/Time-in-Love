<template>
  <view class="safe-page edit-page">
    <PageLiquidBg />
    <view class="page-bg" aria-hidden="true">
      <view class="bg-heart bg-heart--big">❤</view>
      <view class="bg-heart bg-heart--small">❤</view>
      <view class="bg-spark bg-spark--one">✦</view>
      <view class="bg-spark bg-spark--two">✦</view>
      <view class="bg-spark bg-spark--three">✦</view>
    </view>
    <scroll-view
      class="content-scroll"
      scroll-y
      enhanced
      :show-scrollbar="false"
      :bounces="true"
    >
      <view class="page-inner">
        <view class="edit-topbar">
          <view class="close-btn tap-scale" @tap="goBack">
            <view class="close-x" />
          </view>
        </view>

        <view class="edit-hero">
          <view class="hero-title-row">
            <text class="hero-title">{{ navTitle }}</text>
            <text class="hero-loop">♡</text>
          </view>
          <text class="hero-subtitle">记录只属于你们的心动瞬间 💕</text>
        </view>

        <DiaryPublishFormFields layout="page" @submit="onSubmit" />

        <view class="scroll-bottom-spacer" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, provide } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLiquidBg from '../../components/PageLiquidBg.vue'
import DiaryPublishFormFields from '../../components/DiaryPublishFormFields.vue'
import { useDiaryPublishForm } from '../../composables/useDiaryPublishForm'

const formApi = useDiaryPublishForm()
provide('diaryPublishForm', formApi)

const { isEdit, prepareOpen, submit } = formApi

const navTitle = computed(() =>
  isEdit.value ? '编辑心动日记' : '发布心动日记'
)

async function onSubmit() {
  const ok = await submit()
  if (!ok) return
  setTimeout(() => uni.navigateBack(), 400)
}

function goBack() {
  uni.navigateBack()
}

onLoad((query) => {
  void prepareOpen({
    date: query?.date,
    id: query?.id
  })
})
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  overflow: hidden;
  background: transparent;
}

.content-scroll {
  height: 100vh;
  width: 100%;
  position: relative;
  z-index: 2;
}

.page-inner {
  padding: calc(34rpx + env(safe-area-inset-top)) 28rpx 190rpx;
  box-sizing: border-box;
}

.page-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-heart,
.bg-spark {
  position: absolute;
  color: rgba(242, 92, 148, 0.28);
  line-height: 1;
}

.bg-heart--big {
  top: 178rpx;
  right: 58rpx;
  font-size: 152rpx;
  color: rgba(241, 91, 148, 0.12);
  filter: blur(6rpx);
}

.bg-heart--small {
  top: 226rpx;
  right: 244rpx;
  font-size: 46rpx;
  color: rgba(244, 103, 153, 0.14);
}

.bg-spark--one {
  top: 164rpx;
  right: 262rpx;
  font-size: 44rpx;
  color: rgba(255, 210, 228, 0.9);
}

.bg-spark--two {
  top: 274rpx;
  right: 22rpx;
  font-size: 34rpx;
  color: rgba(255, 211, 229, 0.86);
}

.bg-spark--three {
  top: 102rpx;
  right: 134rpx;
  font-size: 26rpx;
  color: rgba(239, 73, 137, 0.42);
}

.edit-topbar {
  height: 78rpx;
  display: flex;
  align-items: center;
}

.close-btn {
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  position: relative;
  width: 42rpx;
  height: 42rpx;
}

.close-x::before,
.close-x::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 42rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #25242b;
  content: '';
}

.close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.edit-hero {
  position: relative;
  z-index: 1;
  padding: 28rpx 6rpx 38rpx;
}

.hero-title-row {
  display: flex;
  align-items: flex-end;
  gap: 18rpx;
}

.hero-title {
  color: #24232b;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0;
}

.hero-loop {
  color: #f184b0;
  font-size: 54rpx;
  line-height: 0.9;
  transform: rotate(13deg);
}

.hero-subtitle {
  display: block;
  margin-top: 24rpx;
  color: #8d8991;
  font-size: 26rpx;
  line-height: 1.3;
}

.scroll-bottom-spacer {
  height: 28rpx;
}

.tap-scale:active {
  opacity: 0.82;
}
</style>
