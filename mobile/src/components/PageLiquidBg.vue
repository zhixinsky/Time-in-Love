<template>
  <view class="page-liquid-bg" aria-hidden="true">
    <view class="page-liquid-bg__static" />
    <view class="page-liquid-bg__fluid" />
    <view class="page-liquid-bg__orb page-liquid-bg__orb--pink" />
    <view class="page-liquid-bg__orb page-liquid-bg__orb--purple" />
    <view class="page-liquid-bg__orb page-liquid-bg__orb--white" />
  </view>
</template>

<script setup>
/** 子页液态玻璃背景（真实节点，避免 Skyline 伪元素 / scroll-view 白底遮挡） */
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as *;

.page-liquid-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-liquid-bg__static {
  width: 100%;
  height: 100%;
  @include romantic-page-gradient-fill;
}

.page-liquid-bg__fluid {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  @include liquid-glass-fluid-overlay;
}

.page-liquid-bg__orb {
  position: absolute;
  border-radius: 9999rpx;
  filter: blur(150px);
  opacity: 0.9;
  animation: orbFloat 18s ease-in-out infinite alternate;
}

.page-liquid-bg__orb--pink {
  top: 8%;
  left: -22%;
  width: 520rpx;
  height: 440rpx;
  background: rgba(255, 182, 193, 0.16);
}

.page-liquid-bg__orb--purple {
  right: -26%;
  top: 26%;
  width: 600rpx;
  height: 520rpx;
  background: rgba(205, 183, 255, 0.12);
  animation-delay: -6s;
}

.page-liquid-bg__orb--white {
  left: 18%;
  bottom: 2%;
  width: 640rpx;
  height: 520rpx;
  background: rgba(255, 255, 255, 0.35);
  animation-delay: -11s;
}

@keyframes orbFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  100% {
    transform: translate3d(36rpx, -48rpx, 0) scale(1.06);
  }
}
</style>
