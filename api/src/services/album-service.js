import { getAlbumMedia } from '../data/diary-store.js'

export function listAlbumMedia(spaceId, userId, query = {}) {
  return getAlbumMedia(spaceId, userId, Number(query.page || 1), Number(query.pageSize || 30))
}
