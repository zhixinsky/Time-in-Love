import { createId } from '../utils/id.js'
import { config } from '../config/index.js'

const cloudEnv = config.music.cloudEnv
const bucket = config.music.bucket
const coverFileId = `cloud://${cloudEnv}.${bucket}/${config.music.coverKey}`

const state = {
  items: []
}

function sortItems(list) {
  return [...list].sort((a, b) => a.sort - b.sort || String(b.createdAt).localeCompare(String(a.createdAt)))
}

export function listAll() {
  return sortItems(state.items)
}

export function loopList() {
  return sortItems(state.items.filter((item) => item.enabled && item.loopEnabled)).map((item) => ({
    id: item.id,
    title: item.title,
    singer: item.singer,
    epname: item.epname,
    src: item.fileId,
    coverImgUrl: item.coverImgUrl
  }))
}

export function findById(id) {
  return state.items.find((item) => item.id === id) || null
}

export function findByFileId(fileId) {
  return state.items.find((item) => item.fileId === fileId) || null
}

export function create(payload) {
  const now = new Date().toISOString()
  const item = {
    id: createId('bgm'),
    title: payload.title?.trim() || '未命名音乐',
    singer: payload.singer?.trim() || 'AI星芽',
    epname: payload.epname?.trim() || '星芽恋记情侣空间',
    fileId: payload.fileId?.trim() || '',
    coverImgUrl: payload.coverImgUrl?.trim() || coverFileId,
    enabled: payload.enabled !== false,
    loopEnabled: payload.loopEnabled !== false,
    sort: Number(payload.sort) || 0,
    remark: payload.remark?.trim() || null,
    createdAt: now,
    updatedAt: now
  }
  state.items.push(item)
  return item
}

export function update(id, payload) {
  const item = findById(id)
  if (!item) return null
  const fields = ['title', 'singer', 'epname', 'fileId', 'coverImgUrl', 'enabled', 'loopEnabled', 'sort', 'remark']
  fields.forEach((key) => {
    if (payload[key] !== undefined) {
      if (key === 'enabled' || key === 'loopEnabled') item[key] = Boolean(payload[key])
      else if (key === 'sort') item[key] = Number(payload[key]) || 0
      else if (typeof payload[key] === 'string') item[key] = payload[key].trim()
      else item[key] = payload[key]
    }
  })
  item.updatedAt = new Date().toISOString()
  return item
}

export function remove(id) {
  const idx = state.items.findIndex((item) => item.id === id)
  if (idx < 0) return false
  state.items.splice(idx, 1)
  return true
}

export function importFromCloud(rows) {
  const existing = new Set(state.items.map((item) => item.fileId))
  let sort = maxSort()
  let imported = 0
  rows.forEach((row) => {
    if (!row.fileId || existing.has(row.fileId)) return
    sort += 1
    create({ ...row, sort })
    existing.add(row.fileId)
    imported += 1
  })
  return imported
}

export function maxSort() {
  return state.items.reduce((max, item) => Math.max(max, item.sort || 0), 0)
}
