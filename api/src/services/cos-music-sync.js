import http from 'http'
import { config } from '../config/index.js'
import { toCloudFileId } from '../utils/cloud-file-id.js'

const AUDIO_EXTENSIONS = new Set(['.mp3', '.m4a', '.aac', '.wav'])

let cachedTmpAuth = null

function normalizePrefix(prefix) {
  const clean = prefix.trim().replace(/^\/+/, '')
  return clean.endsWith('/') ? clean : `${clean}/`
}

function isAudioKey(key) {
  const lower = key.toLowerCase()
  const ext = lower.slice(lower.lastIndexOf('.'))
  return AUDIO_EXTENSIONS.has(ext)
}

function titleFromKey(key) {
  const name = key.split('/').pop() || key
  return decodeURIComponent(name.replace(/\.[^.]+$/, '')).replace(/[-_]+/g, ' ').trim() || '未命名音乐'
}

async function getWechatCosTmpAuth() {
  const now = Date.now()
  if (cachedTmpAuth && now < cachedTmpAuth.expiresAtMs - 60_000) {
    return cachedTmpAuth.value
  }

  const raw = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: 'GET',
        host: 'api.weixin.qq.com',
        path: '/_/cos/getauth',
        timeout: 10000
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      }
    )
    req.on('timeout', () => req.destroy(new Error('获取 COS 临时密钥超时')))
    req.on('error', reject)
    req.end()
  })

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`获取 COS 临时密钥失败：${raw}`)
  }

  const auth = {
    TmpSecretId: String(parsed?.TmpSecretId || ''),
    TmpSecretKey: String(parsed?.TmpSecretKey || ''),
    Token: String(parsed?.Token || ''),
    ExpiredTime: Number(parsed?.ExpiredTime || 0)
  }
  if (!auth.TmpSecretId || !auth.TmpSecretKey || !auth.Token || !auth.ExpiredTime) {
    throw new Error(`获取 COS 临时密钥失败：${raw}`)
  }

  cachedTmpAuth = { value: auth, expiresAtMs: auth.ExpiredTime * 1000 }
  return auth
}

async function loadCosSdk() {
  const mod = await import('cos-nodejs-sdk-v5')
  return mod.default || mod
}

async function listCosObjects(prefix) {
  const bucket = config.music.bucket
  const region = config.music.region
  const items = []
  let marker = ''

  const COS = await loadCosSdk()
  const auth = await getWechatCosTmpAuth()
  const cos = new COS({
    SecretId: auth.TmpSecretId,
    SecretKey: auth.TmpSecretKey,
    SecurityToken: auth.Token
  })

  for (let page = 0; page < 20; page += 1) {
    const data = await new Promise((resolve, reject) => {
      cos.getBucket(
        {
          Bucket: bucket,
          Region: region,
          Prefix: prefix,
          Marker: marker || undefined,
          MaxKeys: 1000
        },
        (err, res) => (err ? reject(err) : resolve(res))
      )
    })

    const contents = data?.Contents || []
    contents.forEach((row) => {
      const key = String(row?.Key || '')
      if (!key) return
      items.push({ key, size: Number(row?.Size || 0) })
    })

    const truncated = Boolean(data?.IsTruncated) && String(data?.IsTruncated) !== 'false'
    marker = String(data?.NextMarker || '')
    if (!truncated || !marker) break
  }

  return items
}

/** 扫描云存储 music/ 目录，返回待导入行 */
export async function scanCloudMusic({ prefix, enabled = true, loopEnabled = true } = {}) {
  const cleanPrefix = normalizePrefix(prefix || config.music.prefix)
  const coverImgUrl = toCloudFileId(config.music.cloudEnv, config.music.bucket, config.music.coverKey)

  const objects = await listCosObjects(cleanPrefix)
  const musicObjects = objects.filter((item) => isAudioKey(item.key))

  let sort = 0
  const rows = musicObjects.map((item) => {
    sort += 1
    return {
      title: titleFromKey(item.key),
      singer: 'AI星芽',
      epname: '星芽恋记情侣空间',
      fileId: toCloudFileId(config.music.cloudEnv, config.music.bucket, item.key),
      coverImgUrl,
      enabled,
      loopEnabled,
      sort,
      remark: '云存储自动同步'
    }
  })

  return {
    prefix: cleanPrefix,
    scanned: objects.length,
    matched: musicObjects.length,
    rows
  }
}
