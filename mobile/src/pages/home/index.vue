<template>
  <view class="safe-page home-page">
    <image class="home-bg" :src="cloudLoveBg" mode="widthFix" />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <view class="hero">
          <view class="top-row">
            <view>
              <view class="brand-row">
                <text class="brand">{{ love.space.name }}</text>
                <view class="title-music-btn" @tap.stop="toggleMusicControls">
                  <image
                    class="title-music-icon"
                    :src="isMusicPlaying ? '/static/music-active.png' : '/static/music.png'"
                    mode="aspectFit"
                  />
                  <view v-if="musicControlsVisible" class="music-controls">
                    <view class="music-control-btn" @tap.stop="prevTrack">
                      <image class="music-control-img" src="/static/PreviousTrack.png" mode="aspectFit" />
                    </view>
                    <view class="music-control-btn music-control-btn--main" @tap.stop="togglePlayPause">
                      <image
                        class="music-control-img music-control-img--main"
                        :src="isMusicPlaying ? '/static/Pause.png' : '/static/Play.png'"
                        mode="aspectFit"
                      />
                    </view>
                    <view class="music-control-btn" @tap.stop="nextTrack">
                      <image class="music-control-img" src="/static/NextTrack.png" mode="aspectFit" />
                    </view>
                  </view>
                </view>
              </view>
              <text class="tagline">{{ love.space.subtitle }}</text>
            </view>
          </view>

          <view class="bubble">今天也要开心地在一起呀～</view>
        </view>

        <view class="days-card glass-surface" @tap="openProfile">
          <view class="card-shine"></view>
          <text class="float-heart heart-one">♥</text>
          <text class="float-heart heart-two">♡</text>
          <text class="float-heart heart-three">♥</text>
          <text class="sparkle sparkle-one">✦</text>
          <text class="sparkle sparkle-two">✧</text>
          <view class="days-info">
            <text class="label">我们在一起</text>
            <view class="days-line">
              <text class="days">{{ love.loveDays }}</text>
              <text class="unit">天</text>
              <text v-if="anniversaryName" class="pill">{{ anniversaryName }}</text>
            </view>
            <text class="start">起始日：{{ startDateText }}</text>
          </view>
          <view class="anniv-right">
            <view class="couple-row">
              <view v-for="person in coupleDisplay" :key="person.key" class="couple-person">
                <view class="avatar-ring">
                  <image v-if="person.avatarUrl" class="avatar-img" :src="person.avatarUrl" mode="aspectFill" />
                  <view v-else :class="['love-avatar', `love-avatar--${person.key}`]">
                    <view class="avatar-shirt"></view>
                    <view class="avatar-face">
                      <view class="avatar-hair"></view>
                      <view class="avatar-eye avatar-eye--left"></view>
                      <view class="avatar-eye avatar-eye--right"></view>
                      <view class="avatar-mouth"></view>
                    </view>
                  </view>
                </view>
                <text class="couple-label">{{ person.label }}</text>
              </view>
              <view class="couple-heart"><text>♥</text></view>
            </view>
          </view>
        </view>

        <view class="quick">
          <view
            v-for="entry in entries"
            :key="entry.label"
            class="quick-item"
            hover-class="quick-item--press"
            @tap="go(entry.url)"
          >
            <view class="quick-icon-glass">
              <LineIcon :name="entry.icon" :size="34" />
            </view>
            <text class="quick-label">{{ entry.label }}</text>
          </view>
        </view>

        <button class="mood-card card" @tap="noop">
          <view class="card-body-left">
            <text class="soft-title">今日心情打卡</text>
            <text class="soft-subtitle">记录我们的心情吧</text>
            <view class="avatars">
              <view v-for="item in love.moods" :key="item.owner" class="mood-avatar-bubble">
                <view class="mood-avatar-face">{{ item.avatar }}</view>
                <text class="mood-avatar-name">{{ item.owner }}</text>
              </view>
            </view>
          </view>
          <view class="mood-glass-orb">
            <view class="orb-shine"></view>
            <text class="orb-heart">♥</text>
            <text class="mood-text">很幸福</text>
            <text class="mood-float-heart mood-float-heart--1">♡</text>
            <text class="mood-float-heart mood-float-heart--2">♥</text>
          </view>
        </button>

        <button class="bill-card card" @tap="go('/pages/bill/index')">
          <view class="card-body-left">
            <text class="soft-title">恋爱小记账</text>
            <text class="soft-subtitle">一起经营我们的幸福</text>
            <view class="bill-stats">
              <view>
                <text class="bill-label">本月支出</text>
                <text class="money money--expense">￥{{ love.bills.expense.toLocaleString() }}</text>
              </view>
              <view class="split"></view>
              <view>
                <text class="bill-label">本月收入</text>
                <text class="money money--income">￥{{ love.bills.income.toLocaleString() }}</text>
              </view>
            </view>
          </view>
          <view class="piggy-jar">
            <view class="jar-glass-lid"></view>
            <view class="jar-glass-body">
              <text class="jar-coin jar-coin--1">◎</text>
              <text class="jar-coin jar-coin--2">◎</text>
              <text class="jar-heart">♥</text>
              <text class="jar-star">✦</text>
            </view>
          </view>
          <view class="bill-card-aura"></view>
        </button>
      </view>
    </scroll-view>
    <LoveTabBar active="home" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onHide, onLoad, onShow } from '@dcloudio/uni-app'
import LineIcon from '../../components/LineIcon.vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useLoveStore } from '../../stores/love'
import { formatDate } from '../../utils/date'
import { useLoveMusic } from '../../utils/love-music'
import { CLOUD_LOVE_BG } from '../../config'
import { resolveMediaUrl } from '../../services/request'

const love = useLoveStore()
const cloudLoveBg = CLOUD_LOVE_BG
const sheetVisible = ref(false)
const {
  musicControlsVisible,
  isMusicPlaying,
  toggleMusicControls,
  togglePlayPause,
  nextTrack,
  prevTrack,
  startProgressSaver,
  stopProgressSaver,
  onPageShow,
  onPageHide
} = useLoveMusic()

onLoad(() => {
  love.loadDashboard()
  setTimeout(() => onPageShow(), 120)
})

onShow(() => {
  onPageShow()
  startProgressSaver()
})

onHide(() => {
  onPageHide()
  stopProgressSaver()
})

const startDateText = computed(() => formatDate(love.loveStartDate))
const anniversaryName = computed(() => love.currentAnniversaryName)
const coupleDisplay = computed(() => [
  { key: 'me', label: '我', avatarUrl: resolveMediaUrl(love.space.couplePhoto) },
  { key: 'ta', label: 'Ta', avatarUrl: '' }
])

const entries = [
  { label: '心动日记', icon: 'heart', url: '/pages/diary/index' },
  { label: '纪念日', icon: 'calendar', url: '/pages/anniversary/index' },
  { label: '时光相册', icon: 'album', url: '/pages/album/index' },
  { label: '恋爱清单', icon: 'checklist', url: '/pages/checklist/index' },
  { label: '甜蜜问答', icon: 'message-heart', url: '/pages/qa/index' }
]

function go(url) {
  if (!url) return
  uni.redirectTo({ url })
}

function openProfile() {
  uni.redirectTo({ url: '/pages/profile/index' })
}

function noop() {}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.home-page {
  background: #fff4fa;
  overflow: visible;
}

.home-bg {
  position: absolute;
  top: -200rpx;
  left: 0;
  z-index: 0;
  width: 100%;
  min-height: 100%;
}

.home-page::before,
.home-page::after {
  position: absolute;
  z-index: 1;
  color: rgba(255, 255, 255, 0.86);
  content: '✦';
  font-size: 34rpx;
}

.home-page::before {
  top: 128rpx;
  left: 68rpx;
}

.home-page::after {
  top: 260rpx;
  right: 64rpx;
}

.hero {
  position: relative;
  height: 416rpx;
  margin: -72rpx -24rpx 28rpx;
  padding: 104rpx 210rpx 0 42rpx;
  overflow: hidden;
}

.top-row,
.brand-row {
  display: flex;
  align-items: center;
}

.top-row {
  justify-content: flex-start;
  margin-top: 10rpx;
}

.brand {
  color: $text-main;
  font-size: 42rpx;
  font-weight: 700;
}

.tagline {
  display: block;
  margin-top: 12rpx;
  color: $text-soft;
  font-size: 26rpx;
}

.music {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  color: $pink-deep;
  font-size: 34rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12rpx 24rpx rgba(244, 95, 157, 0.16);
}

.title-music-btn {
  position: relative;
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-left: 12rpx;
}

.title-music-icon {
  display: block;
  width: 44rpx;
  height: 44rpx;
  opacity: 0.96;
}

.music-controls {
  position: absolute;
  left: 62rpx;
  top: 50%;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 18rpx;
  transform: translateY(-50%);
}

.music-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.music-control-btn--main {
  width: 60rpx;
  height: 60rpx;
  background: transparent;
}

.music-control-img {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.95;
}

.music-control-img--main {
  width: 28rpx;
  height: 28rpx;
}

.bubble {
  position: absolute;
  top: 158rpx;
  right: 96rpx;
  z-index: 3;
  width: 220rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  border-radius: 34rpx 34rpx 8rpx 34rpx;
  color: #7b6c85;
  font-size: 23rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12rpx 40rpx rgba(255, 170, 210, 0.12);
  backdrop-filter: blur(36rpx);
}

.glass-surface {
  @include glass-card;
  @include glass-card-shine;
}

.days-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 236rpx;
  padding: 36rpx 32rpx 32rpx 36rpx;
  margin-bottom: 28rpx;
  text-align: left;
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.38);
  box-shadow: 0 10rpx 36rpx rgba(255, 170, 210, 0.1);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  animation: cardFloat 6s ease-in-out infinite;
}

.card-shine {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: 48%;
  border-radius: 36rpx 36rpx 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.float-heart,
.sparkle {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.float-heart {
  color: rgba(255, 143, 183, 0.22);
  font-size: 34rpx;
  line-height: 1;
  animation: heartFloat 4.8s ease-in-out infinite;
}

.heart-one {
  left: 350rpx;
  top: 40rpx;
}

.heart-two {
  right: 184rpx;
  bottom: 38rpx;
  font-size: 24rpx;
  animation-delay: -1.8s;
}

.heart-three {
  left: 120rpx;
  bottom: 52rpx;
  font-size: 20rpx;
  animation-delay: -2.6s;
}

.sparkle {
  color: rgba(255, 255, 255, 0.88);
  font-size: 22rpx;
}

.sparkle-one {
  top: 34rpx;
  right: 54rpx;
}

.sparkle-two {
  right: 248rpx;
  bottom: 30rpx;
  font-size: 18rpx;
}

.days-info {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.label,
.start {
  display: block;
  color: $text-soft;
  font-size: 24rpx;
}

.days-line {
  display: flex;
  align-items: baseline;
  margin: 18rpx 0 16rpx;
}

.days {
  display: inline-block;
  color: $text-num;
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2rpx;
  background-color: transparent;
}

.unit {
  margin: 0 16rpx 0 10rpx;
  color: $text-num;
  font-size: 30rpx;
  font-weight: 700;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  max-width: 178rpx;
  height: 38rpx;
  padding: 0 20rpx;
  overflow: hidden;
  border-radius: 999rpx;
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: linear-gradient(135deg, #ff8fb7, #ffb6d1);
  box-shadow: 0 8rpx 20rpx rgba(255, 143, 183, 0.24);
}

.start {
  color: $text-soft;
}

.heart-photo-wrap {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  width: 156rpx;
  height: 144rpx;
  margin-right: 4rpx;
  animation: avatarFloat 4.6s ease-in-out infinite;
}

.anniv-right {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 282rpx;
  height: 100%;
}

.couple-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  width: 100%;
}

.couple-person {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.couple-label {
  color: #7b6c85;
  font-size: 22rpx;
  font-weight: 600;
}

.avatar-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  overflow: hidden;
  border: 3rpx solid #fff;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 0 5rpx rgba(255, 154, 198, 0.28),
    0 10rpx 24rpx rgba(255, 170, 210, 0.18);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.love-avatar {
  position: relative;
  width: 76rpx;
  height: 76rpx;
  overflow: hidden;
}

.avatar-shirt {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 48rpx;
  height: 28rpx;
  border-radius: 24rpx 24rpx 0 0;
  background: #8b7fd4;
  transform: translateX(-50%);
}

.love-avatar--ta .avatar-shirt {
  background: #ff9ec8;
}

.avatar-face {
  position: relative;
  z-index: 1;
  width: 50rpx;
  height: 50rpx;
  margin: 8rpx auto 0;
  border-radius: 50%;
  background: #ffe6d8;
}

.avatar-hair {
  position: absolute;
  top: -3rpx;
  right: 6rpx;
  left: 6rpx;
  height: 22rpx;
  border-radius: 999rpx;
  background: #7a4226;
}

.love-avatar--ta .avatar-hair {
  background: #73408d;
}

.avatar-eye {
  position: absolute;
  top: 26rpx;
  width: 5rpx;
  height: 5rpx;
  border-radius: 50%;
  background: #5c342b;
}

.avatar-eye--left {
  left: 16rpx;
}

.avatar-eye--right {
  right: 16rpx;
}

.avatar-mouth {
  position: absolute;
  top: 34rpx;
  left: 20rpx;
  width: 8rpx;
  height: 4rpx;
  border-bottom: 2rpx solid #d17078;
  border-radius: 0 0 999rpx 999rpx;
}

.couple-heart {
  order: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin: 0 -6rpx;
  animation: heartDrift 4.2s ease-in-out infinite;
}

.couple-heart text {
  color: #ff8fb7;
  font-size: 28rpx;
  line-height: 1;
}

.couple-person:first-child {
  order: 0;
}

.couple-person:nth-child(2) {
  order: 2;
}

.heart-frame {
  position: absolute;
  top: 3rpx;
  right: 2rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144rpx;
  height: 128rpx;
  filter: drop-shadow(0 14rpx 24rpx rgba(255, 143, 183, 0.25));
  transform: rotate(-5deg);
}

.heart-photo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 132rpx;
  height: 118rpx;
  border: 10rpx solid rgba(255, 255, 255, 0.96);
  border-radius: 58rpx 58rpx 64rpx 64rpx;
  -webkit-clip-path: polygon(50% 96%, 10% 58%, 4% 35%, 14% 14%, 34% 8%, 50% 22%, 66% 8%, 86% 14%, 96% 35%, 90% 58%);
  clip-path: polygon(50% 96%, 10% 58%, 4% 35%, 14% 14%, 34% 8%, 50% 22%, 66% 8%, 86% 14%, 96% 35%, 90% 58%);
  box-shadow: inset 0 0 18rpx rgba(255, 255, 255, 0.28);
}

.photo-placeholder {
  background:
    radial-gradient(circle at 50% 24%, rgba(255, 240, 210, 0.72), transparent 22%),
    radial-gradient(circle at 34% 56%, rgba(255, 255, 255, 0.22), transparent 28%),
    linear-gradient(145deg, rgba(247, 160, 127, 0.88), rgba(119, 97, 124, 0.9));
  backdrop-filter: blur(8rpx);
}

.photo-couple {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #412938 0 12rpx, transparent 13rpx), radial-gradient(circle at 68% 28%, #412938 0 12rpx, transparent 13rpx), linear-gradient(#ffd4b0, #5b435b);
}

.mini-heart {
  position: absolute;
  right: 2rpx;
  bottom: 2rpx;
  z-index: 3;
  width: 44rpx;
  height: 44rpx;
  border: 5rpx solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  color: #fff;
  font-size: 24rpx;
  line-height: 36rpx;
  text-align: center;
  background: linear-gradient(135deg, #ff8ab8, #ff6fa9);
  box-shadow: 0 8rpx 14rpx rgba(244, 95, 157, 0.22);
  animation: heartFloat 3.8s ease-in-out infinite;
}

@keyframes heartFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.72;
  }

  50% {
    transform: translateY(-8rpx);
    opacity: 1;
  }
}

@keyframes avatarFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6rpx);
  }
}

.quick {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin: 8rpx 0 36rpx;
  padding: 8rpx 0;
}

.quick-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.quick-item--press {
  transform: scale(0.92);
}

.quick-icon-glass {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 154, 198, 0.92), rgba(201, 167, 255, 0.88));
  box-shadow:
    inset 0 6rpx 14rpx rgba(255, 255, 255, 0.38),
    inset 0 -4rpx 10rpx rgba(255, 120, 170, 0.12),
    0 14rpx 28rpx rgba(255, 170, 210, 0.22);
}

.quick-icon-glass::after {
  position: absolute;
  inset: 2rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 50%;
  pointer-events: none;
  content: '';
}

.quick-label {
  max-width: 96rpx;
  color: #7b6c85;
  font-size: 24rpx;
  line-height: 1.35;
  text-align: center;
}

.mood-card,
.bill-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 36rpx 32rpx;
  text-align: left;
}

.card-body-left {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
}

.soft-subtitle {
  display: block;
  margin-top: 10rpx;
}

.avatars {
  display: flex;
  gap: 28rpx;
  margin-top: 30rpx;
}

.mood-avatar-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.mood-avatar-face {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.82);
  border-radius: 50% 50% 50% 14rpx;
  font-size: 36rpx;
  background: linear-gradient(145deg, rgba(255, 240, 248, 0.95), rgba(255, 214, 232, 0.72));
  box-shadow: 0 10rpx 22rpx rgba(255, 170, 210, 0.16);
}

.mood-avatar-name {
  color: $text-soft;
  font-size: 22rpx;
}

.mood-glass-orb {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 196rpx;
  height: 196rpx;
  margin-right: -8rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.78), transparent 34%),
    radial-gradient(circle at 70% 72%, rgba(255, 182, 209, 0.28), transparent 42%),
    rgba(255, 255, 255, 0.42);
  box-shadow:
    inset 0 8rpx 24rpx rgba(255, 255, 255, 0.5),
    0 16rpx 36rpx rgba(255, 170, 210, 0.14);
  backdrop-filter: blur(24rpx);
  animation: cardFloat 5.4s ease-in-out infinite;
}

.orb-shine {
  position: absolute;
  top: 14rpx;
  left: 22rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 70%);
  animation: glowBreath 4.8s ease-in-out infinite;
}

.orb-heart {
  color: rgba(255, 143, 183, 0.42);
  font-size: 88rpx;
  line-height: 1;
}

.mood-text {
  position: relative;
  z-index: 2;
  margin-top: -12rpx;
  color: #ff8fb7;
  font-size: 28rpx;
  font-weight: 700;
  background: none;
}

.mood-float-heart {
  position: absolute;
  color: rgba(255, 143, 183, 0.55);
  font-size: 22rpx;
  animation: heartDrift 4.6s ease-in-out infinite;
}

.mood-float-heart--1 {
  top: 24rpx;
  right: 28rpx;
}

.mood-float-heart--2 {
  bottom: 30rpx;
  left: 24rpx;
  animation-delay: -2s;
}

.bill-stats {
  display: flex;
  align-items: center;
  gap: 28rpx;
  margin-top: 34rpx;
}

.bill-label {
  color: $text-soft;
  font-size: 23rpx;
}

.bill-stats view {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.money {
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: -0.5rpx;
}

.money--expense {
  color: #ff8fb7;
}

.money--income {
  color: #b58fd8;
}

.split {
  width: 1rpx;
  height: 56rpx;
  background: rgba(159, 144, 168, 0.2);
}

.piggy-jar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 152rpx;
  height: 148rpx;
  margin-right: 4rpx;
  animation: cardFloat 5.8s ease-in-out infinite;
}

.jar-glass-lid {
  width: 92rpx;
  height: 20rpx;
  margin: 0 auto 4rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.55);
  border-radius: 18rpx;
  background: linear-gradient(180deg, rgba(255, 220, 200, 0.72), rgba(255, 190, 170, 0.45));
  box-shadow: 0 6rpx 12rpx rgba(255, 170, 210, 0.12);
}

.jar-glass-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 118rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.62);
  border-radius: 34rpx 34rpx 46rpx 46rpx;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 230, 210, 0.28) 48%, rgba(255, 200, 220, 0.22) 100%);
  box-shadow:
    inset 0 10rpx 24rpx rgba(255, 255, 255, 0.45),
    0 14rpx 28rpx rgba(255, 170, 210, 0.14);
  backdrop-filter: blur(16rpx);
}

.jar-heart {
  color: rgba(255, 143, 183, 0.78);
  font-size: 34rpx;
}

.jar-star {
  position: absolute;
  top: 18rpx;
  right: 22rpx;
  color: rgba(201, 167, 255, 0.72);
  font-size: 22rpx;
}

.jar-coin {
  position: absolute;
  color: rgba(255, 200, 120, 0.82);
  font-size: 20rpx;
}

.jar-coin--1 {
  top: 22rpx;
  left: 24rpx;
}

.jar-coin--2 {
  bottom: 24rpx;
  right: 26rpx;
}

.bill-card-aura {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  height: 42%;
  border-radius: 0 0 36rpx 36rpx;
  background: linear-gradient(180deg, transparent, rgba(255, 182, 209, 0.14));
  pointer-events: none;
}
</style>
