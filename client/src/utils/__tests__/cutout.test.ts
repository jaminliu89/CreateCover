import { describe, expect, it } from 'vitest'
import {
  alphaForDistance,
  gaussianBlurAlpha,
  validateResourceManifest,
} from '../cutout'

function makeImageData(width: number, height: number, alphas: number[]): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  alphas.forEach((alpha, index) => {
    data[index * 4 + 3] = alpha
  })
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

describe('抠图容差', () => {
  it('不同容差产生不同透明度', () => {
    expect(alphaForDistance(25, 'low')).toBeGreaterThan(alphaForDistance(25, 'mid'))
    expect(alphaForDistance(40, 'mid')).toBeGreaterThan(alphaForDistance(40, 'high'))
    expect(alphaForDistance(60, 'high')).toBeGreaterThan(alphaForDistance(60, 'ultra'))
  })

  it('阈值使用 RGB 距离原始单位', () => {
    expect(alphaForDistance(18, 'low')).toBe(0)
    expect(alphaForDistance(28, 'low')).toBe(255)
  })
})

describe('gaussianBlurAlpha', () => {
  it('纵向 pass 会影响上下相邻像素', () => {
    const imageData = makeImageData(1, 3, [0, 255, 0])
    gaussianBlurAlpha(imageData, 1, 3, 1)
    expect(imageData.data[3]).toBeGreaterThan(0)
    expect(imageData.data[11]).toBeGreaterThan(0)
    expect(imageData.data[7]).toBeLessThan(255)
  })
})

describe('validateResourceManifest', () => {
  const validManifest = {
    '/models/isnet_fp16': {
      size: 4,
      chunks: [{ name: 'model-a', offsets: [0, 4] }],
    },
    '/onnxruntime-web/ort-wasm-simd-threaded.wasm': {
      size: 4,
      chunks: [{ name: 'wasm-a', offsets: [0, 2] }, { name: 'wasm-b', offsets: [2, 4] }],
    },
    '/onnxruntime-web/ort-wasm-simd-threaded.mjs': {
      size: 2,
      chunks: [{ name: 'mjs-a', offsets: [0, 2] }],
    },
  }

  it('完整 manifest 返回真实 chunk 名称', () => {
    expect(validateResourceManifest(validManifest, 'isnet_fp16')).toEqual([
      'model-a', 'wasm-a', 'wasm-b', 'mjs-a',
    ])
  })

  it('缺少模型条目时拒绝 deep 能力', () => {
    const manifest = { ...validManifest }
    delete (manifest as any)['/models/isnet_fp16']
    expect(validateResourceManifest(manifest, 'isnet_fp16')).toBeNull()
  })

  it('chunk offsets 不连续时拒绝 deep 能力', () => {
    const manifest = structuredClone(validManifest)
    manifest['/onnxruntime-web/ort-wasm-simd-threaded.wasm'].chunks[1].offsets = [3, 4]
    expect(validateResourceManifest(manifest, 'isnet_fp16')).toBeNull()
  })
})
