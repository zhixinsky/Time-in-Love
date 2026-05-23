import { onAppHide, onAppShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { CLOUD_LOVE_BG } from '../config'
import { DEFAULT_LOVE_MUSIC, musicApi } from '../services/music'

function readSession(key) {
  return uni.getStorageSync(key)
}

function writeSession(key, value) {
  return uni.setStorageSync(key, value)
}

function clearSession(key) {
  return uni.removeStorageSync(key)
}

function showMusicToast(options) {
  return uni.showToast(options)
}

function onMusicEvent(name, handler) {
  return uni.$on(name, handler)
}

const SESSION_KEY = 'loveMusicSession'

let manager = null
let playlist = []
let currentIndex = -1
let currentItem = null
let userWantsPlay = true
let saveTimer = null
let cachedOfficialCurrentTime = 0
let pendingSeekAfterLoad = 0
let appInBackground = false
let leavingPage = false
let pageHideDeferTimer = null
let lastPersistAt = 0
let lifecycleBound = false
let resumeInflight = null
let resumeDebounceTimer = null
/** 当前曲目 cloud://（bgm.src 可能被微信改成内部 URL，不能用来判断是否同一首） */
let activeLogicalSrc = ''

const musicControlsVisible = ref(false)
const isMusicPlaying = ref(false)

function getManagerCurrentTime(bgm) {
  const m = bgm || manager
  if (m?.src) {
    const official = Number(m.currentTime)
    if (Number.isFinite(official) && official > 0) {
      cachedOfficialCurrentTime = official
      return official
    }
  }
  return Math.max(0, cachedOfficialCurrentTime)
}

function getPersistedPlayTime(bgm) {
  const official = bgm?.src ? Number(bgm.currentTime) : NaN
  if (Number.isFinite(official) && official > 0) {
    cachedOfficialCurrentTime = official
    return official
  }
  return Math.max(0, cachedOfficialCurrentTime)
}

function sessionSrc() {
  return currentItem?.src || ''
}

function persistPlayPositionNow() {
  const bgm = manager
  const src = sessionSrc()
  const currentTime = getPersistedPlayTime(bgm)
  if (!src || currentTime <= 0) return
  const prev = readSession(SESSION_KEY)
  const shouldResume = userWantsPlay
  writeSession(SESSION_KEY, {
    ...prev,
    src,
    currentTime,
    musicEnabled: true,
    wasPlaying: shouldResume,
    shouldResume
  })
}

function saveSession({ resumeOnReturn = false } = {}) {
  const bgm = manager
  const src = sessionSrc()
  if (!src) {
    clearSession(SESSION_KEY)
    return
  }
  const currentTime = getPersistedPlayTime(bgm)
  const paused = bgm?.paused ?? !isMusicPlaying.value
  const keepResume =
    resumeOnReturn || leavingPage || appInBackground
  const shouldResume = userWantsPlay && (resumeOnReturn || keepResume || !paused)
  writeSession(SESSION_KEY, {
    src,
    currentTime,
    musicEnabled: true,
    wasPlaying: shouldResume,
    shouldResume
  })
}

function flushPendingSeek(bgm) {
  if (pendingSeekAfterLoad <= 0) return
  const seekTo = pendingSeekAfterLoad
  try {
    bgm.startTime = seekTo
    bgm.seek(seekTo)
  } catch {
    bgm.startTime = seekTo
  }
}

function scheduleSeekRetries(bgm) {
  if (pendingSeekAfterLoad <= 0) return
  const seekTo = pendingSeekAfterLoad
  ;[100, 300, 600, 1200, 2000].forEach((delay) => {
    setTimeout(() => {
      if (pendingSeekAfterLoad !== seekTo) return
      flushPendingSeek(bgm)
    }, delay)
  })
}

function ensureManager() {
  // #ifdef MP-WEIXIN
  if (manager) return manager
  if (typeof wx === 'undefined' || !wx.getBackgroundAudioManager) return null
  manager = wx.getBackgroundAudioManager()
  manager.audioType = 'music'
  manager.onPlay(() => {
    isMusicPlaying.value = true
  })
  manager.onPause(() => {
    isMusicPlaying.value = false
    if (userWantsPlay && (leavingPage || appInBackground)) {
      saveSession({ resumeOnReturn: true })
    }
  })
  manager.onStop(() => {
    isMusicPlaying.value = false
    if (userWantsPlay && (leavingPage || appInBackground)) {
      saveSession({ resumeOnReturn: true })
    }
  })
  manager.onEnded(() => {
    playRandomNext()
  })
  manager.onError((res) => {
    isMusicPlaying.value = false
    const detail = res && typeof res === 'object' ? res.errMsg || res.message : ''
    if (detail) console.warn('[love-music] play error', detail)
    showMusicToast({ title: '音乐暂时无法播放', icon: 'none' })
  })
  manager.onTimeUpdate(() => {
    const now = Date.now()
    if (now - lastPersistAt < 800) return
    lastPersistAt = now
    const t = getManagerCurrentTime(manager)
    if (t > 0) persistPlayPositionNow()
  })
  manager.onCanplay(() => {
    if (manager) flushPendingSeek(manager)
  })
  manager.onSeeked(() => {
    pendingSeekAfterLoad = 0
  })
  return manager
  // #endif
  // #ifndef MP-WEIXIN
  return null
  // #endif
}

function pickRandom(excludeSrc) {
  if (!Array.isArray(playlist) || !playlist.length) return DEFAULT_LOVE_MUSIC
  if (playlist.length === 1) return playlist[0]
  const pool = playlist.filter((item) => item.src !== excludeSrc)
  const list = pool.length ? pool : playlist
  return list[Math.floor(Math.random() * list.length)]
}

function playItem(item, { autoplay = true, startTime = 0 } = {}) {
  const bgm = ensureManager()
  if (!bgm || !item?.src) {
    showMusicToast({ title: '请在微信小程序中播放音乐', icon: 'none' })
    return
  }

  const next = item
  currentItem = next
  currentIndex = playlist.findIndex((x) => x.src === next.src)
  const seekAt = Math.max(0, startTime)
  pendingSeekAfterLoad = seekAt

  bgm.title = next.title || '恋爱时光'
  bgm.singer = next.singer || 'AI星芽'
  bgm.epname = next.epname || '星芽恋记情侣空间'
  bgm.coverImgUrl = next.coverImgUrl || CLOUD_LOVE_BG
  bgm.webUrl = '/pages/home/index'

  const sameSrc = activeLogicalSrc === next.src && Boolean(bgm.src)
  const liveAt = getManagerCurrentTime(bgm)
  const mustReloadForSeek = seekAt > 0 && liveAt < seekAt - 1

  if (!sameSrc || mustReloadForSeek) {
    bgm.startTime = seekAt
    bgm.src = next.src
    activeLogicalSrc = next.src
    if (seekAt > 0) scheduleSeekRetries(bgm)
    if (!autoplay) {
      setTimeout(() => {
        try {
          bgm.pause()
        } catch {
          /* ignore */
        }
        isMusicPlaying.value = false
      }, 50)
    } else {
      isMusicPlaying.value = true
      userWantsPlay = true
    }
  } else if (seekAt > 0) {
    bgm.startTime = seekAt
    flushPendingSeek(bgm)
    scheduleSeekRetries(bgm)
    if (autoplay && bgm.paused) {
      try {
        bgm.play()
      } catch {
        /* ignore */
      }
    }
    isMusicPlaying.value = autoplay && !bgm.paused
    userWantsPlay = autoplay
  } else if (autoplay && bgm.paused) {
    try {
      bgm.play()
    } catch {
      /* ignore */
    }
    isMusicPlaying.value = true
    userWantsPlay = true
  } else if (!autoplay) {
    try {
      bgm.pause()
    } catch {
      /* ignore */
    }
    isMusicPlaying.value = false
  } else {
    isMusicPlaying.value = !bgm.paused
    userWantsPlay = true
  }

  saveSession({ resumeOnReturn: autoplay })
}

function playRandomNext() {
  playItem(pickRandom(currentItem?.src), { autoplay: true, startTime: 0 })
}

function restoreSession() {
  const raw = readSession(SESSION_KEY)
  if (!raw?.src) return null
  const item = playlist.find((x) => x.src === raw.src)
  if (!item) {
    clearSession(SESSION_KEY)
    return null
  }
  const explicitlyPaused = raw.shouldResume === false
  return {
    item,
    startTime: Math.max(0, Number(raw.currentTime) || 0),
    shouldPlay: !explicitlyPaused && userWantsPlay
  }
}

function normalizePlaylist(payload) {
  if (Array.isArray(payload?.items) && payload.items.length) return payload.items
  if (Array.isArray(payload) && payload.length) return payload
  return [DEFAULT_LOVE_MUSIC]
}

async function loadPlaylist() {
  try {
    const loopPayload = await musicApi.loopList()
    playlist = normalizePlaylist(loopPayload)
  } catch {
    playlist = [DEFAULT_LOVE_MUSIC]
  }
  if (!Array.isArray(playlist)) playlist = [DEFAULT_LOVE_MUSIC]
  if (currentItem?.src) {
    currentIndex = playlist.findIndex((item) => item.src === currentItem.src)
  }
}

async function resumeLoveMusic() {
  if (resumeInflight) return resumeInflight
  resumeInflight = (async () => {
    await loadPlaylist()
    const restored = restoreSession()
    if (restored?.shouldPlay) {
      playItem(restored.item, { autoplay: true, startTime: restored.startTime })
      return
    }
    const bgm = manager
    const stored = readSession(SESSION_KEY)
    const storedItem = stored?.src
      ? playlist.find((x) => x.src === stored.src) || currentItem
      : null
    if (bgm?.src && storedItem && userWantsPlay) {
      const seekAt = Math.max(0, Number(stored.currentTime) || 0)
      if (seekAt > 0) {
        playItem(storedItem, { autoplay: true, startTime: seekAt })
        return
      }
    }
    if (!bgm?.src && Array.isArray(playlist) && playlist.length && userWantsPlay) {
      playItem(pickRandom(), { autoplay: true })
    }
  })()
  try {
    await resumeInflight
  } finally {
    resumeInflight = null
  }
}

function handlePageShow() {
  leavingPage = false
  appInBackground = false
  if (!userWantsPlay) return

  const stored = readSession(SESSION_KEY)
  const explicitlyPaused = stored?.shouldResume === false
  if (explicitlyPaused) return

  const bgm = manager || ensureManager()
  const savedAt = Math.max(0, Number(stored?.currentTime) || 0)
  const officialAt = bgm ? getManagerCurrentTime(bgm) : 0
  const storedItem = stored?.src
    ? playlist.find((x) => x.src === stored.src) || currentItem
    : null
  if (
    bgm &&
    storedItem &&
    currentItem?.src === stored.src &&
    bgm.paused === false &&
    savedAt > 0 &&
    officialAt >= savedAt - 2
  ) {
    isMusicPlaying.value = true
    startProgressSaver()
    return
  }

  if (resumeDebounceTimer) clearTimeout(resumeDebounceTimer)
  resumeDebounceTimer = setTimeout(() => {
    resumeDebounceTimer = null
    resumeLoveMusic()
  }, 200)
}

function handleAppShow() {
  appInBackground = false
  handlePageShow()
}

function handleAppHide() {
  appInBackground = true
  leavingPage = true
  persistPlayPositionNow()
  if (pageHideDeferTimer) {
    clearTimeout(pageHideDeferTimer)
    pageHideDeferTimer = null
  }
  const t = getPersistedPlayTime(manager)
  if (t > 0) pendingSeekAfterLoad = t
  saveSession({ resumeOnReturn: userWantsPlay })
}

function saveBeforeLeave() {
  leavingPage = true
  persistPlayPositionNow()
  const t = getPersistedPlayTime(manager)
  if (t > 0) pendingSeekAfterLoad = t
  saveSession({ resumeOnReturn: userWantsPlay })
  if (manager) {
    try {
      manager.pause()
    } catch {
      /* ignore */
    }
    isMusicPlaying.value = false
  }
}

function handlePageHide() {
  persistPlayPositionNow()
  if (pageHideDeferTimer) clearTimeout(pageHideDeferTimer)
  pageHideDeferTimer = setTimeout(() => {
    pageHideDeferTimer = null
    if (appInBackground) return
    saveBeforeLeave()
  }, 300)
}

function startProgressSaver() {
  stopProgressSaver()
  saveTimer = setInterval(() => saveSession({ resumeOnReturn: true }), 2000)
}

function stopProgressSaver() {
  if (saveTimer) {
    clearInterval(saveTimer)
    saveTimer = null
  }
}

function bindLoveMusicLifecycle() {
  if (lifecycleBound) return
  lifecycleBound = true
  onMusicEvent('love-music-resume', handlePageShow)
  // #ifdef MP-WEIXIN
  onAppShow(handleAppShow)
  onAppHide(handleAppHide)
  if (typeof wx !== 'undefined' && wx.onAudioInterruptionEnd) {
    wx.onAudioInterruptionEnd(() => {
      if (userWantsPlay) handlePageShow()
    })
  }
  // #endif
}

export function useLoveMusic() {
  bindLoveMusicLifecycle()

  function toggleMusicControls() {
    musicControlsVisible.value = !musicControlsVisible.value
  }

  function togglePlayPause() {
    const bgm = ensureManager()
    if (!bgm) {
      showMusicToast({ title: '请在微信小程序中播放音乐', icon: 'none' })
      return
    }
    if (!bgm.src) {
      userWantsPlay = true
      playItem(pickRandom(), { autoplay: true })
      return
    }
    if (isMusicPlaying.value && !bgm.paused) {
      userWantsPlay = false
      try {
        bgm.pause()
      } catch {
        /* ignore */
      }
      isMusicPlaying.value = false
      saveSession({ resumeOnReturn: false })
    } else {
      userWantsPlay = true
      const item =
        currentItem || playlist.find((x) => x.src === activeLogicalSrc || x.src === bgm.src)
      if (item) {
        const resumeAt = getManagerCurrentTime(bgm)
        playItem(item, { autoplay: true, startTime: resumeAt })
      } else {
        resumeLoveMusic()
      }
    }
  }

  function nextTrack() {
    if (!Array.isArray(playlist) || !playlist.length) return
    const next =
      currentIndex >= 0 ? playlist[(currentIndex + 1) % playlist.length] : pickRandom()
    playItem(next, { autoplay: true, startTime: 0 })
  }

  function prevTrack() {
    if (!Array.isArray(playlist) || !playlist.length) return
    const prev =
      currentIndex >= 0
        ? playlist[(currentIndex - 1 + playlist.length) % playlist.length]
        : pickRandom()
    playItem(prev, { autoplay: true, startTime: 0 })
  }

  return {
    musicControlsVisible,
    isMusicPlaying,
    toggleMusicControls,
    togglePlayPause,
    nextTrack,
    prevTrack,
    resumeOnPageShow: handlePageShow,
    onPageShow: handlePageShow,
    onPageHide: handlePageHide,
    startProgressSaver,
    stopProgressSaver
  }
}
