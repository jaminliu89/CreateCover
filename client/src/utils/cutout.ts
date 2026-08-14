/**
 * 一键抠图 — 双模式：ONNX 深度学习（首选）+ K-means 降级（fallback）
 *
 * ONNX 模式：@imgly/background-removal ISNet 模型（浏览器内 ORT 推理）
 *   - 精度高，适合人像/产品/复杂背景
 *   - 首次需下载模型 ≈80MB，缓存后可离线
 *   - 当前状态：Web 部署因模型文件 >25MB 不可用（Cloudflare Pages 限制）
 *   - 桌面端（Electron）：ONNX 模型随应用打包，可用
 *
 * K-means 模式：纯 Canvas2D 聚类（零依赖）
 *   - 速度极快（<500ms），效果中等（简单背景好、复杂背景边缘有残留）
 *   - ONNX 不可用时自动降级
 *
 * 策略开关：
 *   mode="auto"   → 检测模型是否存在，存在走 ONNX，否则 K-means
 *   mode="onnx"   → 强制 ONNX（模型必须部署，否则会报错后 fallback）
 *   mode="kmeans" → 强制 K-means（跳过模型检测，零网络请求）
 *
 * 能力检测：detectCutoutCapability() 可在应用启动时预判抠图能力，
 *           让 UI 提前展示正确的模式标签，避免用户点抠图才看到降级提示。
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

// ---- 抠图能力预检测 ---------------------------------------------------------

/** 抠图能力级别 */
export type CutoutCapability = 'deep' | 'basic' | 'unknown'

/**
 * 预检测当前环境是否支持 ONNX 深度学习抠图。
 * - 在应用启动 / 组件挂载时调用，让 UI 提前展示正确的模式标签
 * - 检测逻辑：检查 resources.json 和模型文件是否可 FETCH（非 HTML fallback）
 * - 缓存结果，避免重复请求
 */
export function validateResourceManifest(
  manifest: Record<string, { size?: number; chunks?: Array<{ name?: string; offsets?: number[] }> }>,
  model: string
): string[] | null {
  const requiredKeys = [
    `/models/${model}`,
    '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
    '/onnxruntime-web/ort-wasm-simd-threaded.mjs',
  ]
  const chunkNames: string[] = []

  for (const key of requiredKeys) {
    const entry = manifest[key]
    if (!entry || !Number.isFinite(entry.size) || !Array.isArray(entry.chunks) || entry.chunks.length === 0) {
      return null
    }
    let expectedStart = 0
    for (const chunk of entry.chunks) {
      const [start, end] = chunk.offsets || []
      if (!chunk.name || start !== expectedStart || !Number.isFinite(end) || end <= start) return null
      chunkNames.push(chunk.name)
      expectedStart = end
    }
    if (expectedStart !== entry.size) return null
  }

  return chunkNames
}

let _capabilityCache: CutoutCapability | null = null
export async function detectCutoutCapability(): Promise<CutoutCapability> {
  if (_capabilityCache) return _capabilityCache
  try {
    const resourceURL = getAssetResourceURL('resources.json')
    const res = await fetch(resourceURL, { cache: 'no-store' })
    const ct = res.headers.get('content-type') || ''
    if (!res.ok || ct.includes('text/html')) {
      _capabilityCache = 'basic'
      return 'basic'
    }

    const manifest = await res.json()
    const chunkNames = validateResourceManifest(manifest, 'isnet_fp16')
    if (!chunkNames) {
      _capabilityCache = 'basic'
      return 'basic'
    }

    const baseURL = getAssetBaseURL()
    const chunkChecks = await Promise.all(chunkNames.map(async (name) => {
      const chunkRes = await fetch(new URL(name, baseURL), { method: 'HEAD', cache: 'no-store' })
      const chunkCt = chunkRes.headers.get('content-type') || ''
      return chunkRes.ok && !chunkCt.includes('text/html')
    }))
    _capabilityCache = chunkChecks.every(Boolean) ? 'deep' : 'basic'
    return _capabilityCache
  } catch {
    _capabilityCache = 'basic'
    return 'basic'
  }
}

/** 清除能力缓存（用在环境切换时，如 Electron → Web） */
export function resetCutoutCapabilityCache(): void {
  _capabilityCache = null
}

// ---- 降级提示（同一 session 只提示一次）---------------------------------------

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

  // mode="kmeans" 直通快速路径，跳过所有模型探测
  if (mode === 'kmeans') {
    if (!_fallbackNotified) {
      _fallbackNotified = true
      onProgress?.('⚡ 使用 K-means 模式（策略指定）')
    }
    return kmeansCutout(src, { onProgress, tolerance: options.tolerance })
  }

  // auto 模式先探测完整 manifest/chunk 契约，不完整时立即降级
  if (mode === 'auto') {
    const modelAvailable = await checkModelAvailable(preset.model, onProgress)
    if (!modelAvailable) {
      if (!_fallbackNotified) {
        _fallbackNotified = true
        onProgress?.('⚡ 使用本地抠图算法（AI 模型未部署，不影响基础抠图质量）')
      }
      return kmeansCutout(src, { onProgress, tolerance: options.tolerance })
    }
  }

  // mode="onnx" 或 auto 探测通过后走 ONNX + 5s 超时竞速
  onProgress?.('ONNX 推理中...')
  let onnxTimer: ReturnType<typeof setTimeout> | null = null
  try {
    const inputBlob = await dataUrlToBlob(src)

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

    const timeoutPromise = new Promise<Blob>((_, reject) => {
      onnxTimer = setTimeout(() => reject(new Error('ONNX 推理超时（5s）')), 5000)
    })

    const outputBlob = await Promise.race([onnxPromise, timeoutPromise])
    if (onnxTimer) clearTimeout(onnxTimer)
    onProgress?.('转换结果...')
    return blobToDataUrl(outputBlob)
  } catch (err) {
    if (onnxTimer) clearTimeout(onnxTimer)
    console.warn('[cutout] ONNX 失败，降级到 K-means:', err)
    onProgress?.('⚡ AI 模型加载失败，自动切换到本地抠图算法...')
    return kmeansCutout(src, { onProgress, tolerance: options.tolerance })
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
  const capability = await detectCutoutCapability()
  if (capability !== 'deep') {
    onProgress?.('🖥️ Web 版使用本地抠图算法（AI 模型资源未完整部署）')
    return false
  }

  // detectCutoutCapability 当前校验固定的 isnet_fp16；其他模型仍需独立确认。
  if (model !== 'isnet_fp16') {
    const modelRes = await fetch(getAssetModelURL(model), { method: 'HEAD', cache: 'no-store' })
    const contentType = modelRes.headers.get('content-type') || ''
    return modelRes.ok && !contentType.includes('text/html')
  }
  return true
}

// ===========================================================================
// 边缘采样抠图 — 纯 Canvas2D 颜色距离法，零依赖
// ===========================================================================

export interface KmeansCutoutOpts {
  onProgress?: (msg: string) => void
  tolerance?: keyof typeof CUTOUT_TOLERANCE_PRESETS
  featherSigma?: number // 羽化高斯核半径（默认 5）
}

/**
 * 背景色抠图算法
 * - 核心思路：从边缘采样背景颜色，计算每个像素与背景色的距离，距离近的设为透明
 * - 算法流程：
 *   1. 采样边缘像素，计算背景色平均值
 *   2. 对每个像素计算与背景色的距离
 *   3. 根据距离设置 alpha 值（距离近=透明，距离远=不透明）
 *   4. 边缘羽化平滑处理
 */
export async function kmeansCutout(
  dataUrl: string,
  opts: KmeansCutoutOpts = {}
): Promise<string> {
  const {
    onProgress,
    tolerance = 'mid',
    featherSigma = 5,
  } = opts

  onProgress?.('加载图片...')
  const img = await loadImage(dataUrl)

  // 缩放大图到 1000px 以内（性能优化）
  let w = img.naturalWidth
  let h = img.naturalHeight
  if (w <= 0 || h <= 0) throw new Error('图片尺寸无效')
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
  const srcData = imageData.data

  onProgress?.('分析边缘颜色...')

  // 1. 采样边缘像素，计算背景色平均值
  const edgePixels: number[][] = []
  const margin = Math.max(2, Math.floor(Math.min(w, h) * 0.05)) // 边缘采样宽度 5%
  
  // 上边和下边
  for (let y = 0; y < margin; y++) {
    for (let x = 0; x < w; x += 2) {
      edgePixels.push(sampleRGB(imageData, x, y))
      edgePixels.push(sampleRGB(imageData, x, h - 1 - y))
    }
  }
  // 左边和右边
  for (let x = 0; x < margin; x++) {
    for (let y = 0; y < h; y += 2) {
      edgePixels.push(sampleRGB(imageData, x, y))
      edgePixels.push(sampleRGB(imageData, w - 1 - x, y))
    }
  }
  
  if (edgePixels.length === 0) throw new Error('无法采样图片边缘像素')

  // 计算背景色平均值
  let bgR = 0, bgG = 0, bgB = 0
  for (const [r, g, b] of edgePixels) {
    bgR += r
    bgG += g
    bgB += b
  }
  bgR = Math.round(bgR / edgePixels.length)
  bgG = Math.round(bgG / edgePixels.length)
  bgB = Math.round(bgB / edgePixels.length)
  
  onProgress?.('识别背景区域...')

  // 2. 根据容差预设计算阈值
  const preset = CUTOUT_TOLERANCE_PRESETS[tolerance]
  const hardThreshold = preset.hard
  const featherThreshold = preset.feather

  // 3. 对每个像素计算与背景色的距离，设置 alpha 值
  const output = ctx.createImageData(w, h)
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const r = srcData[idx]
      const g = srcData[idx + 1]
      const b = srcData[idx + 2]
      
      // 计算颜色距离（欧几里得距离）
      const dr = r - bgR
      const dg = g - bgG
      const db = b - bgB
      const distance = Math.sqrt(dr * dr + dg * dg + db * db)
      
      // 根据距离设置 alpha 值
      let alpha: number
      if (distance <= hardThreshold) {
        alpha = 0 // 背景：完全透明
      } else if (distance >= featherThreshold) {
        alpha = 255 // 前景：完全不透明
      } else {
        // 过渡区域：线性插值
        alpha = Math.round(((distance - hardThreshold) / (featherThreshold - hardThreshold)) * 255)
      }
      
      output.data[idx] = r
      output.data[idx + 1] = g
      output.data[idx + 2] = b
      output.data[idx + 3] = alpha
    }
  }

  // 4. 高斯平滑（去锯齿边缘）
  onProgress?.('平滑边缘...')
  if (featherSigma > 0) {
    gaussianBlurAlpha(output, w, h, featherSigma)
  }

  onProgress?.('缩放回原始尺寸...')

  // 5. 写回 Canvas 并缩放回原始尺寸
  const outCanvas = document.createElement('canvas')
  outCanvas.width = w
  outCanvas.height = h
  outCanvas.getContext('2d')!.putImageData(output, 0, 0)

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = img.naturalWidth
  resultCanvas.height = img.naturalHeight
  const resultCtx = resultCanvas.getContext('2d')!
  resultCtx.drawImage(outCanvas, 0, 0, resultCanvas.width, resultCanvas.height)

  onProgress?.('完成 ✅')
  return resultCanvas.toDataURL('image/png')
}

// ===========================================================================
// 内部辅助函数
// ===========================================================================

/** 在 (x, y) 处采样 RGB */
function sampleRGB(imgData: ImageData, x: number, y: number): number[] {
  const idx = (Math.min(y, imgData.height - 1) * imgData.width + Math.min(x, imgData.width - 1)) * 4
  return [imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2]]
}

/** 根据颜色距离计算 alpha 值（容差映射） */
export function alphaForDistance(distance: number, tolerance: keyof typeof CUTOUT_TOLERANCE_PRESETS): number {
  const feat = CUTOUT_TOLERANCE_PRESETS[tolerance]
  const t0 = feat.hard
  const t1 = Math.max(t0 + 1, feat.feather)
  if (distance <= t0) return 0
  if (distance >= t1) return 255
  return Math.round(((distance - t0) / (t1 - t0)) * 255)
}

/** Alpha 通道高斯模糊 */
export function gaussianBlurAlpha(imgData: ImageData, w: number, h: number, sigma: number) {
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
      imgData.data[(y * w + x) * stride + 3] = kw > 0 ? sum / kw : tmp[(y * w + x) * stride + 3]
    }
  }
}
