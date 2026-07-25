/**
 * 一键抠图 — 双模式：ONNX 深度学习（首选）+ K-means 降级（fallback）
 *
 * ONNX 模式：@imgly/background-removal ISNet 模型（浏览器内 ORT 推理）
 *   - 精度高，适合人像/产品/复杂背景
 *   - 首次需下载模型 ≈80MB，缓存后可离线
 *
 * K-means 模式：纯 Canvas2D 聚类（零依赖）
 *   - 速度极快（<500ms），效果中等（简单背景好、复杂背景边缘有残留）
 *   - ONNX 不可用时自动降级
 *
 * 策略开关：
 *   mode="auto"   → 检测模型是否存在，存在走 ONNX，否则 K-means
 *   mode="onnx"   → 强制 ONNX（模型必须部署，否则会报错后 fallback）
 *   mode="kmeans" → 强制 K-means（跳过模型检测，零网络请求）
 */

import { removeBackground } from '@imgly/background-removal'
import { getAssetBaseURL, getAssetResourceURL, getAssetModelURL } from './assetBase'

// ---- API 签名 -------------------------------------------------------------

/** 抠图策略：auto=自动探测，onnx=强制 ONNX，kmeans=强制 K-means */
export type CutoutMode = 'auto' | 'onnx' | 'kmeans'

export const CUTOUT_TOLERANCE_PRESETS = {
  low:    { hard: 18, feather: 28, model: 'isnet_fp16' as const },
  mid:    { hard: 30, feather: 50, model: 'isnet_fp16' as const },
  high:   { hard: 45, feather: 80, model: 'isnet_fp16' as const },
  ultra:  { hard: 65, feather: 120, model: 'isnet_fp16' as const },
}

export interface CutoutOptions {
  tolerance?: keyof typeof CUTOUT_TOLERANCE_PRESETS
  onProgress?: (msg: string) => void
  /** 抠图策略，默认 "auto"。可在调试 / A/B 测试时强制指定 */
  mode?: CutoutMode
}

// 是否已提示过降级（同一 session 只提示一次）
let _fallbackNotified = false

// ---- dataURL ↔ Blob -------------------------------------------------------

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Blob → dataURL 转换失败'))
    reader.readAsDataURL(blob)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 防止 Canvas 跨域污染（data: 和 blob: URL 不受影响，但外部 URL 需要）
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })
}

// ===========================================================================
// 主抠图函数 — 自动降级
// ===========================================================================

export async function cutoutImageLocal(
  src: string,
  options: CutoutOptions = {}
): Promise<string> {
  const onProgress = options.onProgress
  const preset = CUTOUT_TOLERANCE_PRESETS[options.tolerance ?? 'mid']
  const mode = options.mode ?? 'auto'

  // ── 诊断：分支定位 ──
  const cutlog = (msg: string) => console.log(`[cutout:diag] ${msg}`)
  cutlog('=== cutoutImageLocal entry ===')
  cutlog(`BASE_URL=${import.meta.env.BASE_URL}`)
  cutlog(`origin=${window.location.origin}`)
  cutlog(`mode=${mode}`)
  cutlog(`model=${preset.model}`)
  cutlog(`tolerance=${options.tolerance ?? 'mid'}`)
  cutlog(`src length=${src?.length ?? 0}`)
  cutlog(`src prefix=${src?.substring(0, 50) ?? 'EMPTY'}`)

  // ── 策略开关：mode === 'kmeans' 直通快速路径，跳过所有网络探测 ──
  if (mode === 'kmeans') {
    if (!_fallbackNotified) {
      _fallbackNotified = true
      onProgress?.('⚡ 使用 K-means 模式（策略指定）')
    }
    return kmeansCutout(src, { onProgress })
  }

  // ── mode === 'auto' 时探测模型是否可用 ──
  if (mode === 'auto') {
    cutlog('mode=auto: checking model availability...')
    const modelAvailable = await checkModelAvailable(preset.model, onProgress)
    cutlog(`mode=auto: modelAvailable=${modelAvailable}`)
    if (!modelAvailable) {
      cutlog('mode=auto: model NOT available → fallback to kmeans')
      if (!_fallbackNotified) {
        _fallbackNotified = true
        onProgress?.('⚡ 使用 K-means 降级模式（本地算法）')
      }
      return kmeansCutout(src, { onProgress })
    }
    cutlog('mode=auto: model IS available → proceed to ONNX')
  }

  // ── mode === 'onnx' 或 auto 探测通过后走 ONNX + 5s 超时竞速 ──
  cutlog('entering ONNX path...')
  onProgress?.('ONNX 推理中...')
  let onnxTimer: any = null
  try {
    const inputBlob = await dataUrlToBlob(src)
    cutlog(`dataUrlToBlob done, blob size=${inputBlob.size}`)

    const onnxPromise = removeBackground(inputBlob, {
      model: preset.model,
      publicPath: getAssetBaseURL(),
      output: { format: 'image/png', quality: 1 },
      proxyToWorker: true,
      device: 'gpu',
      progress: (_key, current, total) => {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0
        onProgress?.(`AI 推理中... ${pct}%`)
      },
    })

    // 超时竞速：ONNX 超 5s 自动切换 K-means
    const timeoutPromise = new Promise<string>((_, reject) => {
      onnxTimer = setTimeout(() => reject(new Error('ONNX 推理超时（5s）')), 5000)
    })

    cutlog('racing ONNX vs 5s timeout...')
    const outputBlob = (await Promise.race([onnxPromise, timeoutPromise])) as Blob
    clearTimeout(onnxTimer)
    cutlog(`ONNX race won, outputBlob size=${outputBlob.size}, type=${outputBlob.type}`)
    onProgress?.('转换结果...')
    const result = blobToDataUrl(outputBlob)
    cutlog('ONNX success, returning dataURL')
    return result
  } catch (err) {
    if (onnxTimer) clearTimeout(onnxTimer)
    cutlog(`ONNX FAILED: ${err instanceof Error ? err.message : String(err)}`)
    if (err instanceof Error && err.stack) cutlog(`ONNX stack: ${err.stack.split('\n').slice(0, 3).join(' | ')}`)
    console.warn('[cutout] ONNX 失败，降级到 K-means:', err)
    onProgress?.('⚡ ONNX 不可用，切换到 K-means 降级模式...')
    cutlog('→ falling back to kmeans')
    return kmeansCutout(src, { onProgress })
  }
}

/** 检测 ONNX 模型资源是否可用（走 assetBaseURL，兼容子路径 / file://）
 *
 * 注意：Cloudflare Pages 会对所有不存在的路径返回 SPA 的 index.html（HTTP 200），
 * 所以不能只查 res.ok，必须验证 content-type 不是 text/html。
 */
async function checkModelAvailable(
  model: string,
  onProgress?: (msg: string) => void
): Promise<boolean> {
  const cutlog = (msg: string) => console.log(`[cutout:diag] ${msg}`)
  try {
    const resourceURL = getAssetResourceURL('resources.json')
    cutlog(`checkModel: fetching ${resourceURL}`)
    const res = await fetch(resourceURL, {
      method: 'HEAD',
      cache: 'no-store',
    })
    const ct = res.headers.get('content-type') || ''
    const cl = res.headers.get('content-length') || 'unknown'
    cutlog(`checkModel: resources.json status=${res.status} ct=${ct} cl=${cl}`)
    if (!res.ok || ct.includes('text/html')) {
      onProgress?.(`模型资源未部署（status=${res.status}）`)
      cutlog(`checkModel: resources.json NOT OK or HTML fallback → return false`)
      return false
    }

    const modelURL = getAssetModelURL(model)
    cutlog(`checkModel: fetching ${modelURL}`)
    const res2 = await fetch(modelURL, {
      method: 'HEAD',
      cache: 'no-store',
    })
    const ct2 = res2.headers.get('content-type') || ''
    const cl2 = res2.headers.get('content-length') || 'unknown'
    cutlog(`checkModel: model HEAD status=${res2.status} ct=${ct2} cl=${cl2}`)
    if (!res2.ok || ct2.includes('text/html')) {
      onProgress?.(`模型文件 ${model} 缺失（status=${res2.status}）`)
      cutlog(`checkModel: model NOT OK or HTML fallback → return false`)
      return false
    }
    cutlog('checkModel: BOTH available → return true')
    return true
  } catch (e) {
    cutlog(`checkModel: CAUGHT ${e instanceof Error ? e.message : String(e)}`)
    return false
  }
}

// ===========================================================================
// K‑means 抠图 — 纯 Canvas2D 聚类，零依赖
// ===========================================================================

export interface KmeansCutoutOpts {
  onProgress?: (msg: string) => void
  k?: number            // 聚类数（默认 3）
  maxIter?: number      // 最大迭代（默认 12）
  sampleThin?: number   // 边缘采样间隔（默认 2）
  edgeRatio?: number    // 边缘采样区域比例（默认 2%）
  featherSigma?: number // 羽化高斯核半径（默认 5）
}

/**
 * K‑means 抠图（基于 V2 原型算法 + k-means++ 初始化）
 * - 边缘采样（四边 + 四角）→ k-means++ 聚类 → 双阈值距离判定 → alpha 羽化 → 高斯平滑
 */
export async function kmeansCutout(
  dataUrl: string,
  opts: KmeansCutoutOpts = {}
): Promise<string> {
  console.log('[cutout:diag] kmeansCutout ENTER')
  const {
    onProgress,
    k = 3,
    maxIter = 12,
    sampleThin = 2,
    edgeRatio = 0.02,
    featherSigma = 5,
  } = opts

  onProgress?.('加载图片...')
  const img = await loadImage(dataUrl)

  // 缩放大图到 1000px 以内（性能优化）
  let w = img.naturalWidth
  let h = img.naturalHeight
  const MAX_SIZE = 1000
  if (w > MAX_SIZE || h > MAX_SIZE) {
    const scale = Math.min(MAX_SIZE / w, MAX_SIZE / h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)

  onProgress?.('采样边缘像素...')

  // 1. 边缘采样（四边 + 四角 各 N 点）
  const edgePixels: number[][] = []
  const margin = Math.floor(Math.min(w, h) * edgeRatio)
  for (let y = 0; y < h; y += sampleThin) {
    for (let x = 0; x < margin; x += sampleThin) {
      edgePixels.push(sampleRGB(imageData, x, y))
      edgePixels.push(sampleRGB(imageData, w - 1 - x, y))
    }
  }
  for (let x = 0; x < w; x += sampleThin) {
    for (let y = 0; y < margin; y += sampleThin) {
      edgePixels.push(sampleRGB(imageData, x, y))
      edgePixels.push(sampleRGB(imageData, x, h - 1 - y))
    }
  }

  onProgress?.('K‑means 聚类...')

  // 2. k-means++ 初始化
  const centroids = kmeansPPInit(edgePixels, k)

  // 3. 迭代聚类
  const { labels } = kmeansIterate(edgePixels, centroids, maxIter)

  // 4. 找背景簇（亮度最高/饱和度最低的边缘簇 = 背景）
  const bgLabel = findBgCluster(edgePixels, labels, k)

  // 5. 双阈值距离判定（t0 = 绝对背景，t1 = 羽化过渡）
  const feat = CUTOUT_TOLERANCE_PRESETS[opts.onProgress ? 'mid' : 'low']
  const t0 = feat.hard / 100
  const t1 = Math.min(feat.feather / 100, 0.85)

  // 计算背景簇中心到各像素的距离
  const bgCenter = centroids[bgLabel]
  const output = ctx.createImageData(w, h)
  const srcData = imageData.data

  onProgress?.('羽化边缘...')

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const [r, g, b] = [srcData[idx], srcData[idx + 1], srcData[idx + 2]]
      const dist = colorDistance([r, g, b], bgCenter)

      let alpha: number
      if (dist <= t0) {
        alpha = 0                      // 背景 → 透明
      } else if (dist >= t1) {
        alpha = 255                    // 前景 → 不透明
      } else {
        alpha = Math.round(((dist - t0) / (t1 - t0)) * 255)  // 渐过渡
      }

      output.data[idx] = r
      output.data[idx + 1] = g
      output.data[idx + 2] = b
      output.data[idx + 3] = alpha
    }
  }

  // 6. 高斯平滑（去锯齿边缘）
  if (featherSigma > 0) {
    onProgress?.('平滑边缘...')
    gaussianBlurAlpha(output, w, h, featherSigma)
  }

  // 7. 写回 Canvas
  const outCanvas = document.createElement('canvas')
  outCanvas.width = w
  outCanvas.height = h
  outCanvas.getContext('2d')!.putImageData(output, 0, 0)

  onProgress?.('缩放回原始尺寸...')
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = img.naturalWidth
  resultCanvas.height = img.naturalHeight
  const resultCtx = resultCanvas.getContext('2d')!
  resultCtx.drawImage(outCanvas, 0, 0, resultCanvas.width, resultCanvas.height)

  onProgress?.('完成 ✅')
  return resultCanvas.toDataURL('image/png')
}

// ===========================================================================
// K‑means 内部算法
// ===========================================================================

/** 在 (x, y) 处采样 RGB */
function sampleRGB(imgData: ImageData, x: number, y: number): number[] {
  const idx = (Math.min(y, imgData.height - 1) * imgData.width + Math.min(x, imgData.width - 1)) * 4
  return [imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2]]
}

/** 欧几里得颜色距离 */
function colorDistance(a: number[], b: number[]): number {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/** k-means++ 初始化 */
function kmeansPPInit(points: number[][], k: number): number[][] {
  const centroids: number[][] = [points[Math.floor(Math.random() * points.length)]]
  while (centroids.length < k) {
    const dists = points.map(p => Math.min(...centroids.map(c => colorDistance(p, c))))
    const total = dists.reduce((s, d) => s + d * d, 0)
    let r = Math.random() * total
    for (let i = 0; i < points.length; i++) {
      r -= dists[i] * dists[i]
      if (r <= 0) { centroids.push(points[i]); break }
    }
  }
  return centroids
}

/** K-means 迭代聚类 */
function kmeansIterate(points: number[][], centroids: number[][], maxIter: number): { centroids: number[][]; labels: number[] } {
  let bestCentroids = centroids
  const labels = new Array(points.length)
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false
    // Assign
    for (let i = 0; i < points.length; i++) {
      let minDist = Infinity, bestLabel = 0
      for (let j = 0; j < bestCentroids.length; j++) {
        const d = colorDistance(points[i], bestCentroids[j])
        if (d < minDist) { minDist = d; bestLabel = j }
      }
      if (labels[i] !== bestLabel) { labels[i] = bestLabel; changed = true }
    }
    if (!changed) break
    // Update
    for (let j = 0; j < bestCentroids.length; j++) {
      const members = points.filter((_, i) => labels[i] === j)
      if (members.length === 0) continue
      const avg = [0, 0, 0]
      for (const m of members) { avg[0] += m[0]; avg[1] += m[1]; avg[2] += m[2] }
      bestCentroids[j] = avg.map(v => Math.round(v / members.length))
    }
  }
  return { centroids: bestCentroids, labels }
}

/** 找背景簇（亮度最高 + 面积最小的边缘簇是背景） */
function findBgCluster(points: number[][], labels: number[], k: number): number {
  const clusterBrightness = new Array(k).fill(0)
  const clusterCount = new Array(k).fill(0)
  for (let i = 0; i < points.length; i++) {
    const lum = 0.299 * points[i][0] + 0.587 * points[i][1] + 0.114 * points[i][2]
    clusterBrightness[labels[i]] += lum
    clusterCount[labels[i]]++
  }
  let bg = 0, maxScore = -Infinity
  for (let j = 0; j < k; j++) {
    const avgBrightness = clusterBrightness[j] / (clusterCount[j] || 1)
    // try to take the smallest and brightest cluster
    const score = avgBrightness - clusterCount[j] / points.length * 200
    if (score > maxScore) { maxScore = score; bg = j }
  }
  return bg
}

/** Alpha 通道高斯模糊 */
function gaussianBlurAlpha(imgData: ImageData, w: number, h: number, sigma: number) {
  const radius = Math.ceil(sigma * 2)
  const kernel: number[] = []
  let sum = 0
  for (let i = -radius; i <= radius; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma))
    kernel.push(v); sum += v
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum

  const src = new Uint8ClampedArray(imgData.data)
  const stride = 4

  // X pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, kw = 0
      for (let k = 0; k < kernel.length; k++) {
        const sx = x + k - radius
        if (sx < 0 || sx >= w) continue
        sum += src[(y * w + sx) * stride + 3] * kernel[k]
        kw += kernel[k]
      }
      imgData.data[(y * w + x) * stride + 3] = sum / kw
    }
  }

  // Y pass
  const tmp = new Uint8ClampedArray(imgData.data)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0, kw = 0
      for (let k = 0; k < kernel.length; k++) {
        const sy = y + k - radius
        if (sy < 0 || sy >= h) continue
        sum += tmp[(sy * w + x) * stride + 3] * kernel[k]
        kw += kernel[k]
      }
      // 只在 alpha 通道上平滑（抑制背景残留）
      imgData.data[(y * w + x) * stride + 3] = Math.max(0, imgData.data[(y * w + x) * stride + 3])
    }
  }
}
