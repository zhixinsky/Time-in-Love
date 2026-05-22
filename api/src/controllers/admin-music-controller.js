import * as musicService from '../services/music-service.js'

export function adminListMusicHandler(_req, res) {
  res.json({ code: 0, data: musicService.adminList() })
}

export function adminCreateMusicHandler(req, res) {
  try {
    const item = musicService.adminCreate(req.body)
    res.status(201).json({ code: 0, data: item })
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ code: e.code, message: e.message })
    throw e
  }
}

export function adminUpdateMusicHandler(req, res) {
  try {
    const item = musicService.adminUpdate(req.params.id, req.body)
    res.json({ code: 0, data: item })
  } catch (e) {
    if (e.status === 404) return res.status(404).json({ code: e.code, message: e.message })
    throw e
  }
}

export function adminDeleteMusicHandler(req, res) {
  try {
    const data = musicService.adminRemove(req.params.id)
    res.json({ code: 0, data })
  } catch (e) {
    if (e.status === 404) return res.status(404).json({ code: e.code, message: e.message })
    throw e
  }
}

export async function adminSyncCloudMusicHandler(req, res) {
  try {
    const data = await musicService.adminSyncCloud(req.body)
    res.json({ code: 0, data })
  } catch (e) {
    res.status(400).json({ code: 'SYNC_FAILED', message: e.message || '同步失败' })
  }
}
