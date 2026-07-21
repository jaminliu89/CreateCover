const express = require('express')
const { templates } = require('../data/templates.js')

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

router.get('/categories', (req, res) => {
  const categories = [...new Set(templates.map(t => t.category))]
  res.json(categories)
})

router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id)
  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }
  res.json(template)
})

module.exports = router
