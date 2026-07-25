/**
 * 统一静态资源基路径
 *
 * 作用：所有 publicPath / resources.json / 模型探测 的路径拼接统一入口。
 * 兼容根路径 / 子路径。
 *
 *   getAssetBaseURL()                           → "https://domain.com/" 或 "http://127.0.0.1:5199/"
 *   getAssetModelURL("isnet_fp16")              → "https://domain.com/models/isnet_fp16"
 *   getAssetResourceURL("resources.json")       → "https://domain.com/resources.json"
 */

/** 获取静态资源基路径（末尾始终带 /） */
export function getAssetBaseURL(): string {
  // Vite BASE_URL： "/" 或 "/cover/"（带 / 前缀）
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')

  // file 协议下 origin 可能是 "null" 或空，做兜底
  const origin =
    typeof window !== 'undefined' &&
    window.location.origin &&
    window.location.origin !== 'null'
      ? window.location.origin
      : ''

  return `${origin}${base}`
}

/** 拼接模型文件的完整 URL */
export function getAssetModelURL(model: string): string {
  return new URL(`models/${model}`, getAssetBaseURL()).toString()
}

/** 拼接资源清单文件的完整 URL */
export function getAssetResourceURL(name: string): string {
  return new URL(name, getAssetBaseURL()).toString()
}
