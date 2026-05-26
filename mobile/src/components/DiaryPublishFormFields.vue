<template>
  <view class="publish-form-fields">
    <view class="form-card form-card--text">
      <view class="card-title-row">
        <text class="card-title-icon">💕</text>
        <text class="card-title">心动文字</text>
      </view>
      <view class="textarea-shell">
        <textarea
          v-model="form.content"
          class="field-textarea"
          placeholder="写下今天的心动瞬间吧..."
          maxlength="500"
          :show-confirm-bar="false"
        />
        <text class="text-card-feather">🪶</text>
        <text class="text-card-count">{{ contentLength }}/500</text>
      </view>
    </view>

    <view class="form-card form-card--media">
      <view class="section-head">
        <view class="card-title-row section-title-row">
          <text class="card-title-icon">🖼️</text>
          <text class="card-title">照片与视频</text>
        </view>
        <view v-if="imageCount < 9" class="batch-btn tap-scale" @tap="pickImages">
          <text class="batch-icon">▦</text>
          <text>批量选择</text>
        </view>
      </view>

      <view class="media-actions">
        <view v-if="imageCount < 9" class="media-glass tap-scale" @tap="pickImages">
          <view class="media-add-icon">
            <text>🖼️</text>
          </view>
          <text class="media-glass-label">添加照片</text>
        </view>
        <view v-if="!hasVideo" class="media-glass media-glass--video tap-scale" @tap="pickVideo">
          <view class="media-add-icon">
            <text>🎥</text>
          </view>
          <text class="media-glass-label">添加视频</text>
        </view>
      </view>

      <view v-if="mediaPreview.length" class="media-row">
        <view v-for="(item, index) in mediaPreview" :key="item.key" class="media-cell">
          <image v-if="item.type === 'image'" class="media-img" :src="item.preview" mode="aspectFill" />
          <view v-else class="media-video-ph">
            <image v-if="item.preview" class="media-img" :src="item.preview" mode="aspectFill" />
            <text class="video-badge">▶</text>
            <text v-if="item.duration" class="video-dur">{{ formatVideoDuration(item.duration) }}</text>
          </view>
          <text class="media-remove tap-scale" @tap.stop="removeMedia(index)">×</text>
        </view>
      </view>
    </view>

    <view class="form-card form-card--picker">
      <view class="card-title-row">
        <text class="card-title-icon">💗</text>
        <text class="card-title">心情</text>
      </view>
      <DiaryIconPicker v-model="form.mood" :options="moodOptions" variant="premium" />
    </view>

    <view class="form-card form-card--picker">
      <view class="card-title-row">
        <text class="card-title-icon">☁️</text>
        <text class="card-title">天气</text>
      </view>
      <DiaryIconPicker v-model="form.weather" :options="weatherOptions" variant="premium" />
    </view>

    <view class="meta-grid">
      <view class="form-card form-card--meta">
        <view class="card-title-row">
          <text class="card-title-icon">📍</text>
          <text class="card-title">位置</text>
        </view>
        <view :class="['location-box tap-scale', { 'location-box--active': !!form.locationName }]" @tap="onLocationTap">
          <view class="location-texts">
            <text class="location-title">{{ locationTitle }}</text>
            <text class="location-sub">{{ locationSub }}</text>
          </view>
          <text v-if="form.locationName" class="location-clear" @tap.stop="clearLocationTap">清除</text>
          <text v-else class="location-arrow">›</text>
        </view>
      </view>

      <view class="form-card form-card--meta">
        <view class="card-title-row">
          <text class="card-title-icon">👁️</text>
          <text class="card-title">可见范围</text>
        </view>
        <view class="visibility-row">
          <view
            :class="['visibility-btn tap-scale', { active: form.visibility === 'both' }]"
            @tap="setVisibility('both')"
          >
            <text class="visibility-icon">💗</text>
            <text class="visibility-text">双方可见</text>
          </view>
          <view
            :class="['visibility-btn tap-scale', { active: form.visibility === 'self' }]"
            @tap="setVisibility('self')"
          >
            <text class="visibility-icon">🔒</text>
            <text class="visibility-text">仅自己可见</text>
          </view>
        </view>
      </view>
    </view>

    <picker mode="date" :value="form.diaryDate" @change="onDateChange">
      <view class="form-card form-card--date tap-scale">
        <view class="card-title-row">
          <text class="card-title-icon">🗓️</text>
          <text class="card-title">记录日期</text>
        </view>
        <view class="date-input">
          <text class="date-glass-value">{{ form.diaryDate }}</text>
          <text class="date-glass-arrow">›</text>
        </view>
      </view>
    </picker>

    <view class="privacy-note">
      <text>🔒 所有内容仅情侣双方可见，请放心记录 💕</text>
    </view>

    <view class="sheet-foot">
      <button class="save-btn tap-scale" :disabled="diary.submitting" @tap="$emit('submit')">
        <view class="save-btn-shine" />
        <text class="save-btn-text">{{ diary.submitting ? '发布中...' : isEdit ? '保存修改' : '发布心动日记' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, inject } from 'vue'
import DiaryIconPicker from './DiaryIconPicker.vue'

defineProps({
  layout: { type: String, default: 'page' }
})

defineEmits(['submit'])

const {
  diary,
  isEdit,
  chooseMapLocation,
  setLocationMode,
  form,
  mediaPreview,
  imageCount,
  hasVideo,
  moodOptions,
  weatherOptions,
  onDateChange,
  pickImages,
  pickVideo,
  removeMedia,
  formatVideoDuration
} = inject('diaryPublishForm')

const contentLength = computed(() => (form.content || '').length)

const locationTitle = computed(() =>
  form.locationName ? truncate(form.locationName, 8) : '添加位置'
)

const locationSub = computed(() =>
  form.locationName ? '点击可重新选点' : '记录当下的你们所处之地'
)

function truncate(str, max) {
  if (!str || str.length <= max) return str
  return `${str.slice(0, max)}...`
}

function onLocationTap() {
  chooseMapLocation()
}

function clearLocationTap() {
  setLocationMode('none')
}

function setVisibility(value) {
  form.visibility = value
}
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as *;

.publish-form-fields {
  position: relative;
  z-index: 1;
  padding-bottom: calc(148rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.form-card {
  margin-bottom: 24rpx;
  padding: 28rpx 24rpx;
  box-sizing: border-box;
  @include apple-liquid-card;
}

.card-title-row,
.section-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.card-title-row {
  margin-bottom: 22rpx;
}

.section-head {
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-title-row {
  margin-bottom: 0;
}

.card-title-icon {
  font-size: 28rpx;
  line-height: 1;
}

.card-title {
  color: #23222a;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.2;
}

.textarea-shell {
  position: relative;
  min-height: 222rpx;
  padding: 18rpx 18rpx 14rpx;
  box-sizing: border-box;
  @include apple-liquid-input;
}

.field-textarea {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 176rpx;
  padding: 10rpx 92rpx 46rpx 12rpx;
  box-sizing: border-box;
  color: #33313a;
  font-size: 29rpx;
  line-height: 1.58;
  background: transparent;
}

.text-card-feather {
  position: absolute;
  right: 42rpx;
  bottom: 36rpx;
  font-size: 52rpx;
  opacity: 0.25;
  pointer-events: none;
}

.text-card-count {
  position: absolute;
  right: 24rpx;
  bottom: 16rpx;
  z-index: 2;
  color: #6f6b73;
  font-size: 22rpx;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.batch-btn {
  height: 48rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  @include liquid-secondary-button;
  font-size: 22rpx;
}

.batch-icon {
  color: #c299ad;
  font-size: 22rpx;
}

.media-actions {
  display: flex;
  gap: 24rpx;
}

.media-glass {
  width: 178rpx;
  height: 156rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  @include apple-liquid-input;
  border-radius: 32rpx;
}

.media-glass--video {
  border-color: rgba(255, 255, 255, 0.62);
}

.media-add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
  font-size: 46rpx;
  line-height: 1;
}

.media-glass-label {
  color: #7c737d;
  font-size: 25rpx;
  line-height: 1.2;
}

.media-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 20rpx;
}

.media-cell {
  width: 124rpx;
  height: 124rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(140, 105, 130, 0.1);
}

.media-img {
  width: 100%;
  height: 100%;
}

.media-video-ph {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f5dce8, #e8dcf5);
}

.video-badge {
  color: #e892b8;
  font-size: 32rpx;
}

.video-dur {
  margin-top: 8rpx;
  color: #9f90a8;
  font-size: 20rpx;
}

.media-remove {
  position: absolute;
  top: 6rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(60, 45, 55, 0.5);
  color: #fff;
  font-size: 30rpx;
  line-height: 40rpx;
  text-align: center;
}

.form-card--picker {
  padding-bottom: 20rpx;
}

.meta-grid {
  display: flex;
  gap: 18rpx;
}

.form-card--meta {
  flex: 1;
  min-width: 0;
  padding: 24rpx 22rpx 20rpx;
}

.form-card--meta .card-title-row,
.form-card--date .card-title-row {
  margin-bottom: 16rpx;
}

.location-box {
  min-height: 74rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 18rpx;
  box-sizing: border-box;
  @include apple-liquid-input;
  border-radius: 32rpx;
}

.location-texts {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.location-title {
  color: #d33678;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 1.15;
}

.location-sub {
  color: #8b858e;
  font-size: 21rpx;
  line-height: 1.2;
}

.location-arrow {
  flex-shrink: 0;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.46);
  color: #8d818d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  line-height: 36rpx;
}

.location-clear {
  flex-shrink: 0;
  color: #e35e96;
  font-size: 22rpx;
}

.visibility-row {
  display: flex;
  gap: 12rpx;
}

.visibility-btn {
  flex: 1;
  min-height: 82rpx;
  padding: 10rpx 8rpx;
  box-sizing: border-box;
  @include liquid-secondary-button;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7rpx;
}

.visibility-btn.active {
  @include jelly-primary-button;
}

.visibility-icon {
  font-size: 24rpx;
}

.visibility-text {
  color: #8a848d;
  font-size: 22rpx;
  line-height: 1.15;
}

.visibility-btn.active .visibility-text {
  color: #fff;
  font-weight: 800;
}

.form-card--date {
  padding-bottom: 20rpx;
}

.date-input {
  height: 54rpx;
  padding: 0 2rpx 0 28rpx;
  @include apple-liquid-input;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-glass-value {
  color: #26242b;
  font-size: 28rpx;
  font-variant-numeric: tabular-nums;
}

.date-glass-arrow {
  width: 52rpx;
  color: #4a454d;
  font-size: 42rpx;
  line-height: 1;
  text-align: center;
}

.privacy-note {
  margin-top: -8rpx;
  padding-bottom: 6rpx;
  color: #b39aa8;
  font-size: 22rpx;
  line-height: 1.4;
  text-align: center;
}

.sheet-foot {
  position: fixed;
  left: 28rpx;
  right: 28rpx;
  bottom: calc(18rpx + env(safe-area-inset-bottom));
  z-index: 50;
}

.save-btn {
  position: relative;
  width: 100%;
  height: 92rpx;
  border: none;
  overflow: hidden;
  @include jelly-primary-button;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn::after {
  border: none;
}

.save-btn-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
  pointer-events: none;
}

.save-btn-text {
  position: relative;
  z-index: 1;
  color: #fff;
  font-size: 31rpx;
  font-weight: 800;
  letter-spacing: 0;
  text-shadow: 0 2rpx 8rpx rgba(180, 80, 120, 0.2);
}

.tap-scale:active {
  opacity: 0.88;
}
</style>
