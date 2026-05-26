import { computed, reactive, ref } from 'vue'
import { useDiaryStore } from '../stores/diary'
import { useAuthStore } from '../stores/auth'
import diaryApi from '../services/diary'
import { formatYmd, formatVideoDuration } from '../utils/diary-date'
import {
  MOOD_OPTIONS,
  WEATHER_OPTIONS,
  LOCATION_MODE_OPTIONS
} from '../utils/diary-meta-options'
import { resolveMediaUrl, uploadFile } from '../services/request'
import { resolveVideoPoster } from '../utils/media-display'

export function useDiaryPublishForm() {
  const diary = useDiaryStore()
  const auth = useAuthStore()
  const diaryId = ref('')
  const isEdit = ref(false)
  const locationMode = ref('none')

  const moodOptions = MOOD_OPTIONS
  const weatherOptions = WEATHER_OPTIONS
  const locationModeOptions = LOCATION_MODE_OPTIONS

  const form = reactive({
    content: '',
    mood: '很幸福',
    weather: '晴',
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
      preview:
        m.type === 'image'
          ? resolveMediaUrl(m.url)
          : resolveVideoPoster(m.coverUrl || m.localCoverUrl, m.url),
      duration: m.duration
    }))
  )

  const imageCount = computed(() => form.mediaList.filter((m) => m.type === 'image').length)
  const hasVideo = computed(() => form.mediaList.some((m) => m.type === 'video'))

  function resetForm(date = formatYmd(new Date())) {
    diaryId.value = ''
    isEdit.value = false
    locationMode.value = 'none'
    form.content = ''
    form.mood = '很幸福'
    form.weather = '晴'
    form.locationName = ''
    form.locationLat = null
    form.locationLng = null
    form.visibility = 'both'
    form.diaryDate = date
    form.needAiSummary = true
    form.mediaList = []
  }

  function onDateChange(e) {
    form.diaryDate = e.detail.value
  }

  function onAiSwitch(e) {
    form.needAiSummary = Boolean(e.detail.value)
  }

  function clearLocation() {
    form.locationName = ''
    form.locationLat = null
    form.locationLng = null
  }

  /** 使用 wx.chooseLocation，无需 getLocation（类目只需开通「地图选点」） */
  function chooseMapLocation() {
    uni.chooseLocation({
      success(res) {
        locationMode.value = 'map'
        const name = (res.name || '').trim()
        const address = (res.address || '').trim()
        form.locationName = name || address || '已选位置'
        form.locationLat = res.latitude
        form.locationLng = res.longitude
      },
      fail(err) {
        const msg = String(err?.errMsg || err?.message || '')
        if (/cancel/i.test(msg)) return
        if (/auth|deny|permission|privacy|banned|not support|不支持/i.test(msg)) {
          uni.showModal({
            title: '无法打开地图选点',
            content:
              '请在微信公众平台 → 开发管理 → 接口设置 开通「打开地图选择位置」(chooseLocation)。',
            showCancel: false
          })
          locationMode.value = 'none'
          return
        }
        uni.showToast({ title: '选点失败，请重试', icon: 'none' })
        locationMode.value = 'none'
      }
    })
  }

  function setLocationMode(mode) {
    if (mode === 'none') {
      locationMode.value = 'none'
      clearLocation()
      return
    }
    if (mode === 'map') {
      chooseMapLocation()
    }
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
          let coverUrl = ''
          const thumb = res.thumbTempFilePath || res.thumbTempFile
          if (thumb) {
            try {
              const coverData = await uploadFile('/upload/image', thumb)
              coverUrl = coverData.url || ''
            } catch {
              /* 封面失败仍保存视频 */
            }
          }
          form.mediaList.push({
            type: 'video',
            url: data.url,
            coverUrl: coverUrl || data.coverUrl || '',
            localCoverUrl: thumb || '',
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
    form.locationName = d.locationName || ''
    form.locationLat = d.locationLat ?? null
    form.locationLng = d.locationLng ?? null
    form.visibility = d.visibility || 'both'
    form.diaryDate = d.diaryDate
    form.mediaList = (data.mediaList || []).map((m) => ({
      type: m.type,
      url: m.url,
      coverUrl: m.coverUrl,
      localCoverUrl: '',
      duration: m.duration
    }))
    locationMode.value = form.locationName ? 'map' : 'none'
  }

  async function prepareOpen({ date, id } = {}) {
    if (id) {
      await auth.ensureLogin()
      await loadDiary(id)
      return
    }
    resetForm(date || formatYmd(new Date()))
  }

  async function submit() {
    const text = form.content.trim()
    if (!text && !form.mediaList.length) {
      uni.showToast({ title: '写点文字或添加照片吧', icon: 'none' })
      return false
    }
    if (text.length > 500) {
      uni.showToast({ title: '文字最多 500 字', icon: 'none' })
      return false
    }
    const payload = {
      content: text,
      mood: form.mood,
      weather: form.weather,
      temperature: '',
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
      return true
    } catch {
      uni.showToast({ title: '发布失败，请检查网络', icon: 'none' })
      return false
    }
  }

  return {
    diary,
    diaryId,
    isEdit,
    locationMode,
    moodOptions,
    weatherOptions,
    locationModeOptions,
    chooseMapLocation,
    form,
    mediaPreview,
    imageCount,
    hasVideo,
    resetForm,
    prepareOpen,
    onDateChange,
    onAiSwitch,
    setLocationMode,
    pickImages,
    pickVideo,
    removeMedia,
    loadDiary,
    submit,
    formatVideoDuration
  }
}
