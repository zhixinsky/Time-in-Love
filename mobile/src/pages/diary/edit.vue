<template>
  <view class="safe-page edit-page">
    <CloudImage image-class="edit-bg" :file-id="CLOUD_LOVE_BG" mode="widthFix" />

    <view class="app-nav edit-nav">
      <view class="app-nav__main">
        <view class="app-nav__back tap-scale" @tap="goBack">
          <text>‹</text>
        </view>
        <view class="app-nav__copy">
          <text class="app-nav__title">{{ isEdit ? '编辑心动日记' : '记录心动瞬间' }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="edit-scroll" scroll-y enable-flex :show-scrollbar="false" enhanced>
      <view class="glass-card edit-card">
        <text class="field-label">心动文字</text>
        <textarea
          v-model="form.content"
          class="field-textarea"
          placeholder="写下今天的心动瞬间吧..."
          maxlength="1000"
          :show-confirm-bar="false"
        />

        <text class="field-label">照片与视频</text>
        <view class="media-row">
          <view v-for="(item, index) in mediaPreview" :key="item.key" class="media-cell">
            <image
              v-if="item.type === 'image'"
              class="media-img"
              :src="item.preview"
              mode="aspectFill"
            />
            <view v-else class="media-video-ph">
              <text class="video-badge">▶</text>
              <text v-if="item.duration" class="video-dur">
                {{ formatVideoDuration(item.duration) }}
              </text>
            </view>
            <text class="media-remove tap-scale" @tap.stop="removeMedia(index)">×</text>
          </view>
          <view
            v-if="imageCount < 9"
            class="media-add tap-scale"
            @tap="pickImages"
          >
            <text>图</text>
          </view>
          <view
            v-if="!hasVideo"
            class="media-add media-add--video tap-scale"
            @tap="pickVideo"
          >
            <text>视频</text>
          </view>
        </view>

        <text class="field-label">心情</text>
        <view class="chip-row">
          <view
            v-for="item in moodOptions"
            :key="item"
            :class="['chip', { active: form.mood === item }]"
            @tap="form.mood = item"
          >
            <text>{{ item }}</text>
          </view>
          <view
            :class="['chip', { active: customMood }]"
            @tap="pickCustomMood"
          >
            <text>自定义</text>
          </view>
        </view>

        <text class="field-label">天气</text>
        <view class="chip-row">
          <view
            v-for="item in weatherOptions"
            :key="item"
            :class="['chip', { active: form.weather === item }]"
            @tap="form.weather = item"
          >
            <text>{{ item }}</text>
          </view>
        </view>
        <input
          v-model="form.temperature"
          class="field-input"
          placeholder="温度，如 26℃"
        />

        <text class="field-label">位置</text>
        <view class="chip-row">
          <view
            v-for="item in locationModes"
            :key="item.value"
            :class="['chip', { active: locationMode === item.value }]"
            @tap="setLocationMode(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
        <input
          v-if="locationMode === 'custom'"
          v-model="form.locationName"
          class="field-input"
          placeholder="输入地点名称"
        />

        <text class="field-label">可见范围</text>
        <view class="chip-row">
          <view
            :class="['chip', { active: form.visibility === 'both' }]"
            @tap="form.visibility = 'both'"
          >
            <text>双方可见</text>
          </view>
          <view
            :class="['chip', { active: form.visibility === 'self' }]"
            @tap="form.visibility = 'self'"
          >
            <text>仅自己可见</text>
          </view>
        </view>

        <text class="field-label">记录日期</text>
        <picker mode="date" :value="form.diaryDate" @change="onDateChange">
          <view class="field-picker">
            <text>{{ form.diaryDate }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>

        <view class="switch-row">
          <text class="switch-label">发布后生成 AI 小记</text>
          <switch :checked="form.needAiSummary" color="#FF82AE" @change="onAiSwitch" />
        </view>
      </view>
      <view class="scroll-bottom-spacer" />
    </scroll-view>

    <view class="bottom-bar">
      <button class="save-btn tap-scale" :disabled="diary.submitting" @tap="submit">
        {{ diary.submitting ? '发布中…' : '发布心动日记' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useDiaryStore } from '../../stores/diary'
import { useAuthStore } from '../../stores/auth'
import CloudImage from '../../components/CloudImage.vue'
import { CLOUD_LOVE_BG } from '../../config'

import diaryApi from '../../services/diary'
import { formatYmd, formatVideoDuration } from '../../utils/diary-date'
import { resolveMediaUrl, uploadFile } from '../../services/request'

const diary = useDiaryStore()
const auth = useAuthStore()
const diaryId = ref('')
const isEdit = ref(false)
const locationMode = ref('none')
const customMood = ref(false)

const moodOptions = ['很幸福', '开心', '想念', '平静', '委屈', '难过']
const weatherOptions = ['晴', '多云', '阴', '雨', '雪']
const locationModes = [
  { value: 'none', label: '不显示' },
  { value: 'current', label: '当前位置' },
  { value: 'custom', label: '手动输入' }
]

const form = reactive({
  content: '',
  mood: '很幸福',
  weather: '晴',
  temperature: '',
  locationName: '',
  locationLat: null,
  locationLng: null,
  visibility: 'both',
  diaryDate: formatYmd(new Date()),
  needAiSummary: true,
  mediaList: []
})

const mediaPreview = computed(() =>
  form.mediaList.map((m, i) => ({
    key: `${m.type}-${i}`,
    type: m.type,
    preview: m.type === 'image' ? resolveMediaUrl(m.url) : resolveMediaUrl(m.coverUrl || m.url),
    duration: m.duration
  }))
)

const imageCount = computed(() => form.mediaList.filter((m) => m.type === 'image').length)
const hasVideo = computed(() => form.mediaList.some((m) => m.type === 'video'))

function goBack() {
  uni.navigateBack()
}

function onDateChange(e) {
  form.diaryDate = e.detail.value
}

function onAiSwitch(e) {
  form.needAiSummary = Boolean(e.detail.value)
}

function setLocationMode(mode) {
  locationMode.value = mode
  if (mode === 'none') {
    form.locationName = ''
    form.locationLat = null
    form.locationLng = null
  } else if (mode === 'current') {
    uni.getLocation({
      type: 'gcj02',
      success(res) {
        form.locationLat = res.latitude
        form.locationLng = res.longitude
        form.locationName = form.locationName || '当前位置'
      },
      fail() {
        uni.showToast({ title: '获取位置失败', icon: 'none' })
      }
    })
  }
}

function pickCustomMood() {
  uni.showModal({
    title: '自定义心情',
    editable: true,
    placeholderText: '输入你的心情',
    success(res) {
      if (res.confirm && res.content) {
        form.mood = res.content.trim()
        customMood.value = true
      }
    }
  })
}

function pickImages() {
  const remain = 9 - imageCount.value
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    success: async (res) => {
      await auth.ensureLogin()
      for (const path of res.tempFilePaths) {
        try {
          uni.showLoading({ title: '上传中' })
          const data = await uploadFile('/upload/image', path)
          form.mediaList.push({ type: 'image', url: data.url })
        } catch {
          uni.showToast({ title: '图片上传失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function pickVideo() {
  uni.chooseVideo({
    maxDuration: 60,
    compressed: true,
    success: async (res) => {
      await auth.ensureLogin()
      try {
        uni.showLoading({ title: '上传中' })
        const data = await uploadFile('/upload/video', res.tempFilePath, {
          duration: String(Math.floor(res.duration || 0))
        })
        form.mediaList.push({
          type: 'video',
          url: data.url,
          coverUrl: data.coverUrl || data.url,
          duration: data.duration || Math.floor(res.duration || 0)
        })
      } catch {
        uni.showToast({ title: '视频上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

function removeMedia(index) {
  form.mediaList.splice(index, 1)
}

async function loadDiary(id) {
  const data = await diaryApi.getDetail(id)
  const d = data.diary
  diaryId.value = d.id
  isEdit.value = true
  form.content = d.content || ''
  form.mood = d.mood || '很幸福'
  form.weather = d.weather || '晴'
  form.temperature = d.temperature || ''
  form.locationName = d.locationName || ''
  form.visibility = d.visibility || 'both'
  form.diaryDate = d.diaryDate
  form.mediaList = (data.mediaList || []).map((m) => ({
    type: m.type,
    url: m.url,
    coverUrl: m.coverUrl,
    duration: m.duration
  }))
  if (form.locationName) locationMode.value = 'custom'
}

async function submit() {
  if (!form.content.trim() && !form.mediaList.length) {
    uni.showToast({ title: '写点文字或添加照片吧', icon: 'none' })
    return
  }
  const payload = {
    content: form.content.trim(),
    mood: form.mood,
    weather: form.weather,
    temperature: form.temperature,
    locationName: locationMode.value === 'none' ? '' : form.locationName,
    locationLat: form.locationLat,
    locationLng: form.locationLng,
    visibility: form.visibility,
    diaryDate: form.diaryDate,
    needAiSummary: form.needAiSummary,
    mediaList: form.mediaList
  }
  try {
    if (isEdit.value && diaryId.value) {
      await diary.updateDiary(diaryId.value, payload)
    } else {
      await diary.createDiary(payload)
    }
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 400)
  } catch {
    uni.showToast({ title: '发布失败，请检查网络', icon: 'none' })
  }
}

onLoad((query) => {
  if (query?.date) form.diaryDate = query.date
  if (query?.id) loadDiary(query.id)
})
</script>

<style lang="scss" scoped>
.edit-page {
  position: relative;
  min-height: 100vh;
}

.edit-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
}

.edit-nav {
  margin: 0;
}

.edit-scroll {
  position: relative;
  z-index: 5;
  height: calc(100vh - 212rpx);
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-card {
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12rpx 40rpx rgba(255, 170, 210, 0.12);
}

.edit-card {
  padding: 28rpx;
  margin-top: 12rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #4a3d52;
  margin: 20rpx 0 12rpx;
}

.field-label:first-child {
  margin-top: 0;
}

.field-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.55);
  font-size: 28rpx;
  color: #6f5d73;
  line-height: 1.6;
}

.field-input {
  width: 100%;
  padding: 18rpx 20rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.55);
  font-size: 28rpx;
  color: #6f5d73;
}

.field-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.55);
  font-size: 28rpx;
  color: #6f5d73;
}

.picker-arrow {
  color: #b99cff;
}

.media-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.media-cell {
  width: 160rpx;
  height: 160rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  background: rgba(255, 220, 235, 0.4);
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
  background: linear-gradient(145deg, #ffd6e8, #e8d4ff);
}

.video-badge {
  font-size: 36rpx;
  color: #ff82ae;
}

.video-dur {
  font-size: 20rpx;
  color: #7b6c85;
  margin-top: 8rpx;
}

.media-remove {
  position: absolute;
  top: 4rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  text-align: center;
  line-height: 40rpx;
  font-size: 32rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
}

.media-add {
  width: 160rpx;
  height: 160rpx;
  border-radius: 18rpx;
  border: 2rpx dashed rgba(255, 130, 174, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #ff82ae;
  background: rgba(255, 255, 255, 0.4);
}

.media-add--video {
  color: #b99cff;
  border-color: rgba(185, 156, 255, 0.45);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.chip {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid rgba(255, 200, 220, 0.5);
  font-size: 24rpx;
  color: #7b6c85;
}

.chip.active {
  background: linear-gradient(135deg, #ff9ac4, #ff82ae);
  color: #fff;
  border-color: transparent;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(230, 210, 225, 0.4);
}

.switch-label {
  font-size: 26rpx;
  color: #4a3d52;
}

.scroll-bottom-spacer {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  justify-content: center;
  padding: 0 24rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #ff9ac4, #ff82ae);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 40rpx rgba(255, 130, 174, 0.35);
}

.tap-scale:active {
  transform: scale(0.98);
}
</style>
