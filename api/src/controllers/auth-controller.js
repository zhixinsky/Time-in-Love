/**
 * 微信登录占位：云托管环境应使用 code2Session + 自建用户表
 * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 */
export function wechatLoginHandler(req, res) {
  const { code } = req.body || {}
  if (!code) {
    return res.status(400).json({ code: 'INVALID_CODE', message: '缺少 wx.login code' })
  }

  res.json({
    code: 0,
    data: {
      token: 'mock-jwt-token',
      userId: 'u_me',
      spaceId: 'space_demo',
      message: '当前为演示登录，请在接入微信 AppSecret 后替换'
    }
  })
}
