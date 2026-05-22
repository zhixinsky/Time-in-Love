<template>
  <view class="safe-page ai-page app-nav-page">
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner simple">
        <view class="app-nav ai-head">
          <view class="app-nav__main">
            <view class="app-nav__copy">
              <text class="app-nav__title">AI星芽</text>
              <text class="app-nav__subtitle">帮你把喜欢说得更温柔</text>
            </view>
          </view>
          <image class="avatar-img app-nav__action" :src="CLOUD_LOGO" mode="aspectFit" />
        </view>

        <view class="features">
          <view
            v-for="item in features"
            :key="item.type"
            :class="['feature', { active: selected.type === item.type }]"
            @tap="selectFeature(item)"
          >
            <text class="feature-title">{{ item.label }}</text>
            <text class="feature-sub">{{ item.hint }}</text>
          </view>
        </view>

        <view class="card input-card">
          <text class="card-title">{{ selected.label }}</text>
          <textarea
            v-model="input"
            class="ai-input"
            maxlength="300"
            :placeholder="selected.placeholder"
            auto-height
          />
          <button class="generate-btn tap-scale" :disabled="ai.generating" @tap="generate">
            {{ ai.generating ? '生成中...' : '生成内容' }}
          </button>
        </view>

        <view v-if="ai.result" class="card result-card">
          <view class="result-head">
            <text class="card-title">生成结果</text>
            <text class="copy" @tap="copyResult">复制</text>
          </view>
          <text class="result-text">{{ ai.result }}</text>
        </view>
      </view>
    </scroll-view>
    <LoveTabBar active="ai" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { CLOUD_LOGO } from '../../config'
import { useAiStore } from '../../stores/ai'

const sheetVisible = ref(false)
const ai = useAiStore()

const features = [
  { type: 'advice', label: '今日恋爱小建议', hint: '给今天一点甜', placeholder: '例如：最近有点忙，想给对方一点陪伴感' },
  { type: 'loveWords', label: '帮我写情话', hint: '温柔不油腻', placeholder: '写下对方昵称或你想表达的感觉' },
  { type: 'anniversary', label: '纪念日文案', hint: '适合发给 Ta', placeholder: '例如：恋爱520天、第一次旅行纪念日' },
  { type: 'moments', label: '总结恋爱日记', hint: '提炼心动瞬间', placeholder: '粘贴一段日记内容' },
  { type: 'post', label: '朋友圈文案', hint: '小红书感', placeholder: '例如：今天一起去看海' },
  { type: 'weekly', label: '甜蜜指数', hint: '本周恋爱报告', placeholder: '简单描述这一周发生的小事' }
]

const selected = ref(features[0])
const input = ref('')

function selectFeature(item) {
  selected.value = item
}

async function generate() {
  try {
    await ai.generate(selected.value.type, input.value)
  } catch {
    uni.showToast({ title: '生成失败，请稍后重试', icon: 'none' })
  }
}

function copyResult() {
  uni.setClipboardData({ data: ai.result })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.ai-head {
  justify-content: flex-start;
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
  min-height: 134rpx;
  padding: 26rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: $shadow;
}

.feature.active {
  background: linear-gradient(135deg, rgba(255, 143, 183, 0.88), rgba(201, 167, 255, 0.88));
}

.feature-title,
.feature-sub {
  display: block;
}

.feature-title {
  color: $text-main;
  font-size: 26rpx;
  font-weight: 800;
}

.feature-sub {
  margin-top: 10rpx;
  color: $text-soft;
  font-size: 22rpx;
}

.feature.active .feature-title,
.feature.active .feature-sub {
  color: #fff;
}

.input-card,
.result-card {
  padding: 32rpx;
  margin-top: 26rpx;
}

.card-title {
  position: relative;
  z-index: 1;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.ai-input {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  border-radius: 26rpx;
  color: $text-main;
  font-size: 28rpx;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.72);
}

.generate-btn {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 74rpx;
  margin-top: 24rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
}

.result-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy {
  color: #9b77c9;
  font-size: 24rpx;
  font-weight: 800;
}

.result-text {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 18rpx;
  color: $text-main;
  font-size: 28rpx;
  line-height: 1.65;
}
</style>
