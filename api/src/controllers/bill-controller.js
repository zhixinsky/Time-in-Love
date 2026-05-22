import { createBill, deleteBill, listBills } from '../services/bill-service.js'

export async function listBillsHandler(req, res) {
  const data = await listBills(req.spaceId, req.query)
  res.json({ code: 0, data })
}

export async function createBillHandler(req, res) {
  const data = await createBill(req.spaceId, req.user.id, req.body || {})
  res.json({ code: 0, data })
}

export async function deleteBillHandler(req, res) {
  const ok = await deleteBill(req.spaceId, req.params.id)
  if (!ok) return res.status(404).json({ code: 'BILL_NOT_FOUND', message: '账单不存在' })
  res.json({ code: 0, data: { success: true } })
}
