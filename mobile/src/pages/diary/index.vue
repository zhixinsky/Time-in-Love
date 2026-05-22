<template>
  <view class="safe-page diary-page">
    <image class="diary-bg" :src="cloudLoveBg" mode="widthFix" />

    <view class="app-nav diary-nav">
      <view class="app-nav__main">
        <view class="app-nav__back tap-scale" @tap="goHome">
          <text>‹</text>
        </view>
        <view class="app-nav__copy">
          <text class="app-nav__title">心动日记</text>
        </view>
      </view>
      <view class="nav-right app-nav__action">
        <picker mode="date" :value="diary.selectedDate" @change="onPickDate">
          <view class="nav-calendar tap-scale">
            <text class="cal-icon">▦</text>
          </view>
        </picker>
      </view>
    </view>

    <scroll-view
      class="diary-scroll"
      scroll-y
      enable-flex
      :show-scrollbar="false"
      enhanced
    >
      <view
        class="week-strip"
        @touchstart="onWeekTouchStart"
        @touchend="onWeekTouchEnd"
      >
        <view class="week-row">
          <view
            v-for="item in diary.weekDays"
            :key="item.ymd"
            class="week-day tap-scale"
            @tap="onSelectDate(item.ymd)"
          >
            <text :class="['week-label', { active: item.ymd === diary.selectedDate }]">
              {{ item.weekday }}
            </text>
            <view
              :class="['week-ring', { active: item.ymd === diary.selectedDate }]"
            >
              <text class="week-num">{{ item.day }}</text>
            </view>
            <view v-if="item.ymd === diary.selectedDate" class="week-dot" />
          </view>
        </view>
      </view>

      <view v-if="diary.loading" class="glass-card diary-loading">
        <text>正在加载心动日记…</text>
      </view>

      <view v-else-if="!hasDiary" class="glass-card empty-card card-fade">
        <text class="empty-title">今天还没有记录心动瞬间</text>
        <text class="empty-copy">写下这一刻，让以后也能想起今天</text>
        <button class="empty-btn tap-scale" @tap="openEdit">去记录</button>
      </view>

      <view v-else class="glass-card diary-card card-fade">
        <view class="diary-deco" aria-hidden="true">
          <text class="quote-mark">“</text>
        </view>
        <view class="diary-body">
          <text
            :class="['diary-text', { 'diary-text--clamp': !expanded }]"
          >{{ diary.currentDiary.content }}</text>
          <text
            v-if="showExpandToggle"
            class="expand-btn tap-scale"
            @tap="expanded = !expanded"
          >{{ expanded ? '收起' : '展开全文' }}</text>

          <view v-if="displayImages.length || displayVideos.length" class="media-row">
            <view
              v-for="(img, idx) in displayImages"
              :key="img"
              class="media-cell tap-scale"
              @tap="previewImages(idx)"
            >
              <image class="media-img" :src="img" mode="aspectFill" />
            </view>
            <view
              v-for="video in displayVideos"
              :key="video.url"
              class="media-cell media-cell--video tap-scale"
              @tap="playVideo(video)"
            >
              <image
                v-if="videoCover(video)"
                class="media-img"
                :src="videoCover(video)"
                mode="aspectFill"
              />
              <view v-else class="media-video-ph" />
              <view class="video-play"><text>▶</text></view>
              <text v-if="video.duration" class="video-time">
                {{ formatVideoDuration(video.duration) }}
              </text>
            </view>
          </view>

          <view v-if="metaItems.length" class="meta-wrap">
            <view v-for="m in metaItems" :key="m.key" class="meta-chip">
              <text :class="['meta-icon', m.iconClass]">{{ m.icon }}</text>
              <text class="meta-val">{{ m.text }}</text>
            </view>
          </view>

          <view class="author-row">
            <view class="author-avatar">
              <text>{{ diary.currentAuthor?.avatar || '♡' }}</text>
            </view>
            <view class="author-copy">
              <text class="author-name">{{ authorLabel }}</text>
              <text class="author-time">{{ publishTime }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="hasDiary" class="glass-card ai-card card-fade card-fade--delay">
        <view class="ai-copy">
          <text class="ai-label">AI星芽的小记</text>
          <text v-if="displayAi" class="ai-text">{{ displayAi }}</text>
          <text v-else class="ai-text ai-text--hint">让星芽帮你写下今天的温柔小记吧～</text>
          <button
            v-if="!displayAi || canRegenerateAi"
            class="ai-gen-btn tap-scale"
            :disabled="diary.aiGenerating"
            @tap="onGenerateAi"
          >
            {{ diary.aiGenerating ? '生成中…' : displayAi ? '重新生成' : '生成 AI 小记' }}
          </button>
        </view>
        <view class="ai-sprout">✿</view>
      </view>

      <view class="history-block">
        <view class="history-head">
          <text class="history-title">心动记录</text>
          <text class="history-all tap-scale" @tap="showAllTip">全部 ›</text>
        </view>
        <view v-if="!diary.timelineList.length" class="history-empty glass-card">
          <text>更多回忆会出现在这里</text>
        </view>
        <view
          v-for="(item, index) in diary.timelineList"
          :key="item.id"
          class="history-item glass-card tap-scale card-fade"
          @tap="openTimelineItem(item)"
        >
          <view class="history-timeline" aria-hidden="true">
            <view class="history-dot" />
            <view v-if="index < diary.timelineList.length - 1" class="history-line" />
          </view>
          <view class="history-main">
            <view class="history-title-row">
              <text class="history-item-title">{{ item.contentPreview || '心动瞬间' }}</text>
              <text v-if="item.isAnniversary" class="history-tag">纪念日</text>
            </view>
            <text class="history-date">{{ formatTimelineDate(item.date) }}</text>
            <text class="history-days">
              恋爱第 <text class="history-days-num">{{ item.loveDay }}</text> 天
            </text>
          </view>
          <image
            v-if="timelineCover(item)"
            class="history-thumb"
            :src="timelineCover(item)"
            mode="aspectFill"
          />
        </view>
      </view>

      <view class="scroll-bottom-spacer" />
    </scroll-view>

    <view class="bottom-bar">
      <button class="record-btn tap-scale" @tap="openEdit">
        <text class="record-icon">✎</text>
        <text>记录心动瞬间</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useDiaryStore } from '../../stores/diary'
import { CLOUD_LOVE_BG } from '../../config'

const cloudLoveBg = CLOUD_LOVE_BG
import { formatDiaryTime, formatVideoDuration } from '../../utils/diary-date'
import { resolveMediaUrl } from '../../services/request'

const diary = useDiaryStore()
const expanded = ref(false)
let weekTouchX = 0

const hasDiary = computed(() => Boolean(diary.currentDiary?.id))

const displayImages = computed(() =>
  diary.currentMedia
    .filter((m) => m.type === 'image')
    .slice(0, 3)
    .map((m) => resolveMediaUrl(m.url))
)

const displayVideos = computed(() =>
  diary.currentMedia.filter((m) => m.type === 'video').slice(0, 1)
)

const metaItems = computed(() => {
  const d = diary.currentDiary
  if (!d) return []
  const items = []
  if (d.mood) items.push({ key: 'mood', icon: '♥', iconClass: 'pink', text: d.mood })
  if (d.weather) {
    const temp = d.temperature ? ` ${d.temperature}` : ''
    items.push({ key: 'weather', icon: '☀', iconClass: 'sun', text: `${d.weather}${temp}` })
  }
  if (d.locationName) items.push({ key: 'loc', icon: '●', iconClass: 'purple', text: d.locationName })
  return items
})

const showExpandToggle = computed(() => (diary.currentDiary?.content || '').length > 96)

const displayAi = computed(() => diary.aiSummary || diary.currentDiary?.aiSummary || '')

const canRegenerateAi = computed(() => Boolean(displayAi.value))

const authorLabel = computed(() => {
  const name = diary.currentAuthor?.nickname
  if (name === '我' || name === 'Ta') return name
  return diary.currentDiary?.userId === 'u_me' ? '我' : 'Ta'
})

const publishTime = computed(() =>
  formatDiaryTime(diary.currentDiary?.createdAt)
)

function formatTimelineDate(ymd) {
  return (ymd || '').replace(/-/g, '.')
}

function videoCover(video) {
  return resolveMediaUrl(video.coverUrl || video.url)
}

function timelineCover(item) {
  return item.coverImage ? resolveMediaUrl(item.coverImage) : ''
}

function onPickDate(e) {
  const date = e.detail.value
  if (date) diary.selectDate(date)
}

function onSelectDate(ymd) {
  expanded.value = false
  diary.selectDate(ymd)
}

function onWeekTouchStart(e) {
  weekTouchX = e.touches?.[0]?.clientX ?? 0
}

function onWeekTouchEnd(e) {
  const x = e.changedTouches?.[0]?.clientX ?? 0
  const dx = x - weekTouchX
  if (dx > 50) diary.switchWeek('prev')
  if (dx < -50) diary.switchWeek('next')
}

function previewImages(index) {
  uni.previewImage({
    current: displayImages.value[index],
    urls: displayImages.value
  })
}

function playVideo(video) {
  const url = resolveMediaUrl(video.url)
  // #ifdef MP-WEIXIN
  uni.previewMedia({ sources: [{ url, type: 'video' }] })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在微信小程序中播放', icon: 'none' })
  // #endif
}

async function onGenerateAi() {
  const id = diary.currentDiary?.id
  if (!id) return
  try {
    await diary.generateAiSummary(id)
    uni.showToast({ title: '小记已生成', icon: 'success' })
  } catch {
    uni.showToast({ title: '生成失败，请稍后重试', icon: 'none' })
  }
}

function openEdit() {
  const q = [`date=${encodeURIComponent(diary.selectedDate)}`]
  if (diary.currentDiary?.id) q.push(`id=${encodeURIComponent(diary.currentDiary.id)}`)
  uni.navigateTo({ url: `/pages/diary/edit?${q.join('&')}` })
}

function goHome() {
  uni.redirectTo({ url: '/pages/home/index' })
}

function openTimelineItem(item) {
  diary.selectDate(item.date)
}

function showAllTip() {
  uni.showToast({ title: '时间线展示最近记录', icon: 'none' })
}

onShow(() => {
  diary.initPage()
})
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.diary-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.diary-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
}

.diary-nav {
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-calendar {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
}

.cal-icon {
  font-size: 32rpx;
  color: #b99cff;
  font-weight: 700;
}

.diary-scroll {
  position: relative;
  z-index: 5;
  height: calc(100vh - 212rpx);
  padding: 0 24rpx;
  box-sizing: border-box;
}

.week-strip {
  margin: 8rpx 0 16rpx;
}

.week-row {
  display: flex;
  justify-content: space-between;
  gap: 8rpx;
}

.week-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.week-label {
  font-size: 22rpx;
  color: #9b8c9f;
}

.week-label.active {
  color: #ff82ae;
  font-weight: 600;
}

.week-ring {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.week-ring.active {
  background: #ff7eaa;
  box-shadow: 0 10rpx 24rpx rgba(255, 126, 170, 0.35);
}

.week-num {
  font-size: 28rpx;
  font-weight: 700;
  color: #6f5d73;
}

.week-ring.active .week-num {
  color: #fff;
}

.week-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ff7eaa;
}

.glass-card {
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12rpx 40rpx rgba(255, 170, 210, 0.12);
}

.card-fade {
  animation: cardFadeIn 0.45s ease both;
}

.card-fade--delay {
  animation-delay: 0.1s;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.diary-loading,
.history-empty {
  padding: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #9b8c9f;
  margin-bottom: 20rpx;
}

.empty-card {
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #4a3d52;
  margin-bottom: 12rpx;
}

.empty-copy {
  display: block;
  font-size: 26rpx;
  color: #9b8c9f;
  line-height: 1.6;
  margin-bottom: 28rpx;
}

.empty-btn {
  display: inline-flex;
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff9ac4, #ff82ae);
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.diary-card {
  position: relative;
  padding: 32rpx 28rpx 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.diary-deco {
  position: absolute;
  top: 12rpx;
  left: 24rpx;
  pointer-events: none;
}

.quote-mark {
  font-size: 72rpx;
  line-height: 1;
  color: rgba(255, 180, 210, 0.45);
  font-family: Georgia, serif;
}

.diary-body {
  position: relative;
  z-index: 1;
  padding-top: 36rpx;
}

.diary-text {
  display: block;
  font-size: 28rpx;
  line-height: 1.7;
  color: #6f5d73;
  white-space: pre-wrap;
}

.diary-text--clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  overflow: hidden;
}

.expand-btn {
  display: inline-block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #ff82ae;
}

.media-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.media-cell {
  width: 200rpx;
  height: 200rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  background: rgba(255, 220, 235, 0.35);
}

.media-img {
  width: 100%;
  height: 100%;
}

.media-cell--video .media-video-ph {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #ffd6e8, #f5c4ff);
}

.video-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #ff82ae;
}

.video-time {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  font-size: 20rpx;
  color: #fff;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.25);
}

.meta-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(230, 210, 225, 0.45);
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.55);
}

.meta-icon {
  font-size: 24rpx;
}

.meta-icon.pink {
  color: #ff82ae;
}

.meta-icon.sun {
  color: #ffc857;
}

.meta-icon.purple {
  color: #b99cff;
}

.meta-val {
  font-size: 24rpx;
  color: #6f5d73;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.author-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 200, 220, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.author-name {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #4a3d52;
}

.author-time {
  display: block;
  font-size: 22rpx;
  color: #9b8c9f;
  margin-top: 4rpx;
}

.ai-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(
    135deg,
    rgba(255, 240, 248, 0.85),
    rgba(240, 228, 255, 0.78)
  );
}

.ai-copy {
  flex: 1;
  min-width: 0;
}

.ai-label {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #4a3d52;
  margin-bottom: 10rpx;
}

.ai-text {
  display: block;
  font-size: 26rpx;
  line-height: 1.65;
  color: #7b6c85;
}

.ai-text--hint {
  color: #9b8c9f;
}

.ai-gen-btn {
  margin-top: 16rpx;
  padding: 10rpx 24rpx;
  font-size: 24rpx;
  color: #ff82ae;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 130, 174, 0.35);
}

.ai-sprout {
  font-size: 40rpx;
  color: #b99cff;
  margin-left: 12rpx;
}

.history-block {
  margin-bottom: 24rpx;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.history-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #4a3d52;
}

.history-all {
  font-size: 24rpx;
  color: #9b8c9f;
}

.history-item {
  display: flex;
  gap: 16rpx;
  padding: 22rpx 20rpx;
  margin-bottom: 16rpx;
}

.history-timeline {
  width: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.history-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 3rpx solid #ff82ae;
  background: #fff;
}

.history-line {
  flex: 1;
  width: 2rpx;
  min-height: 40rpx;
  margin-top: 6rpx;
  background: linear-gradient(180deg, rgba(255, 130, 174, 0.35), transparent);
}

.history-main {
  flex: 1;
  min-width: 0;
}

.history-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.history-item-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #4a3d52;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360rpx;
}

.history-tag {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #ff82ae;
  background: rgba(255, 200, 220, 0.45);
}

.history-date {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #9b8c9f;
}

.history-days {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #7b6c85;
}

.history-days-num {
  color: #ff82ae;
  font-weight: 800;
}

.history-thumb {
  width: 128rpx;
  height: 128rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}

.scroll-bottom-spacer {
  height: 150rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.record-btn {
  pointer-events: auto;
  width: 80%;
  height: 88rpx;
  border-radius: 999rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #ff9ac4, #ff82ae);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 40rpx rgba(255, 130, 174, 0.35);
}

.record-icon {
  font-size: 32rpx;
}

.tap-scale:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
