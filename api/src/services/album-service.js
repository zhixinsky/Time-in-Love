import { fetchAlbumMedia } from './diary-service.js'

export async function listAlbumMedia(spaceId, userId, query = {}) {
  return fetchAlbumMedia(spaceId, userId, Number(query.page || 1), Number(query.pageSize || 30))
}
