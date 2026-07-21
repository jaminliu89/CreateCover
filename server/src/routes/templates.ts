import express from 'express'
import { templates } from '../data/templates.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { ratio, category } = req.query
  
  let filtered = [...templates]
  
  if (ratio) {
    filtered = filtered.filter(t => t.ratio === ratio)
  }
  if (category) {
    filtered = filtered.filter(t => t.category === category)
  }
  
  res.json(filtered)
})

router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id)
  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }
  res.json(template)
})

export default router
