import bcrypt from 'bcryptjs'
import { createId } from '../utils/id.js'

const state = {
  users: []
}

async function seedAdmin() {
  if (state.users.length) return
  const hash = await bcrypt.hash('admin123456', 10)
  state.users.push({
    id: 'admin_seed',
    username: 'admin',
    passwordHash: hash,
    nickname: '超级管理员',
    role: 'super_admin',
    status: 'enabled',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}

await seedAdmin()

export async function findByUsername(username) {
  return state.users.find((u) => u.username === username) || null
}

export async function findById(id) {
  return state.users.find((u) => u.id === id) || null
}

export function sanitize(user) {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    lastLoginAt: user.lastLoginAt
  }
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash)
}

export async function updateLastLogin(id) {
  const user = await findById(id)
  if (!user) return null
  user.lastLoginAt = new Date().toISOString()
  user.updatedAt = user.lastLoginAt
  return user
}
