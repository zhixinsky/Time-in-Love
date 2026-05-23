<template>
  <view class="page-liquid-bg" aria-hidden="true">
    <view class="page-liquid-bg__static" />
    <view class="page-liquid-bg__fluid" />
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
</style>
