import express from 'express'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const UPLOAD_DIR = path.join(__dirname, '../../uploads')

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

router.post('/', async (req, res) => {
  const startTime = Date.now()
  
  try {
    const { image } = req.body
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }

    // 早 reject: 限制整段 body 体积避免吃光内存
    if (image.length > 14 * 1024 * 1024) {
      return res.status(400).json({ error: '图片大小不能超过 10MB' })
    }

    const ALLOWED_MIMES = ['data:image/png', 'data:image/jpeg', 'data:image/webp']
    if (!ALLOWED_MIMES.some(m => image.startsWith(m))) {
      return res.status(400).json({ error: '仅支持 PNG / JPG / WebP 图片' })
    }

    await ensureUploadDir()

    let buffer: Buffer
    const base64Data = image.split(',')[1]
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid image data' })
    }
    buffer = Buffer.from(base64Data, 'base64')

    const MAX_SIZE = 15 * 1024 * 1024 // base64 解码后约 15MB ≈ 原始 10MB+
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ error: '图片大小不能超过 10MB' })
    }
    
    const resultBuffer = await processCutout(buffer)
    
    const filename = `cutout-${Date.now()}.png`
    const filepath = path.join(UPLOAD_DIR, filename)
    await fs.writeFile(filepath, resultBuffer)
    
    const processingTime = Date.now() - startTime
    
    res.json({
      success: true,
      cutoutUrl: `/uploads/${filename}`,
      processingTime,
    })
  } catch (error) {
    console.error('Cutout error:', error)
    res.status(500).json({ error: 'Cutout processing failed' })
  }
})

async function processCutout(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata()
  const width = Math.min(metadata.width || 1000, 1000)
  const height = Math.min(metadata.height || 1000, 1000)
  
  const { data, info } = await sharp(buffer)
    .resize(width, height, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  
  const pixels = new Uint8ClampedArray(data)
  const sampleColors = sampleBackgroundColors(pixels, info.width, info.height)
  const backgroundCenters = kMeansClustering(sampleColors, 3)
  
  const alphaData = calculateAlphaMap(pixels, info.width, info.height, backgroundCenters)
  
  smoothAlphaEdges(alphaData, info.width, info.height)
  
  const rgbaBuffer = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    rgbaBuffer[i * 4] = pixels[i * 3]
    rgbaBuffer[i * 4 + 1] = pixels[i * 3 + 1]
    rgbaBuffer[i * 4 + 2] = pixels[i * 3 + 2]
    rgbaBuffer[i * 4 + 3] = alphaData[i]
  }
  
  return await sharp(rgbaBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer()
}

function sampleBackgroundColors(pixels: Uint8ClampedArray, width: number, height: number): number[][] {
  const samples: number[][] = []
  const step = 5
  
  for (let x = 0; x < width; x += step) {
    samples.push(getPixel(pixels, x, 0, width))
    samples.push(getPixel(pixels, x, height - 1, width))
  }
  
  for (let y = 0; y < height; y += step) {
    samples.push(getPixel(pixels, 0, y, width))
    samples.push(getPixel(pixels, width - 1, y, width))
  }
  
  const corners = [
    [10, 10],
    [width - 10, 10],
    [10, height - 10],
    [width - 10, height - 10],
    [Math.floor(width / 2), 10],
    [Math.floor(width / 2), height - 10],
  ]
  
  for (const [x, y] of corners) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      samples.push(getPixel(pixels, x, y, width))
    }
  }
  
  return samples
}

function getPixel(pixels: Uint8ClampedArray, x: number, y: number, width: number): number[] {
  const idx = (y * width + x) * 3
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2]]
}

function kMeansClustering(samples: number[][], k: number): number[][] {
  let centers: number[][] = []
  const used = new Set<number>()
  
  for (let i = 0; i < k && i < samples.length; i++) {
    let idx: number
    do {
      idx = Math.floor(Math.random() * samples.length)
    } while (used.has(idx) && used.size < samples.length)
    used.add(idx)
    centers.push([...samples[idx]])
  }
  
  for (let iter = 0; iter < 12; iter++) {
    const clusters: number[][][] = Array.from({ length: k }, () => [])
    
    for (const sample of samples) {
      let minDist = Infinity
      let bestCluster = 0
      
      for (let i = 0; i < centers.length; i++) {
        const dist = colorDistance(sample, centers[i])
        if (dist < minDist) {
          minDist = dist
          bestCluster = i
        }
      }
      
      clusters[bestCluster].push(sample)
    }
    
    let changed = false
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const newCenter = [0, 0, 0]
        for (const p of clusters[i]) {
          newCenter[0] += p[0]
          newCenter[1] += p[1]
          newCenter[2] += p[2]
        }
        newCenter[0] = Math.round(newCenter[0] / clusters[i].length)
        newCenter[1] = Math.round(newCenter[1] / clusters[i].length)
        newCenter[2] = Math.round(newCenter[2] / clusters[i].length)
        
        if (colorDistance(newCenter, centers[i]) > 1) {
          changed = true
          centers[i] = newCenter
        }
      }
    }
    
    if (!changed) break
  }
  
  return centers
}

function colorDistance(c1: number[], c2: number[]): number {
  const dr = c1[0] - c2[0]
  const dg = c1[1] - c2[1]
  const db = c1[2] - c2[2]
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db)
}

function calculateAlphaMap(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  backgroundCenters: number[][]
): Uint8Array {
  const alphaData = new Uint8Array(width * height)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixel = getPixel(pixels, x, y, width)
      
      let minDist = Infinity
      for (const center of backgroundCenters) {
        const dist = colorDistance(pixel, center)
        if (dist < minDist) {
          minDist = dist
        }
      }
      
      if (minDist < 25) {
        alphaData[idx] = 0
      } else if (minDist < 60) {
        const t = (minDist - 25) / 35
        alphaData[idx] = Math.round(t * 255)
      } else {
        alphaData[idx] = 255
      }
    }
  }
  
  return alphaData
}

function smoothAlphaEdges(alphaData: Uint8Array, width: number, height: number) {
  const temp = new Uint8Array(alphaData)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      
      if (alphaData[idx] > 0 && alphaData[idx] < 255) {
        let sum = 0
        let count = 0
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = (y + dy) * width + (x + dx)
            sum += temp[nidx]
            count++
          }
        }
        
        alphaData[idx] = Math.round(sum / count)
      }
    }
  }
}

export default router
