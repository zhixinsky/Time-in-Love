import {
  getAdminDashboard,
  getReviewQueue,
  getSystemConfig,
  listAdminResource
} from '../services/admin-console-service.js'

export async function adminDashboardHandler(_req, res) {
  res.json({ code: 0, data: await getAdminDashboard() })
}

export async function adminResourceListHandler(req, res) {
  res.json({ code: 0, data: await listAdminResource(req.params.resource, req.query) })
}

export async function adminReviewQueueHandler(req, res) {
  res.json({ code: 0, data: await getReviewQueue(req.query) })
}

export async function adminReviewBatchHandler(req, res) {
  const { ids = [], action, reason = '' } = req.body || {}
  res.json({
    code: 0,
    data: {
      ids,
      action,
      reason,
      handledAt: new Date().toISOString()
    }
  })
}

export async function adminConfigGetHandler(_req, res) {
  res.json({ code: 0, data: await getSystemConfig() })
}

export async function adminConfigUpdateHandler(req, res) {
  res.json({
    code: 0,
    data: {
      ...(await getSystemConfig()),
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  })
}
