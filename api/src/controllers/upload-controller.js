import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function uploadImageHandler(req, res) {
  if (!req.file) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: '请上传图片文件' })
  }
  const url = `/uploads/${req.file.filename}`
  res.json({ code: 0, data: { url } })
}

export function uploadVideoHandler(req, res) {
  if (!req.file) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: '请上传视频文件' })
  }
  const url = `/uploads/${req.file.filename}`
  const duration = Number(req.body?.duration) || 0
  res.json({
    code: 0,
    data: {
      url,
      coverUrl: url,
      duration
    }
  })
}
