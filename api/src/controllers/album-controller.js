import { listAlbumMedia } from '../services/album-service.js'

export async function listAlbumMediaHandler(req, res) {
  const data = listAlbumMedia(req.spaceId, req.user.id, req.query)
  res.json({ code: 0, data })
}
