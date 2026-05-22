<template>
  <view
    class="line-icon"
    :class="[
      `line-icon--${name}`,
      { 'line-icon--active': active, 'line-icon--muted': tone === 'muted' && !active }
    ]"
    :style="{ width: size + 'rpx', height: size + 'rpx' }"
  >
    <view v-if="name === 'heart'" class="ico ico-heart"></view>
    <view v-else-if="name === 'calendar'" class="ico ico-calendar">
      <view class="ico-calendar-top"></view>
      <view class="ico-calendar-body"></view>
    </view>
    <view v-else-if="name === 'album'" class="ico ico-album">
      <view class="ico-album-sun"></view>
      <view class="ico-album-hill"></view>
    </view>
    <view v-else-if="name === 'checklist'" class="ico ico-checklist">
      <view class="ico-check"></view>
      <view class="ico-box"></view>
    </view>
    <view v-else-if="name === 'message-heart'" class="ico ico-message">
      <view class="ico-message-heart"></view>
    </view>
    <view v-else-if="name === 'home'" class="ico ico-home">
      <view class="ico-home-roof"></view>
      <view class="ico-home-body"></view>
    </view>
    <view v-else-if="name === 'wallet'" class="ico ico-wallet">
      <view class="ico-wallet-dot"></view>
    </view>
    <view v-else-if="name === 'sparkle'" class="ico ico-sparkle"></view>
    <view v-else-if="name === 'user'" class="ico ico-user">
      <view class="ico-user-head"></view>
      <view class="ico-user-body"></view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 40 },
  active: { type: Boolean, default: false },
  tone: { type: String, default: 'light' }
})
</script>

<style scoped>
.line-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico {
  position: relative;
  box-sizing: border-box;
}

.line-icon--muted {
  color: #9f90a8;
}

.line-icon--active {
  color: #9b77c9;
}

.line-icon--muted .ico,
.line-icon--muted .ico::before,
.line-icon--muted .ico::after,
.line-icon--active .ico,
.line-icon--active .ico::before,
.line-icon--active .ico::after {
  border-color: currentColor !important;
  background: currentColor !important;
}

/* 爱心 */
.ico-heart {
  width: 34rpx;
  height: 30rpx;
  transform: rotate(-45deg);
}

.ico-heart::before,
.ico-heart::after {
  position: absolute;
  width: 18rpx;
  height: 28rpx;
  border-radius: 18rpx 18rpx 0 0;
  background: #fff;
  content: '';
}

.ico-heart::before {
  left: 8rpx;
  transform: rotate(45deg);
  transform-origin: 0 100%;
}

.ico-heart::after {
  right: 8rpx;
  transform: rotate(-45deg);
  transform-origin: 100% 100%;
}

/* 日历 */
.ico-calendar {
  width: 34rpx;
  height: 34rpx;
}

.ico-calendar-top {
  position: absolute;
  top: 0;
  right: 6rpx;
  left: 6rpx;
  height: 8rpx;
  border: 2rpx solid #fff;
  border-bottom: 0;
  border-radius: 4rpx 4rpx 0 0;
}

.ico-calendar-top::before,
.ico-calendar-top::after {
  position: absolute;
  top: -6rpx;
  width: 4rpx;
  height: 8rpx;
  border-radius: 2rpx;
  background: #fff;
  content: '';
}

.ico-calendar-top::before {
  left: 4rpx;
}

.ico-calendar-top::after {
  right: 4rpx;
}

.ico-calendar-body {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 24rpx;
  border: 2rpx solid #fff;
  border-radius: 0 0 6rpx 6rpx;
}

.ico-calendar-body::before {
  position: absolute;
  top: 6rpx;
  right: 4rpx;
  left: 4rpx;
  height: 2rpx;
  background: #fff;
  content: '';
}

/* 相册 */
.ico-album {
  width: 34rpx;
  height: 28rpx;
  border: 2rpx solid #fff;
  border-radius: 6rpx;
}

.ico-album-sun {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
}

.ico-album-hill {
  position: absolute;
  right: 4rpx;
  bottom: 4rpx;
  left: 4rpx;
  height: 10rpx;
  border-top: 2rpx solid #fff;
  border-radius: 50% 50% 0 0;
}

/* 清单 */
.ico-checklist {
  width: 34rpx;
  height: 34rpx;
}

.ico-box {
  position: absolute;
  inset: 0;
  border: 2rpx solid #fff;
  border-radius: 6rpx;
}

.ico-check {
  position: absolute;
  top: 10rpx;
  left: 8rpx;
  width: 14rpx;
  height: 8rpx;
  border-bottom: 2rpx solid #fff;
  border-left: 2rpx solid #fff;
  transform: rotate(-45deg);
}

/* 消息爱心 */
.ico-message {
  width: 36rpx;
  height: 28rpx;
  border: 2rpx solid #fff;
  border-radius: 8rpx;
}

.ico-message::after {
  position: absolute;
  bottom: -6rpx;
  left: 10rpx;
  width: 10rpx;
  height: 10rpx;
  border-right: 2rpx solid #fff;
  border-bottom: 2rpx solid #fff;
  transform: rotate(45deg);
  content: '';
}

.ico-message-heart {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #fff;
  transform: scale(0.85);
}

/* 首页 */
.ico-home {
  width: 34rpx;
  height: 32rpx;
}

.ico-home-roof {
  position: absolute;
  top: 2rpx;
  left: 50%;
  width: 22rpx;
  height: 22rpx;
  margin-left: -11rpx;
  border-top: 2rpx solid #fff;
  border-left: 2rpx solid #fff;
  transform: rotate(45deg);
}

.ico-home-body {
  position: absolute;
  right: 4rpx;
  bottom: 0;
  left: 4rpx;
  height: 16rpx;
  border: 2rpx solid #fff;
  border-top: 0;
  border-radius: 0 0 4rpx 4rpx;
}

/* 钱包 */
.ico-wallet {
  width: 36rpx;
  height: 26rpx;
  border: 2rpx solid #fff;
  border-radius: 8rpx;
}

.ico-wallet-dot {
  position: absolute;
  top: 50%;
  right: 8rpx;
  width: 8rpx;
  height: 8rpx;
  margin-top: -4rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
}

/* 星芒 */
.ico-sparkle {
  width: 32rpx;
  height: 32rpx;
}

.ico-sparkle::before,
.ico-sparkle::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #fff;
  content: '';
}

.ico-sparkle::before {
  width: 2rpx;
  height: 28rpx;
  margin: -14rpx 0 0 -1rpx;
}

.ico-sparkle::after {
  width: 28rpx;
  height: 2rpx;
  margin: -1rpx 0 0 -14rpx;
}

/* 我的 */
.ico-user {
  width: 32rpx;
  height: 34rpx;
}

.ico-user-head {
  position: absolute;
  top: 0;
  left: 50%;
  width: 14rpx;
  height: 14rpx;
  margin-left: -7rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
}

.ico-user-body {
  position: absolute;
  right: 2rpx;
  bottom: 0;
  left: 2rpx;
  height: 14rpx;
  border: 2rpx solid #fff;
  border-top: 0;
  border-radius: 0 0 14rpx 14rpx;
}
</style>
