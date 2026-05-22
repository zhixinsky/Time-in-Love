import { getAdminOverview, listDiaries, listSpaces, listUsers } from '../services/space-service.js'

export async function adminOverviewHandler(_req, res) {
  const data = await getAdminOverview()
  res.json({ code: 0, data })
}

export async function adminListSpacesHandler(_req, res) {
  res.json({ code: 0, data: await listSpaces() })
}

export async function adminListUsersHandler(_req, res) {
  res.json({ code: 0, data: await listUsers() })
}

export async function adminListDiariesHandler(_req, res) {
  res.json({ code: 0, data: await listDiaries() })
}
