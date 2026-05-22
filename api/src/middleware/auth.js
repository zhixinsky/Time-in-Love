/** 演示鉴权：小程序请求头携带用户与空间信息，后续接微信登录 JWT */
export function requireAuth(req, res, next) {
  const userId = req.header('x-user-id')
  const spaceId = req.header('x-space-id')
  if (!userId || !spaceId) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '请先登录并加入情侣空间' })
  }
  req.user = { id: userId, nickname: userId === 'u_me' ? '我' : 'Ta' }
  req.spaceId = spaceId
  next()
}
