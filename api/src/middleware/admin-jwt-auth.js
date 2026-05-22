import { config } from '../config/index.js'
import * as adminAuthService from '../services/admin-auth-service.js'
import * as adminStore from '../data/admin-user-store.js'

/** JWT Bearer 或兼容旧版 x-admin-token */
export async function adminJwtAuth(req, res, next) {
  const bearer = req.header('authorization')
  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.slice(7).trim()
    const payload = adminAuthService.verifyToken(token)
    if (!payload) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: '登录已过期，请重新登录' })
    }
    const admin = await adminStore.findById(payload.sub)
    if (!admin || admin.status !== 'enabled') {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: '账号不可用' })
    }
    req.admin = adminStore.sanitize(admin)
    return next()
  }

  const legacy = req.header('x-admin-token')
  if (legacy && legacy === config.adminToken) {
    req.admin = { id: 'legacy', username: 'admin', nickname: 'Token', role: 'super_admin' }
    return next()
  }

  return res.status(401).json({ code: 'UNAUTHORIZED', message: '请先登录管理后台' })
}
