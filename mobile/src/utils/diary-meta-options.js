/** 心情 / 天气选项（value 与后端存储一致） */
export const MOOD_OPTIONS = [
  { value: '很幸福', icon: '🥰', label: '很幸福' },
  { value: '开心', icon: '😊', label: '开心' },
  { value: '想念', icon: '🥺', label: '想念' },
  { value: '平静', icon: '😌', label: '平静' },
  { value: '委屈', icon: '😢', label: '委屈' },
  { value: '难过', icon: '😭', label: '难过' }
]

export const WEATHER_OPTIONS = [
  { value: '晴', icon: '☀️', label: '晴' },
  { value: '多云', icon: '⛅', label: '多云' },
  { value: '阴', icon: '☁️', label: '阴' },
  { value: '雨', icon: '🌧️', label: '雨' },
  { value: '雪', icon: '❄️', label: '雪' }
]

export const LOCATION_MODE_OPTIONS = [
  { value: 'none', icon: '—', label: '不显示' },
  { value: 'map', icon: '📍', label: '地图' }
]

export function moodIconFor(value) {
  return MOOD_OPTIONS.find((o) => o.value === value)?.icon || '💗'
}

export function weatherIconFor(value) {
  return WEATHER_OPTIONS.find((o) => o.value === value)?.icon || '☀️'
}
