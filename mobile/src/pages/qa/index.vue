<template>
  <view class="safe-page qa-page app-nav-page">
    <CloudImage image-class="page-bg" :file-id="CLOUD_LOVE_BG" mode="widthFix" />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <view class="app-nav">
          <view class="app-nav__main">
            <view class="app-nav__back tap-scale" @tap="goHome">‹</view>
            <view class="app-nav__copy">
              <text class="app-nav__title">甜蜜问答</text>
              <text class="app-nav__subtitle">每天回答一个更靠近彼此的问题</text>
            </view>
          </view>
        </view>

        <view class="card question-card">
          <view class="question-tag">{{ qa.today?.question?.category || '今日' }}</view>
          <text class="question">{{ qa.today?.question?.content || '正在准备今天的问题...' }}</text>
          <view class="answer-state">
            <text>{{ qa.today?.myAnswer ? '我已回答' : '我还没回答' }}</text>
            <text>{{ qa.today?.partnerAnswered ? 'Ta 已回答' : '等待 Ta 回答' }}</text>
          </view>
        </view>

        <view class="card answer-card">
          <text class="card-title">我的回答</text>
          <textarea
            v-model="answerText"
            class="answer-input"
            maxlength="300"
            placeholder="写下你真实的想法..."
            auto-height
          />
          <button class="save-btn tap-scale" @tap="saveAnswer">
            {{ qa.today?.myAnswer ? '更新回答' : '提交回答' }}
          </button>
        </view>

        <view class="section-title">历史回答</view>
        <view v-if="qa.loading" class="empty card">正在加载问答...</view>
        <view v-else-if="!qa.history.length" class="empty card">还没有历史回答</view>
        <view v-else class="history-list">
          <view v-for="item in qa.history" :key="item.id" class="card history-card">
            <text class="history-date">{{ item.answerDate }}</text>
            <text class="history-question">{{ item.question }}</text>
            <text class="history-answer">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    <LoveTabBar active="home" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useQaStore } from '../../stores/qa'
import CloudImage from '../../components/CloudImage.vue'
import { CLOUD_LOVE_BG } from '../../config'

const qa = useQaStore()
const sheetVisible = ref(false)
const answerText = ref('')

watch(
  () => qa.today?.myAnswer?.answer,
  (value) => {
    answerText.value = value || ''
  }
)

onShow(async () => {
  await qa.fetchAll()
  answerText.value = qa.today?.myAnswer?.answer || ''
})

async function saveAnswer() {
  const content = answerText.value.trim()
  if (!content) {
    uni.showToast({ title: '先写一点回答吧', icon: 'none' })
    return
  }
  await qa.answer(content)
  uni.showToast({ title: '已保存', icon: 'success' })
}

function goHome() {
  uni.redirectTo({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.qa-page {
  background: #fff4fa;
}

.page-bg {
  position: absolute;
  top: -200rpx;
  left: 0;
  z-index: 0;
  width: 100%;
}

.question-card,
.answer-card,
.history-card {
  padding: 34rpx;
}

.question-tag {
  position: relative;
  z-index: 1;
  display: inline-flex;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 22rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
}

.question {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 24rpx;
  color: $text-main;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1.45;
}

.answer-state {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.answer-state text {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  color: $text-soft;
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.62);
}

.card-title {
  position: relative;
  z-index: 1;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.answer-input {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 190rpx;
  padding: 24rpx;
  margin-top: 22rpx;
  border-radius: 28rpx;
  color: $text-main;
  font-size: 28rpx;
  line-height: 1.55;
  background: rgba(255, 255, 255, 0.72);
}

.save-btn {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 72rpx;
  margin-top: 24rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
}

.section-title {
  margin: 16rpx 4rpx;
  color: $text-main;
  font-size: 28rpx;
  font-weight: 800;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.history-date,
.history-question,
.history-answer {
  position: relative;
  z-index: 1;
  display: block;
}

.history-date {
  color: #9b77c9;
  font-size: 22rpx;
  font-weight: 800;
}

.history-question {
  margin-top: 10rpx;
  color: $text-main;
  font-size: 28rpx;
  font-weight: 800;
}

.history-answer {
  margin-top: 12rpx;
  color: $text-soft;
  font-size: 26rpx;
  line-height: 1.5;
}

.empty {
  padding: 46rpx;
  color: $text-soft;
  text-align: center;
}
</style>
