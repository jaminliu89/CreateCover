import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3006

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

import templatesRouter from './routes/templates.js'
import titlesRouter from './routes/titles.js'
import projectsRouter from './routes/projects.js'
import cutoutRouter from './routes/cutout.js'
import renderRouter from './routes/render.js'

app.use('/api/templates', templatesRouter)
app.use('/api/titles', titlesRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/cutout', cutoutRouter)
app.use('/api/render', renderRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), port: PORT })
})

// 生产模式：托管前端构建产物（SPA fallback）
const CLIENT_DIST = path.join(__dirname, '../../client/dist')
app.use(express.static(CLIENT_DIST))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next()
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), err => {
    if (err) next()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 CreateCover server running on http://localhost:${PORT}`)
})
