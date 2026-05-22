import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { isDbEnabled } from '../db/pool.js'
import * as authRepo from '../db/auth-repository.js'
import { seed } from '../data/seed.js'

const memoryUsers = new Map()
const memoryMemberships = new Map()

function getCloudOpenId(req) {
  return (
    req.header('x-wx-openid') ||
    req.header('x-wx-from-openid') ||
    req.header('x-openid') ||
    ''
  )
}

async function getCode2SessionOpenId(code) {
  if (!config.wx.appSecret || !code || String(code).startsWith('dev_')) return ''
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
  url.searchParams.set('appid', config.wx.appId)
  url.searchParams.set('secret', config.wx.appSecret)
  url.searchParams.set('js_code', code)
  url.searchParams.set('grant_type', 'authorization_code')
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok || data.errcode) {
    const err = new Error(data.errmsg || '微信登录失败')
    err.status = 401
    err.code = 'WECHAT_LOGIN_FAILED'
    throw err
  }
  return data.openid || ''
}

async function resolveOpenId(req, code) {
  const cloudOpenId = getCloudOpenId(req)
  if (cloudOpenId) return cloudOpenId
  const sessionOpenId = await getCode2SessionOpenId(code)
  if (sessionOpenId) return sessionOpenId
  if (config.env !== 'production') return `dev_${code || 'local'}`
  const err = new Error('无法获取微信 OpenID，请检查云托管或 WX_APP_SECRET 配置')
  err.status = 401
  err.code = 'OPENID_REQUIRED'
  throw err
}

function signToken(user, space) {
  return jwt.sign(
    {
      typ: 'mini-user',
      userId: user.id,
      openId: user.openId,
      spaceId: space?.id || ''
    },
    config.jwtSecret,
    { expiresIn: '30d' }
  )
}

function memoryLogin(openId) {
  const user =
    memoryUsers.get(openId) ||
    {
      id: `u_${String(openId).replace(/[^a-zA-Z0-9]/g, '').slice(-16) || 'me'}`,
      openId,
      nickname: '我',
      avatarUrl: '',
      role: 'member'
    }
  memoryUsers.set(openId, user)
  const space = seed.spaces[0]
  memoryMemberships.set(user.id, space.id)
  return { user, space }
}

export async function loginMiniUser(req, body = {}) {
  const openId = await resolveOpenId(req, body.code)
  let user
  let space

  if (isDbEnabled()) {
    try {
      user = (await authRepo.findUserByOpenId(openId)) || (await authRepo.createUser({ openId }))
      await authRepo.touchUserLogin(user.id)
      space = await authRepo.ensureCurrentSpace(user.id)
    } catch (err) {
      console.error('[auth-service] db login failed, fallback memory', err.message)
    }
  }

  if (!user || !space) {
    ;({ user, space } = memoryLogin(openId))
  }

  const token = signToken(user, space)
  return { token, user, space }
}

export function verifyMiniToken(token) {
  const payload = jwt.verify(token, config.jwtSecret)
  if (payload.typ !== 'mini-user') {
    const err = new Error('无效登录态')
    err.status = 401
    err.code = 'INVALID_TOKEN'
    throw err
  }
  return payload
}
