import { config } from '../config/index.js'

export function adminAuth(req, res, next) {
  const token = req.header('x-admin-token')
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '管理端未授权' })
  }
  next()
}
