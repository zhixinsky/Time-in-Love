import * as store from '../data/music-store.js'
import { scanCloudMusic } from './cos-music-sync.js'

export function getLoopList() {
  return { items: store.loopList() }
}

export function adminList() {
  return { items: store.listAll() }
}

export function adminCreate(body) {
  if (!body?.fileId?.trim()) {
    const err = new Error('请填写云文件 ID')
    err.status = 400
    err.code = 'BAD_REQUEST'
    throw err
  }
  return store.create(body)
}

export function adminUpdate(id, body) {
  const item = store.update(id, body)
  if (!item) {
    const err = new Error('音乐不存在')
    err.status = 404
    err.code = 'NOT_FOUND'
    throw err
  }
  return item
}

export function adminRemove(id) {
  const ok = store.remove(id)
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
  const imported = store.importFromCloud(scan.rows)
  return {
    prefix: scan.prefix,
    scanned: scan.scanned,
    matched: scan.matched,
    imported,
    skipped: scan.matched - imported
  }
}
