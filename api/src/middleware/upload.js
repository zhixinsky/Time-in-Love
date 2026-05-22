import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { config } from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`)
  }
})

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const videoTypes = ['video/mp4', 'video/quicktime']

function fileFilter(allowed) {
  return (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('不支持的文件类型'))
  }
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(imageTypes)
}).single('file')

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter(videoTypes)
}).single('file')

export { uploadDir }
