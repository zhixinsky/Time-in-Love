<template>
  <view class="safe-page diary-page app-nav-page">
    <PageLiquidBg static-only />
    <scroll-view class="content-scroll" scroll-y enable-flex :show-scrollbar="false">
      <view class="page-inner">
        <PageNavBar title="心动日记" :show-back="false">
          <template #titleAction>
            <picker mode="date" :value="selectedDate" :end="todayYmd" @change="onPickDate">
              <view class="nav-calendar tap-scale">
                <image class="nav-calendar-icon" :src="calendarIcon" mode="aspectFit" />
              </view>
            </picker>
          </template>
        </PageNavBar>

        <DiaryDateStrip
          :selected="selectedDate"
          :diary-marks="recentDiaryMarks"
          @select="onSelectDate"
        />

        <view v-if="showDiaryLoading" class="glass-card diary-loading">
        <text>正在加载心动日记…</text>
      </view>

        <view v-else-if="!hasDiary" class="glass-card empty-card">
        <text class="empty-title">今天还没有记录心动瞬间</text>
        <text class="empty-copy">写下这一刻，让以后也能想起今天</text>
        <button class="empty-btn tap-scale" @tap="openPublish">去记录</button>
      </view>

      <view v-else class="glass-card diary-card">
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
              <video
                v-else-if="resolveMediaUrl(video.url)"
                class="media-video"
                :src="resolveMediaUrl(video.url)"
                object-fit="cover"
                :controls="false"
                :show-center-play-btn="false"
                :show-play-btn="false"
                :enable-progress-gesture="false"
                muted
              />
              <view v-else class="media-video-ph" />
              <view class="video-play"><view class="video-play-triangle" /></view>
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

      <view class="history-block">
        <DiaryTimelineSection
          title="心动记录"
          :items="historyItems"
          layout="full"
          :show-card-actions="true"
          empty-text="更多回忆会出现在这里"
          @item-tap="openTimelineItem"
          @card-action="onTimelineCardAction"
          @media-tap="onHistoryMediaTap"
        />
      </view>

        <view class="scroll-bottom-spacer" />
      </view>
    </scroll-view>

    <view class="diary-fab tap-scale" @tap="openPublish">
      <text class="diary-fab-icon">✎</text>
    </view>
    <LoveTabBar active="diary" @create="openPublish" />

    <view v-if="timelineMenuVisible" class="timeline-menu-root" @tap="closeTimelineMenu">
      <view class="timeline-menu-mask" />
      <view class="timeline-menu-sheet" @tap.stop>
        <view class="timeline-menu-handle" />
        <text class="timeline-menu-title">这篇心动日记</text>
        <text class="timeline-menu-subtitle">{{ activeTimelineItem?.title || '选择操作' }}</text>

        <view class="timeline-menu-list">
          <button class="timeline-menu-item tap-scale" @tap="onTimelineMenuEdit">
            <text class="timeline-menu-item__icon">✎</text>
            <text class="timeline-menu-item__label">编辑日记</text>
          </button>
          <button class="timeline-menu-item timeline-menu-item--danger tap-scale" @tap="onTimelineMenuDelete">
            <text class="timeline-menu-item__icon">⌫</text>
            <text class="timeline-menu-item__label">删除日记</text>
          </button>
        </view>

        <button class="timeline-menu-cancel tap-scale" @tap="closeTimelineMenu">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { onLoad, onShow } from '@dcloudio/uni-app'
import DiaryDateStrip from '../../components/DiaryDateStrip.vue'
import PageLiquidBg from '../../components/PageLiquidBg.vue'
import PageNavBar from '../../components/PageNavBar.vue'
import DiaryTimelineSection from '../../components/DiaryTimelineSection.vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import { useAuthStore } from '../../stores/auth'
import { useDiaryStore } from '../../stores/diary'
import { formatDiaryTime, formatVideoDuration, formatYmd } from '../../utils/diary-date'
import { calendarIcon } from '../../utils/icons'
import { weatherIconFor } from '../../utils/diary-meta-options'
import { resolveMediaUrl } from '../../services/request'
import { resolveVideoPoster } from '../../utils/media-display'
import { mapHomeTimelineItem } from '../../utils/home-timeline-display'
import { markMediaPreviewOpening } from '../../utils/media-preview'

const diary = useDiaryStore()
const { selectedDate, recentDiaryMarks, resolvedDiaryMarks } = storeToRefs(diary)
const expanded = ref(false)
const todayYmd = formatYmd(new Date())
const timelineMenuVisible = ref(false)
const activeTimelineItem = ref(null)
let pendingDate = ''
let pendingDiaryId = ''

onLoad((options) => {
  if (options?.date) pendingDate = decodeURIComponent(options.date)
  if (options?.id) pendingDiaryId = decodeURIComponent(options.id)
})

const hasDiary = computed(() => Boolean(diary.currentDiary?.id))
const showDiaryLoading = computed(
  () => diary.loading && !resolvedDiaryMarks.value?.[selectedDate.value]
)

const displayImages = computed(() =>
  diary.currentMedia
    .filter((m) => m.type === 'image')
    .slice(0, 3)
    .map((m) => resolveMediaUrl(m.url))
)

const displayVideos = computed(() =>
  diary.currentMedia.filter((m) => m.type === 'video').slice(0, 1)
)

const historyItems = computed(() =>
  (diary.timelineList || []).slice(0, 10).map(mapHomeTimelineItem)
)

const metaItems = computed(() => {
  const d = diary.currentDiary
  if (!d) return []
  const items = []
  if (d.mood) items.push({ key: 'mood', icon: '♥', iconClass: 'pink', text: d.mood })
  if (d.weather) {
    items.push({ key: 'weather', icon: weatherIconFor(d.weather), iconClass: 'sun', text: d.weather })
  }
  if (d.locationName) items.push({ key: 'loc', icon: '●', iconClass: 'purple', text: d.locationName })
  return items
})

const showExpandToggle = computed(() => (diary.currentDiary?.content || '').length > 96)

const authorLabel = computed(() => {
  const name = diary.currentAuthor?.nickname
  if (name === '我' || name === 'Ta') return name
  return diary.currentDiary?.userId === 'u_me' ? '我' : 'Ta'
})

const publishTime = computed(() =>
  formatDiaryTime(diary.currentDiary?.createdAt)
)

function videoCover(video) {
  return resolveVideoPoster(video.coverUrl, video.url)
}

function onPickDate(e) {
  const date = e.detail.value
  if (date) diary.selectDate(date > todayYmd ? todayYmd : date)
}

function onSelectDate(ymd) {
  expanded.value = false
  diary.selectDate(ymd)
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

function onHistoryMediaTap({ item, index }) {
  const media = item?.media?.[index]
  if (!media) return
  if (media.type === 'video') {
    playHistoryVideo(media)
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

function playHistoryVideo(media) {
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

function openPublish() {
  const id = diary.currentDiary?.id || ''
  const date = selectedDate.value || ''
  let url = `/pages/diary/edit?date=${encodeURIComponent(date)}`
  if (id) url += `&id=${encodeURIComponent(id)}`
  uni.navigateTo({ url })
}

function openTimelineItem(item) {
  if (item?.id) {
    expanded.value = false
    void diary.fetchDiaryById(item.id)
    return
  }
  const date = item?.eventDate || item?.date
  if (date) {
    expanded.value = false
    void diary.selectDate(date)
  }
}

function editTimelineItem(item) {
  if (!item?.id) return
  const date = item.eventDate || selectedDate.value || ''
  let url = `/pages/diary/edit?id=${encodeURIComponent(item.id)}`
  if (date) url += `&date=${encodeURIComponent(date)}`
  uni.navigateTo({ url })
}

async function deleteTimelineItem(item) {
  if (!item?.id) return
  const res = await new Promise((resolve) => {
    uni.showModal({
      title: '删除日记',
      content: '删除后无法恢复，确定要删除这篇心动日记吗？',
      confirmColor: '#f05b99',
      success: resolve,
      fail: () => resolve({ confirm: false })
    })
  })
  if (!res?.confirm) return
  try {
    expanded.value = false
    await diary.deleteDiary(item.id, { date: item.eventDate || item.date })
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch {
    uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
  }
}

function closeTimelineMenu() {
  timelineMenuVisible.value = false
  activeTimelineItem.value = null
}

function onTimelineCardAction(item) {
  if (!item?.id) return
  activeTimelineItem.value = item
  timelineMenuVisible.value = true
}

function onTimelineMenuEdit() {
  const item = activeTimelineItem.value
  closeTimelineMenu()
  if (!item) return
  editTimelineItem(item)
}

function onTimelineMenuDelete() {
  const item = activeTimelineItem.value
  closeTimelineMenu()
  if (!item) return
  void deleteTimelineItem(item)
}

onShow(async () => {
  if (pendingDiaryId) {
    const id = pendingDiaryId
    pendingDiaryId = ''
    pendingDate = ''
    const auth = useAuthStore()
    await auth.ensureLogin()
    await diary.fetchDiaryById(id, { skipAuth: true })
    void diary.fetchTimeline(10, 1, { skipAuth: true })
    return
  }
  if (pendingDate) {
    const date = pendingDate
    pendingDate = ''
    await diary.selectDate(date)
    void diary.fetchTimeline(10, 1)
    return
  }
  await diary.initPage()
})
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.nav-calendar {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-calendar-icon {
  width: 28rpx;
  height: 28rpx;
}

.glass-card {
  @include apple-liquid-card;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 246, 252, 0.8)),
    rgba(255, 255, 255, 0.74);
  box-shadow: 0 10rpx 26rpx rgba(140, 108, 152, 0.06), inset 0 1rpx 0 rgba(255, 255, 255, 0.76);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
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
  @include jelly-primary-button;
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

.media-img,
.media-video {
  width: 100%;
  height: 100%;
}

.media-video {
  display: block;
  pointer-events: none;
}

.media-cell--video .media-video-ph {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, rgba(255, 214, 232, 0.68), rgba(253, 247, 255, 0.62));
}

.video-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 252, 0.86)),
    rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(255, 255, 255, 0.96);
  box-shadow:
    0 10rpx 22rpx rgba(130, 88, 145, 0.13),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16rpx);
  -webkit-backdrop-filter: blur(16rpx);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-play-triangle {
  width: 0;
  height: 0;
  margin-left: 4rpx;
  border-top: 11rpx solid transparent;
  border-bottom: 11rpx solid transparent;
  border-left: 17rpx solid #f28bb3;
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
  @include liquid-secondary-button;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.84), rgba(255, 241, 247, 0.72));
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
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

.history-block {
  margin-bottom: 24rpx;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.history-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #4a3d52;
}

.timeline-list--diary {
  margin-top: 0;
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
  max-width: 420rpx;
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

.scroll-bottom-spacer {
  height: 220rpx;
}

.diary-fab {
  position: fixed;
  right: 28rpx;
  bottom: calc(148rpx + env(safe-area-inset-bottom));
  z-index: 22;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $jelly-gradient;
  box-shadow:
    0 20rpx 60rpx rgba(255, 143, 177, 0.22),
    inset 0 2rpx rgba(255, 255, 255, 0.65);
  border: 2rpx solid rgba(255, 255, 255, 0.65);
}

.diary-fab-icon {
  color: #fff;
  font-size: 44rpx;
  line-height: 1;
  font-weight: 700;
}

.timeline-menu-root {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: flex-end;
}

.timeline-menu-mask {
  position: absolute;
  inset: 0;
  background: rgba(43, 31, 50, 0.22);
}

.timeline-menu-sheet {
  position: relative;
  width: 100%;
  padding: 18rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 36rpx 36rpx 0 0;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 245, 250, 0.88)),
    rgba(255, 255, 255, 0.88);
  box-shadow: 0 -18rpx 48rpx rgba(126, 86, 141, 0.1), inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
}

.timeline-menu-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 20rpx;
  border-radius: 999rpx;
  background: rgba(171, 143, 182, 0.28);
}

.timeline-menu-title {
  display: block;
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;
  color: #4a3d52;
}

.timeline-menu-subtitle {
  display: block;
  margin-top: 10rpx;
  padding: 0 24rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.45;
  color: #9b8c9f;
}

.timeline-menu-list {
  margin-top: 26rpx;
  padding: 8rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.68);
}

.timeline-menu-item {
  width: 100%;
  min-height: 92rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 22rpx;
  color: #4a3d52;
  font-size: 28rpx;
  font-weight: 650;
}

.timeline-menu-item + .timeline-menu-item {
  margin-top: 8rpx;
}

.timeline-menu-item__icon {
  width: 36rpx;
  text-align: center;
  font-size: 30rpx;
  color: #b99cff;
}

.timeline-menu-item__label {
  flex: 1;
  text-align: left;
}

.timeline-menu-item--danger {
  color: #ef5c94;
  background: rgba(255, 240, 246, 0.78);
}

.timeline-menu-item--danger .timeline-menu-item__icon {
  color: #ef5c94;
}

.timeline-menu-cancel {
  width: 100%;
  height: 92rpx;
  margin-top: 16rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.82);
  color: #6f5d73;
  font-size: 28rpx;
  font-weight: 700;
}

.tap-scale:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
