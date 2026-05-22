import * as memoryStore from '../data/music-store.js'
import * as musicRepo from '../db/music-repository.js'
import { isDbEnabled } from '../db/pool.js'
import { scanCloudMusic } from './cos-music-sync.js'
import { toCloudFileId } from '../utils/cloud-file-id.js'
import { config } from '../config/index.js'

const defaultCover = toCloudFileId(config.music.cloudEnv, config.music.bucket, config.music.coverKey)
const defaultBgmFileId = toCloudFileId(config.music.cloudEnv, config.music.bucket, 'music/love-bgm.mp3')

function ensureMemoryDefaults() {
  if (!memoryStore.findByFileId(defaultBgmFileId)) {
    memoryStore.create({
      title: '恋爱时光',
      singer: 'AI星芽',
      epname: '星芽恋记情侣空间',
      fileId: defaultBgmFileId,
      coverImgUrl: defaultCover,
      enabled: true,
      loopEnabled: true,
      sort: 1,
      remark: '默认背景音乐'
    })
  }
}

function toLoopItem(item) {
  return {
    id: item.id,
    title: item.title,
    singer: item.singer,
    epname: item.epname,
    src: item.fileId,
    coverImgUrl: item.coverImgUrl || defaultCover
  }
}

export async function getLoopList() {
  if (isDbEnabled()) {
    try {
      const items = await musicRepo.listLoop()
      if (items.length) return { items: items.map(toLoopItem) }
    } catch (err) {
      console.error('[music-service] db loop list failed, fallback memory', err.message)
    }
  }
  ensureMemoryDefaults()
  return { items: memoryStore.loopList() }
}

async function listAllItems() {
  if (isDbEnabled()) {
    try {
      return await musicRepo.listAll()
    } catch (err) {
      console.error('[music-service] db list failed, fallback memory', err.message)
    }
  }
  ensureMemoryDefaults()
  return memoryStore.listAll()
}

export async function adminList() {
  return { items: await listAllItems() }
}

export async function adminCreate(body) {
  if (!body?.fileId?.trim()) {
    const err = new Error('请填写云文件 ID')
    err.status = 400
    err.code = 'BAD_REQUEST'
    throw err
  }
  const payload = normalizePayload(body)
  if (isDbEnabled()) {
    try {
      return await musicRepo.createItem(payload)
    } catch (err) {
      console.error('[music-service] db create failed, fallback memory', err.message)
    }
  }
  return memoryStore.create(payload)
}

export async function adminUpdate(id, body) {
  if (isDbEnabled()) {
    try {
      const item = await musicRepo.updateItem(id, body)
      if (item) return item
    } catch (err) {
      console.error('[music-service] db update failed, fallback memory', err.message)
    }
  }
  const item = memoryStore.update(id, body)
  if (!item) {
    const err = new Error('音乐不存在')
    err.status = 404
    err.code = 'NOT_FOUND'
    throw err
  }
  return item
}

export async function adminRemove(id) {
  if (isDbEnabled()) {
    try {
      const ok = await musicRepo.removeItem(id)
      if (ok) return { ok: true }
    } catch (err) {
      console.error('[music-service] db remove failed, fallback memory', err.message)
    }
  }
  const ok = memoryStore.remove(id)
  if (!ok) {
    const err = new Error('音乐不存在')
    err.status = 404
    err.code = 'NOT_FOUND'
    throw err
  }
  return { ok: true }
}

export async function adminSyncCloud(body = {}) {
  const scan = await scanCloudMusic(body)
  let imported = 0
  if (isDbEnabled()) {
    try {
      let sort = await musicRepo.maxSort()
      const rows = []
      for (const row of scan.rows) {
        if (!row.fileId) continue
        const exists = await musicRepo.findByFileId(row.fileId)
        if (exists) continue
        sort += 1
        rows.push({ ...row, sort })
      }
      imported = await musicRepo.importRows(rows)
    } catch (err) {
      console.error('[music-service] db sync failed, fallback memory', err.message)
      imported = memoryStore.importFromCloud(scan.rows)
    }
  } else {
    ensureMemoryDefaults()
    imported = memoryStore.importFromCloud(scan.rows)
  }
  return {
    prefix: scan.prefix,
    scanned: scan.scanned,
    matched: scan.matched,
    imported,
    skipped: scan.matched - imported
  }
}

function normalizePayload(body) {
  return {
    title: body.title?.trim() || '未命名音乐',
    singer: body.singer?.trim() || 'AI星芽',
    epname: body.epname?.trim() || '星芽恋记情侣空间',
    fileId: body.fileId?.trim() || '',
    coverImgUrl: body.coverImgUrl?.trim() || defaultCover,
    enabled: body.enabled !== false,
    loopEnabled: body.loopEnabled !== false,
    sort: Number(body.sort) || 0,
    remark: body.remark?.trim() || null
  }
}
