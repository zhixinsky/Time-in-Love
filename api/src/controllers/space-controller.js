import {
  createInvite,
  createCurrentAnniversary,
  createSpace,
  deleteCurrentAnniversary,
  getDashboard,
  getSpace,
  joinSpaceByInvite,
  listCurrentAnniversaries,
  listSpaces,
  updateCurrentAnniversary,
  updateCurrentSpace
} from '../services/space-service.js'
import { signMiniSession } from '../services/auth-service.js'

export async function getDashboardHandler(req, res) {
  const data = await getDashboard(req.params.spaceId)
  if (!data) {
    return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  }
  res.json({ code: 0, data })
}

export async function getSpaceHandler(req, res) {
  const space = await getSpace(req.params.spaceId)
  if (!space) {
    return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  }
  res.json({ code: 0, data: space })
}

export async function listSpacesHandler(_req, res) {
  const list = await listSpaces()
  res.json({ code: 0, data: list })
}

export async function getCurrentSpaceHandler(req, res) {
  res.json({ code: 0, data: req.space })
}

export async function getCurrentDashboardHandler(req, res) {
  const data = await getDashboard(req.spaceId)
  if (!data) {
    return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  }
  res.json({ code: 0, data })
}

export async function updateCurrentSpaceHandler(req, res) {
  const space = await updateCurrentSpace(req.spaceId, req.body || {})
  if (!space) {
    return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  }
  res.json({ code: 0, data: space })
}

export async function createSpaceHandler(req, res) {
  const space = await createSpace(req.user.id, req.body || {})
  const token = signMiniSession(req.user, space)
  res.json({ code: 0, data: { token, space } })
}

export async function createInviteHandler(req, res) {
  const data = await createInvite(req.spaceId)
  if (!data) {
    return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  }
  res.json({ code: 0, data })
}

export async function joinSpaceHandler(req, res) {
  const space = await joinSpaceByInvite(req.user.id, req.body?.inviteCode)
  const token = signMiniSession(req.user, space)
  res.json({ code: 0, data: { token, space } })
}

export async function listCurrentAnniversariesHandler(req, res) {
  const list = await listCurrentAnniversaries(req.spaceId)
  res.json({ code: 0, data: list })
}

export async function createCurrentAnniversaryHandler(req, res) {
  const item = await createCurrentAnniversary(req.spaceId, req.body || {})
  res.json({ code: 0, data: item })
}

export async function updateCurrentAnniversaryHandler(req, res) {
  const item = await updateCurrentAnniversary(req.spaceId, req.params.id, req.body || {})
  if (!item) return res.status(404).json({ code: 'ANNIVERSARY_NOT_FOUND', message: '纪念日不存在' })
  res.json({ code: 0, data: item })
}

export async function deleteCurrentAnniversaryHandler(req, res) {
  const ok = await deleteCurrentAnniversary(req.spaceId, req.params.id)
  if (!ok) return res.status(404).json({ code: 'ANNIVERSARY_NOT_FOUND', message: '纪念日不存在' })
  res.json({ code: 0, data: { success: true } })
}
