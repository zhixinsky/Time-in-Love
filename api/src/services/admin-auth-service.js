import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import * as adminStore from '../data/admin-user-store.js'

function signToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin'
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

export async function login(username, password) {
  const admin = await adminStore.findByUsername(username?.trim())
  if (!admin || admin.status !== 'enabled') {
    const err = new Error('用户名或密码错误')
    err.status = 401
    err.code = 'UNAUTHORIZED'
    throw err
  }
  const ok = await adminStore.verifyPassword(admin, password)
  if (!ok) {
    const err = new Error('用户名或密码错误')
    err.status = 401
    err.code = 'UNAUTHORIZED'
    throw err
  }
  await adminStore.updateLastLogin(admin.id)
  return {
    token: signToken(admin),
    admin: adminStore.sanitize(admin)
  }
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.type !== 'admin' || !payload.sub) return null
    return payload
  } catch {
    return null
  }
}

export async function me(adminId) {
  const admin = await adminStore.findById(adminId)
  if (!admin || admin.status !== 'enabled') {
    const err = new Error('未登录或账号已禁用')
    err.status = 401
    err.code = 'UNAUTHORIZED'
    throw err
  }
  return adminStore.sanitize(admin)
}
