<template>
  <view class="love-dashboard">
    <view class="timeline-panel moona-glass">
      <view class="timeline-head">
        <text class="panel-title">恋爱时间线</text>
        <view class="timeline-filter tap-scale" @tap="goDiaryAll">
          <text>全部</text>
          <text class="filter-chevron">›</text>
        </view>
      </view>

      <view class="timeline-body">
        <scroll-view class="timeline-scroll" scroll-y :show-scrollbar="false">
        <view v-if="timelineLoading" class="timeline-empty">
          <text>加载中…</text>
        </view>
        <view v-else-if="!timelineItems.length" class="timeline-empty">
          <text>还没有记录，去写下第一个心动瞬间吧～</text>
        </view>
        <view v-else class="timeline-list">
          <view
            v-for="(item, index) in timelineItems"
            :key="item.id"
            class="timeline-item"
          >
            <view class="timeline-rail">
              <view class="timeline-date">
                <text class="date-main">{{ item.date }}</text>
                <text class="date-week">{{ item.week }}</text>
              </view>
              <view :class="['timeline-dot', `timeline-dot--${item.type}`]">
                <text class="dot-icon">{{ item.type === 'date' ? '♥' : '✎' }}</text>
              </view>
              <view v-if="index !== timelineItems.length - 1" class="timeline-line" />
            </view>
            <view
              :class="['memory-card', `memory-card--${item.type}`]"
              @tap="openTimelineItem(item)"
            >
              <view class="memory-top">
                <view class="memory-title-wrap">
                  <text class="memory-title">{{ item.title }}</text>
                  <text class="memory-tag">{{ item.tag }}</text>
                </view>
                <text class="memory-more">•••</text>
              </view>
              <text class="memory-copy">{{ item.copy }}</text>
              <view v-if="item.media.length" class="memory-media">
                <view
                  :class="['memory-media-host', { 'memory-media-host--scroll': item.media.length > 3 }]"
                >
                  <scroll-view
                    v-if="item.media.length > 3"
                    class="memory-images-scroll"
                    scroll-x
                    enhanced
                    :show-scrollbar="false"
                  >
                    <view class="memory-images-inner">
                      <view
                        v-for="(media, mediaIndex) in item.media"
                        :key="`${item.id}-m-${mediaIndex}`"
                        class="memory-image memory-image--scroll tap-scale"
                        @tap.stop="onMediaTap(item, mediaIndex)"
                      >
                        <image
                          v-if="mediaDisplaySrc(media)"
                          class="memory-image-photo"
                          :src="mediaDisplaySrc(media)"
                          mode="aspectFill"
                        />
                        <view v-else class="memory-video-ph" />
                        <view v-if="media.type === 'video'" class="video-badge">
                          <text>▶</text>
                        </view>
                        <text
                          v-if="media.type === 'video' && media.duration"
                          class="video-time"
                        >
                          {{ formatVideoDuration(media.duration) }}
                        </text>
                      </view>
                    </view>
                  </scroll-view>
                  <view v-else class="memory-images">
                    <view
                      v-for="(media, mediaIndex) in item.media"
                      :key="`${item.id}-m-${mediaIndex}`"
                      class="memory-image tap-scale"
                      @tap.stop="onMediaTap(item, mediaIndex)"
                    >
                      <image
                        v-if="mediaDisplaySrc(media)"
                        class="memory-image-photo"
                        :src="mediaDisplaySrc(media)"
                        mode="aspectFill"
                      />
                      <view v-else class="memory-video-ph" />
                      <view v-if="media.type === 'video'" class="video-badge">
                        <text>▶</text>
                      </view>
                      <text
                        v-if="media.type === 'video' && media.duration"
                        class="video-time"
                      >
                        {{ formatVideoDuration(media.duration) }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="item.mood" class="memory-footer">
                <view class="memory-mood">
                  <text>{{ item.moodIcon }}</text>
                  <text>{{ item.mood }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        </scroll-view>
      </view>
    </view>

    <view class="side-stack">
      <view class="moona-glass side-card mood-check">
        <text class="side-title">心情打卡</text>
        <view class="mood-pill">
          <view class="mood-mini-heart">♥</view>
          <text>{{ moodToday }}</text>
          <text class="pill-chevron">›</text>
        </view>
        <view class="soft-button tap-scale" @tap="toastSoon('记录心情')">
          <text>记录心情</text>
          <text class="btn-chevron">›</text>
        </view>
      </view>

      <view class="moona-glass side-card sweetness-card">
        <text class="side-title">本月甜蜜值</text>
        <view class="sweet-ring" :style="sweetRingStyle">
          <view class="sweet-ring-inner">
            <text class="sweet-score">{{ sweetScore }}</text>
            <text class="sweet-unit">分</text>
          </view>
        </view>
        <text class="sweet-trend">在一起 {{ loveDays }} 天</text>
        <view class="soft-button soft-button--muted tap-scale" @tap="toastSoon('查看分析报告')">
          <text>查看分析报告</text>
          <text class="btn-chevron">›</text>
        </view>
      </view>

      <view class="moona-glass side-card important-card">
        <text class="side-title">重要日子</text>
        <view v-for="day in importantDays" :key="day.title" class="important-row">
          <view class="important-icon">
            <text class="important-emoji">{{ day.icon }}</text>
          </view>
          <view class="important-copy">
            <text>{{ day.title }}</text>
            <text>还有 {{ day.left }} 天</text>
          </view>
        </view>
        <view v-if="!importantDays.length" class="important-empty">
          <text>暂无纪念日</text>
        </view>
        <view class="soft-button soft-button--muted tap-scale" @tap="goAnniversary">
          <text>全部纪念日</text>
          <text class="btn-chevron">›</text>
        </view>
      </view>

      <view class="moona-glass side-card ledger-card tap-scale" @tap="goBill">
        <text class="side-title">恋爱小账本</text>
        <view class="ledger-line">
          <text>本月支出</text>
          <text>¥ {{ ledgerExpense }}</text>
        </view>
        <view class="ledger-line">
          <text>本月收入</text>
          <text>¥ {{ ledgerIncome }}</text>
        </view>
        <view class="love-jar" aria-hidden="true">
          <view class="jar-lid" />
          <view class="jar-body">
            <text class="jar-heart jar-heart--1">♥</text>
            <text class="jar-heart jar-heart--2">♥</text>
            <text class="jar-heart jar-heart--3">♥</text>
          </view>
        </view>
        <view class="soft-button">
          <text>查看账本</text>
          <text class="btn-chevron">›</text>
        </view>
      </view>

      <view class="moona-glass side-card ai-tip-card">
        <view class="ai-tip-copy">
          <text class="side-title">AI星芽小贴士</text>
          <text class="ai-tip-text">{{ aiTip }}</text>
        </view>
        <view class="ai-sprout" aria-hidden="true">
          <view class="sprout-leaf sprout-leaf--left" />
          <view class="sprout-leaf sprout-leaf--right" />
          <view class="sprout-face">
            <view class="sprout-eye sprout-eye--left" />
            <view class="sprout-eye sprout-eye--right" />
            <view class="sprout-smile" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useDiaryStore } from '../stores/diary'
import { useLoveStore } from '../stores/love'
import { daysUntilNextDate, mapHomeTimelineItem } from '../utils/home-timeline-display'
import { formatVideoDuration } from '../utils/diary-date'
import { markMediaPreviewOpening } from '../utils/media-preview'

const props = defineProps({
  loading: { type: Boolean, default: false }
})

const diary = useDiaryStore()
const love = useLoveStore()

const timelineLoading = computed(() => props.loading)
const timelineItems = computed(() =>
  (diary.timelineList || []).slice(0, 10).map(mapHomeTimelineItem)
)

const moodToday = computed(() => love.moods?.[0]?.mood || '很幸福')
const loveDays = computed(() => love.loveDays)
const sweetScore = computed(() => Math.min(99, Math.max(72, 60 + (love.loveDays % 40))))
const sweetRingStyle = computed(() => ({
  background: `conic-gradient(#ff6fa7 0 ${sweetScore.value}%, rgba(255, 207, 224, 0.75) ${sweetScore.value}% 100%)`
}))

const importantDays = computed(() =>
  (love.anniversaries || []).slice(0, 3).map((item, index) => ({
    title: item.title,
    left: daysUntilNextDate(item.date),
    icon: ['♥', '✿', '★'][index] || '♥'
  }))
)

const ledgerExpense = computed(() =>
  Number(love.bills?.expense || 0).toLocaleString('zh-CN')
)
const ledgerIncome = computed(() =>
  Number(love.bills?.income || 0).toLocaleString('zh-CN')
)

const aiTip = computed(
  () => '今天也记得把心动写下来，星芽会帮你们把温柔存好～'
)

function goDiaryAll() {
  uni.redirectTo({ url: '/pages/diary/index' })
}

function openTimelineItem(item) {
  if (item?.id) {
    uni.redirectTo({ url: `/pages/diary/index?id=${encodeURIComponent(item.id)}` })
    return
  }
  const date = item?.eventDate
  const url = date
    ? `/pages/diary/index?date=${encodeURIComponent(date)}`
    : '/pages/diary/index'
  uni.redirectTo({ url })
}

function mediaDisplaySrc(media) {
  if (!media) return ''
  if (media.type === 'video') return media.poster || ''
  return media.poster || media.url || ''
}

function onMediaTap(item, index) {
  const media = item?.media?.[index]
  if (!media) return
  if (media.type === 'video') {
    playTimelineVideo(media)
    return
  }
  const urls = item.media.filter((m) => m.type === 'image').map((m) => m.url)
  if (!urls.length) return
  markMediaPreviewOpening()
  uni.previewImage({
    current: media.url,
    urls
  })
}

function playTimelineVideo(media) {
  const url = media?.url
  if (!url) return
  // #ifdef MP-WEIXIN
  markMediaPreviewOpening()
  uni.previewMedia({ sources: [{ url, type: 'video' }] })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在微信小程序中播放', icon: 'none' })
  // #endif
}

function goAnniversary() {
  uni.redirectTo({ url: '/pages/anniversary/index' })
}

function goBill() {
  uni.redirectTo({ url: '/pages/bill/index' })
}

function toastSoon(label) {
  uni.showToast({ title: `${label} 即将开放`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as *;

.moona-glass {
  @include moona-glass-card;
}

.love-dashboard {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20rpx;
  width: 100%;
  margin: 8rpx 0 24rpx;
  box-sizing: border-box;
}

.timeline-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
  z-index: 1;
}

.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 28rpx 18rpx 0;
  box-sizing: border-box;
}

.panel-title {
  font-size: 29rpx;
  line-height: 1.25;
  font-weight: 620;
  color: rgba(31, 20, 39, 0.86);
}

.timeline-filter {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 10rpx;
  font-size: 22rpx;
  color: rgba(95, 77, 105, 0.72);
}

.filter-chevron {
  font-size: 24rpx;
  line-height: 1;
}

.timeline-body {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-scroll {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0 18rpx 24rpx;
  box-sizing: border-box;
}

.timeline-list {
  margin-top: 28rpx;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10rpx;
}

.timeline-rail {
  position: relative;
  width: 58rpx;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-date {
  z-index: 3;
  margin-bottom: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(63, 48, 72, 0.74);
  padding-bottom: 4rpx;
}

.date-main {
  font-size: 21rpx;
  font-weight: 620;
}

.date-week {
  margin-top: 5rpx;
  font-size: 17rpx;
  font-weight: 480;
}

.timeline-dot {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24rpx rgba(255, 102, 172, 0.32);
}

.dot-icon {
  color: #fff;
  font-size: 16rpx;
  line-height: 1;
}

.timeline-dot--date {
  background: linear-gradient(135deg, #ff77ad, #f2609c);
}

.timeline-dot--daily {
  background: linear-gradient(135deg, #a98cff, #7f61ee);
}

.timeline-line {
  flex: 1;
  width: 2rpx;
  min-height: 56rpx;
  margin-top: 10rpx;
  margin-bottom: 12rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 128, 186, 0.42) 0%,
    rgba(177, 132, 255, 0.28) 100%
  );
  border-radius: 2rpx;
}

.memory-card {
  flex: 1;
  min-width: 0;
  @include moona-memory-card;
}

.memory-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}

.memory-title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.memory-title {
  font-size: 26rpx;
  line-height: 1.25;
  font-weight: 620;
  color: rgba(34, 23, 42, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220rpx;
}

.memory-tag {
  flex-shrink: 0;
  padding: 5rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 580;
  color: #f05b99;
  background: rgba(255, 213, 231, 0.72);
  white-space: nowrap;
}

.memory-more {
  color: #9d8aa4;
  font-size: 24rpx;
  letter-spacing: 4rpx;
}

.memory-copy {
  margin-top: 16rpx;
  font-size: 23rpx;
  line-height: 1.55;
  font-weight: 430;
  color: rgba(67, 51, 75, 0.66);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memory-media {
  margin-top: 14rpx;
}

/* Skyline：横向 scroll-view 必须固定高度，勿用 enable-flex */
.memory-media-host--scroll {
  width: 100%;
  height: 92rpx;
  overflow: hidden;
}

.memory-images-scroll {
  width: 100%;
  height: 92rpx;
  white-space: nowrap;
}

.memory-images-inner {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 8rpx;
  height: 92rpx;
  padding-right: 8rpx;
  box-sizing: border-box;
}

.memory-images {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
}

.memory-video-ph {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f5dce8, #e8dcf5);
}

.memory-image {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 92rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.memory-image--scroll {
  flex: 0 0 132rpx;
  width: 132rpx;
  min-width: 132rpx;
  height: 92rpx;
}

.memory-image-photo {
  width: 100%;
  height: 100%;
}

.video-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 18rpx;
  background: rgba(0, 0, 0, 0.35);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  transform: translate(-50%, -50%);
}

.video-time {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  z-index: 2;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 18rpx;
  background: rgba(0, 0, 0, 0.42);
}

.memory-footer {
  margin-top: 14rpx;
}

.memory-mood {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 21rpx;
  font-weight: 650;
  color: rgba(92, 73, 99, 0.68);
}

.timeline-empty {
  padding: 32rpx 12rpx 8rpx;
  text-align: center;
  font-size: 24rpx;
  color: rgba(71, 54, 78, 0.55);
  line-height: 1.5;
}

.side-stack {
  width: 224rpx;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 18rpx;
  overflow: visible;
  z-index: 2;
}

.side-card {
  padding: 22rpx 18rpx;
  box-sizing: border-box;
}

.side-title {
  display: block;
  font-size: 24rpx;
  line-height: 1.25;
  font-weight: 640;
  color: rgba(47, 34, 58, 0.7);
}

.mood-pill {
  margin-top: 18rpx;
  height: 64rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.38);
  border: 1rpx solid rgba(255, 255, 255, 0.58);
  font-size: 22rpx;
  font-weight: 620;
  color: rgba(45, 32, 53, 0.82);
}

.mood-mini-heart {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18rpx;
  background: linear-gradient(135deg, #ffa1c5, #ff6fa7);
}

.pill-chevron,
.btn-chevron {
  font-size: 24rpx;
  line-height: 1;
  opacity: 0.7;
}

.soft-button {
  margin-top: 16rpx;
  height: 52rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  background: linear-gradient(90deg, rgba(255, 219, 232, 0.78), rgba(255, 239, 245, 0.72));
  color: #f45d9a;
  font-size: 21rpx;
  font-weight: 620;
}

.soft-button--muted {
  color: #9872c9;
  background: rgba(255, 255, 255, 0.52);
}

.sweet-ring {
  width: 120rpx;
  height: 120rpx;
  margin: 16rpx auto 6rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 28rpx rgba(240, 91, 153, 0.16);
}

.sweet-ring-inner {
  width: 94rpx;
  height: 94rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.88);
}

.sweet-score {
  font-size: 36rpx;
  font-weight: 800;
  color: #f45d9a;
}

.sweet-unit {
  margin-left: 2rpx;
  margin-top: 14rpx;
  font-size: 16rpx;
  color: #f45d9a;
}

.sweet-trend {
  display: block;
  text-align: center;
  font-size: 20rpx;
  color: $text-soft;
}

.important-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx;
  border-radius: 16rpx;
  background: rgba(255, 239, 246, 0.62);
}

.important-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffa1c5, #f2669d);
  flex-shrink: 0;
}

.important-emoji {
  font-size: 18rpx;
  color: #fff;
}

.important-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.important-copy text:first-child {
  font-size: 22rpx;
  font-weight: 700;
  color: $text-main;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.important-copy text:last-child {
  font-size: 18rpx;
  color: $text-soft;
}

.important-empty {
  margin-top: 12rpx;
  font-size: 20rpx;
  color: $text-soft;
}

.ledger-card {
  position: relative;
  min-height: 200rpx;
}

.ledger-line {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.ledger-line text:first-child {
  font-size: 20rpx;
  color: $text-soft;
}

.ledger-line text:last-child {
  font-size: 24rpx;
  font-weight: 700;
  color: $text-num;
}

.love-jar {
  position: absolute;
  right: 10rpx;
  bottom: 56rpx;
  width: 80rpx;
  height: 80rpx;
}

.jar-lid {
  position: absolute;
  left: 16rpx;
  top: 0;
  width: 48rpx;
  height: 18rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffc399, #ee8c62);
  z-index: 2;
}

.jar-body {
  position: absolute;
  left: 8rpx;
  top: 12rpx;
  width: 60rpx;
  height: 56rpx;
  border-radius: 14rpx 14rpx 16rpx 16rpx;
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.72), rgba(255, 219, 206, 0.38));
  border: 2rpx solid rgba(211, 137, 104, 0.34);
}

.jar-heart {
  position: absolute;
  color: #f46a9d;
  font-size: 16rpx;
}

.jar-heart--1 {
  left: 18rpx;
  bottom: 10rpx;
}

.jar-heart--2 {
  left: 30rpx;
  bottom: 18rpx;
  color: #ff9fc3;
}

.jar-heart--3 {
  left: 40rpx;
  bottom: 8rpx;
  color: #c9a1ff;
}

.ai-tip-card {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8rpx;
  min-height: 140rpx;
}

.ai-tip-copy {
  flex: 1;
  min-width: 0;
}

.ai-tip-text {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  line-height: 1.45;
  color: $text-soft;
}

.ai-sprout {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}

.sprout-leaf {
  position: absolute;
  width: 28rpx;
  height: 18rpx;
  border-radius: 999rpx 999rpx 0 999rpx;
  background: linear-gradient(135deg, #b8f0c8, #7ed9a8);
}

.sprout-leaf--left {
  left: 6rpx;
  top: 8rpx;
  transform: rotate(-28deg);
}

.sprout-leaf--right {
  right: 6rpx;
  top: 8rpx;
  transform: rotate(28deg) scaleX(-1);
}

.sprout-face {
  position: absolute;
  left: 50%;
  bottom: 4rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff4d8, #ffd9a8);
  transform: translateX(-50%);
}

.sprout-eye {
  position: absolute;
  top: 16rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #5c4030;
}

.sprout-eye--left {
  left: 12rpx;
}

.sprout-eye--right {
  right: 12rpx;
}

.sprout-smile {
  position: absolute;
  left: 14rpx;
  bottom: 12rpx;
  width: 16rpx;
  height: 8rpx;
  border-bottom: 2rpx solid #d17078;
  border-radius: 0 0 999rpx 999rpx;
}

.tap-scale:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
