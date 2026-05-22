import * as musicService from '../services/music-service.js'

export function loopListHandler(_req, res) {
  res.json({ code: 0, data: musicService.getLoopList() })
}
