import { verifyMiniToken } from '../services/auth-service.js'
import { getSpace } from '../services/space-service.js'

export function requireAuth(req, res, next) {
  const auth = req.header('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  let userId = ''
  let spaceId = ''

  if (bearer) {
    try {
      const payload = verifyMiniToken(bearer)
      userId = payload.userId
      spaceId = payload.spaceId
      req.authPayload = payload
    } catch (err) {
      return next(err)
    }
  } else {
    userId = req.header('x-user-id')
    spaceId = req.header('x-space-id')
  }

  if (!userId || !spaceId) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '请先登录并加入情侣空间' })
  }

  getSpace(spaceId)
    .then((space) => {
      req.user = { id: userId, openId: req.authPayload?.openId || '', nickname: userId === 'u_me' ? '我' : '我' }
      req.spaceId = spaceId
      req.space = space
      next()
    })
    .catch(next)
}
