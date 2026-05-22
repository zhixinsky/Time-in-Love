import * as musicService from '../services/music-service.js'

export async function loopListHandler(_req, res) {
  res.json({ code: 0, data: await musicService.getLoopList() })
}
