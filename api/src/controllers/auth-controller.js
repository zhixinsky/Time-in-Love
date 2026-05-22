import { loginMiniUser } from '../services/auth-service.js'

export async function wechatLoginHandler(req, res) {
  const { code } = req.body || {}
  if (!code) {
    return res.status(400).json({ code: 'INVALID_CODE', message: '缺少 wx.login code' })
  }

  const data = await loginMiniUser(req, req.body)
  res.json({
    code: 0,
    data
  })
}

export function miniMeHandler(req, res) {
  res.json({
    code: 0,
    data: {
      user: req.user,
      space: req.space
    }
  })
}
