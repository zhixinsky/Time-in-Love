import { adminRequest } from './admin'

export type LoveBackgroundMusic = {
  id: string
  title: string
  singer: string
  epname: string
  fileId: string
  coverImgUrl?: string | null
  enabled: boolean
  loopEnabled: boolean
  sort: number
  remark?: string | null
  createdAt?: string
  updatedAt?: string
}

export type MusicListPayload = {
  items: LoveBackgroundMusic[]
}

export type SyncCloudPayload = {
  prefix: string
  scanned: number
  matched: number
  imported: number
  skipped: number
}

export function listLoveMusic() {
  return adminRequest<MusicListPayload>('/love-background-music')
}

export function createLoveMusic(body: Partial<LoveBackgroundMusic>) {
  return adminRequest<LoveBackgroundMusic>('/love-background-music', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function updateLoveMusic(id: string, body: Partial<LoveBackgroundMusic>) {
  return adminRequest<LoveBackgroundMusic>(`/love-background-music/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function deleteLoveMusic(id: string) {
  return adminRequest<{ ok: boolean }>(`/love-background-music/${id}`, { method: 'DELETE' })
}

export function syncLoveMusicCloud(body: { prefix?: string; enabled?: boolean; loopEnabled?: boolean } = {}) {
  return adminRequest<SyncCloudPayload>('/love-background-music/sync-cloud', {
    method: 'POST',
    body: JSON.stringify({
      prefix: 'music/',
      enabled: true,
      loopEnabled: true,
      ...body
    })
  })
}
