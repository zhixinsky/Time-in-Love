import { getDashboard, getSpace, listSpaces } from '../services/space-service.js'

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
