import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler } from './middleware/error-handler.js'
import { apiRouter } from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsPath = path.resolve(__dirname, '../uploads')
const adminDistCandidates = [
  process.env.ADMIN_DIST_PATH,
  path.resolve(__dirname, '../admin-dist'),
  path.resolve(__dirname, '../../admin/dist')
].filter(Boolean)
const adminDistPath = adminDistCandidates.find((candidate) => fs.existsSync(candidate))

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))
app.use('/uploads', express.static(uploadsPath))

app.get('/', (_req, res) => {
  res.json({ name: 'time-in-love-api', version: '0.1.0' })
})

app.use('/api/v1', apiRouter)

if (adminDistPath) {
  app.use('/admin', express.static(adminDistPath))
  app.get('/admin/*', (_req, res) => {
    res.sendFile(path.join(adminDistPath, 'index.html'))
  })
}

app.use(errorHandler)

export default app
