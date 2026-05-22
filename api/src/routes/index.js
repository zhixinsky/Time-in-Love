import { Router } from 'express'
import { asyncHandler } from '../middleware/error-handler.js'
import { adminJwtAuth } from '../middleware/admin-jwt-auth.js'
import { adminLoginHandler, adminMeHandler } from '../controllers/admin-auth-controller.js'
import { wechatLoginHandler } from '../controllers/auth-controller.js'
import {
  adminListDiariesHandler,
  adminListSpacesHandler,
  adminListUsersHandler,
  adminOverviewHandler
} from '../controllers/admin-controller.js'
import { getDashboardHandler, getSpaceHandler, listSpacesHandler } from '../controllers/space-controller.js'
import { getDashboard } from '../services/space-service.js'
import { config } from '../config/index.js'
import { isDbEnabled } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadImage, uploadVideo } from '../middleware/upload.js'
import {
  createDiaryHandler,
  deleteDiaryHandler,
  generateAiSummaryHandler,
  getDiaryByDateHandler,
  getDiaryDetailHandler,
  getTimelineHandler,
  updateDiaryHandler
} from '../controllers/diary-controller.js'
import { uploadImageHandler, uploadVideoHandler } from '../controllers/upload-controller.js'
import { loopListHandler } from '../controllers/music-controller.js'
import {
  adminCreateMusicHandler,
  adminDeleteMusicHandler,
  adminListMusicHandler,
  adminSyncCloudMusicHandler,
  adminUpdateMusicHandler
} from '../controllers/admin-music-controller.js'
import {
  adminConfigGetHandler,
  adminConfigUpdateHandler,
  adminDashboardHandler,
  adminResourceListHandler,
  adminReviewBatchHandler,
  adminReviewQueueHandler
} from '../controllers/admin-console-controller.js'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.json({
    code: 0,
    data: {
      status: 'ok',
      time: new Date().toISOString(),
      cloudEnvId: config.wx.cloudEnvId,
      database: isDbEnabled() ? 'mysql' : 'memory-seed',
      cosBucket: config.music.bucket || null,
      cosRegion: config.music.region || null
    }
  })
})

// —— 认证 ——
apiRouter.post('/auth/wechat-login', asyncHandler(wechatLoginHandler))

// —— 情侣空间（小程序） ——
apiRouter.get('/spaces', asyncHandler(listSpacesHandler))
apiRouter.get('/spaces/:spaceId', asyncHandler(getSpaceHandler))
apiRouter.get('/spaces/:spaceId/dashboard', asyncHandler(getDashboardHandler))
apiRouter.get('/spaces/:spaceId/anniversaries', asyncHandler(async (req, res) => {
  const data = await getDashboard(req.params.spaceId)
  if (!data) return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  res.json({ code: 0, data: data.anniversaries })
}))
apiRouter.get('/spaces/:spaceId/moods', asyncHandler(async (req, res) => {
  const data = await getDashboard(req.params.spaceId)
  if (!data) return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  res.json({ code: 0, data: data.moods })
}))
apiRouter.get('/spaces/:spaceId/bills/summary', asyncHandler(async (req, res) => {
  const data = await getDashboard(req.params.spaceId)
  if (!data) return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  res.json({ code: 0, data: data.bills })
}))
// —— 恋爱背景音乐（公开，与 Moona 路径一致） ——
apiRouter.get('/love-space/background-music/loop', asyncHandler(loopListHandler))

apiRouter.get('/spaces/:spaceId/diaries/latest', asyncHandler(async (req, res) => {
  const data = await getDashboard(req.params.spaceId)
  if (!data) return res.status(404).json({ code: 'SPACE_NOT_FOUND', message: '情侣空间不存在' })
  res.json({ code: 0, data: data.latestDiary })
}))

// —— 心动日记 ——
const diaryRouter = Router()
diaryRouter.use(requireAuth)
diaryRouter.get('/by-date', asyncHandler(getDiaryByDateHandler))
diaryRouter.get('/timeline', asyncHandler(getTimelineHandler))
diaryRouter.post('/', asyncHandler(createDiaryHandler))
diaryRouter.get('/:id', asyncHandler(getDiaryDetailHandler))
diaryRouter.put('/:id', asyncHandler(updateDiaryHandler))
diaryRouter.delete('/:id', asyncHandler(deleteDiaryHandler))
diaryRouter.post('/:id/ai-summary', asyncHandler(generateAiSummaryHandler))
apiRouter.use('/diaries', diaryRouter)

const uploadRouter = Router()
uploadRouter.use(requireAuth)
uploadRouter.post('/image', (req, res, next) => {
  uploadImage(req, res, (err) => (err ? next(err) : uploadImageHandler(req, res)))
})
uploadRouter.post('/video', (req, res, next) => {
  uploadVideo(req, res, (err) => (err ? next(err) : uploadVideoHandler(req, res)))
})
apiRouter.use('/upload', uploadRouter)

// —— 管理端 ——
const adminRouter = Router()
adminRouter.post('/auth/login', asyncHandler(adminLoginHandler))
adminRouter.get('/auth/me', asyncHandler(adminJwtAuth), asyncHandler(adminMeHandler))
adminRouter.use(adminJwtAuth)
adminRouter.get('/overview', asyncHandler(adminOverviewHandler))
adminRouter.get('/dashboard', asyncHandler(adminDashboardHandler))
adminRouter.get('/spaces', asyncHandler(adminListSpacesHandler))
adminRouter.get('/users', asyncHandler(adminListUsersHandler))
adminRouter.get('/diaries', asyncHandler(adminListDiariesHandler))
adminRouter.get('/review/queue', asyncHandler(adminReviewQueueHandler))
adminRouter.post('/review/batch', asyncHandler(adminReviewBatchHandler))
adminRouter.get('/config', asyncHandler(adminConfigGetHandler))
adminRouter.put('/config', asyncHandler(adminConfigUpdateHandler))
adminRouter.get('/resources/:resource', asyncHandler(adminResourceListHandler))
adminRouter.get('/love-background-music', asyncHandler(adminListMusicHandler))
adminRouter.post('/love-background-music', asyncHandler(adminCreateMusicHandler))
adminRouter.post('/love-background-music/sync-cloud', asyncHandler(adminSyncCloudMusicHandler))
adminRouter.patch('/love-background-music/:id', asyncHandler(adminUpdateMusicHandler))
adminRouter.delete('/love-background-music/:id', asyncHandler(adminDeleteMusicHandler))

apiRouter.use('/admin', adminRouter)
