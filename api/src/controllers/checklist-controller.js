import {
  createChecklistItem,
  deleteChecklistItem,
  listChecklist,
  updateChecklistItem
} from '../services/checklist-service.js'

export async function listChecklistHandler(req, res) {
  const data = await listChecklist(req.spaceId, req.user.id)
  res.json({ code: 0, data })
}

export async function createChecklistItemHandler(req, res) {
  const data = await createChecklistItem(req.spaceId, req.user.id, req.body || {})
  res.json({ code: 0, data })
}

export async function updateChecklistItemHandler(req, res) {
  const data = await updateChecklistItem(req.spaceId, req.params.id, req.body || {})
  if (!data) return res.status(404).json({ code: 'CHECK_ITEM_NOT_FOUND', message: '清单不存在' })
  res.json({ code: 0, data })
}

export async function deleteChecklistItemHandler(req, res) {
  const ok = await deleteChecklistItem(req.spaceId, req.params.id)
  if (!ok) return res.status(404).json({ code: 'CHECK_ITEM_NOT_FOUND', message: '清单不存在' })
  res.json({ code: 0, data: { success: true } })
}
