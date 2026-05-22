import * as adminAuthService from '../services/admin-auth-service.js'

export async function adminLoginHandler(req, res) {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: '请输入用户名和密码' })
  }
  try {
    const data = await adminAuthService.login(username, password)
    res.json({ code: 0, data })
  } catch (e) {
    if (e.status === 401) return res.status(401).json({ code: e.code, message: e.message })
    throw e
  }
}

export async function adminMeHandler(req, res) {
  const data = await adminAuthService.me(req.admin.id)
  res.json({ code: 0, data })
}
