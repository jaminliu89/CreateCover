import express from 'express'
import { titleCategories, titleFormulas, hotWords } from '../data/titles.js'
import type { TitleGenerateResponse } from '../types.js'

const router = express.Router()

router.get('/library', (req, res) => {
  res.json(titleCategories)
})

router.post('/generate', (req, res) => {
  const { keyword, count = 8 } = req.body
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' })
  }
  
  const results: TitleGenerateResponse['titles'] = []
  
  for (let i = 0; i < count; i++) {
    const formula = titleFormulas[i % titleFormulas.length]
    const number = Math.floor(Math.random() * 9) + 3
    const number2 = Math.floor(Math.random() * number) + 1
    
    let content = formula
      .replace(/{keyword}/g, keyword)
      .replace(/{number}/g, String(number))
      .replace(/{number2}/g, String(number2))
    
    const score = calculateCTRScore(content)
    const tags = generateTags(content, score)
    const advice = generateAdvice(content, score)
    
    results.push({ content, score, tags, advice })
  }
  
  results.sort((a, b) => b.score - a.score)
  
  res.json({ titles: results })
})

function calculateCTRScore(title: string): number {
  let score = 75
  
  if (/\d+/.test(title)) score += 6
  
  if (/[!?！？]/.test(title)) score += 5
  
  const matchedHotWords = hotWords.filter(word => title.includes(word))
  score += matchedHotWords.length * 3
  
  const len = title.length
  if (len >= 12 && len <= 24) score += 5
  else if (len < 8) score -= 8
  else if (len > 30) score -= 5
  
  score += (Math.random() - 0.5) * 4
  
  return Math.max(50, Math.min(99, Math.round(score)))
}

function generateTags(title: string, score: number): string[] {
  const tags: string[] = []
  
  if (score >= 90) tags.push('🔥 爆款')
  else if (score >= 80) tags.push('✨ 优质')
  else if (score >= 70) tags.push('👍 不错')
  
  if (/\d+/.test(title)) tags.push('有数字')
  if (/[!?！？]/.test(title)) tags.push('有情绪')
  
  const matchedHotWords = hotWords.filter(word => title.includes(word))
  if (matchedHotWords.length > 0) tags.push('含热词')
  
  return tags
}

function generateAdvice(title: string, score: number): string {
  const advices: string[] = []
  
  if (!/\d+/.test(title)) {
    advices.push('建议加入数字提升吸引力')
  }
  
  if (!/[!?！？]/.test(title)) {
    advices.push('可以加入感叹号增强情绪')
  }
  
  if (title.length < 10) {
    advices.push('标题稍短，可适当补充关键词')
  } else if (title.length > 28) {
    advices.push('标题稍长，建议精简到24字内')
  }
  
  if (advices.length === 0) {
    advices.push('标题结构优秀，直接使用即可')
  }
  
  return advices.join('；')
}

export default router
