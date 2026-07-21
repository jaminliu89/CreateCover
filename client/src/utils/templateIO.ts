// 模板导出/导入（JSON 格式）
// MVP 用 JSON（通用、文件小、可读）。图片 base64 内嵌。

import type { Element } from '../data'
import type { Ratio } from '../types'

export interface CoverTemplate {
  format: 'createcover.template.v1'  // 标识 + 版本（未来兼容用）
  name: string
  ratio: Ratio
  elements: Element[]
  createdAt: number
  version: string
  appName: string
}

export function exportTemplate(
  name: string,
  ratio: Ratio,
  elements: Element[]
): CoverTemplate {
  return {
    format: 'createcover.template.v1',
    name,
    ratio,
    elements: elements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })),
    createdAt: Date.now(),
    version: '1.0.0',
    appName: 'CreateCover',
  }
}

export function exportAsJSON(template: CoverTemplate): string {
  return JSON.stringify(template, null, 2)
}

export function downloadJSON(template: CoverTemplate): void {
  const json = exportAsJSON(template)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = template.name.replace(/[^\w\u4e00-\u9fa5\-_]/g, '_').slice(0, 50)
  a.download = `${safeName}-${Date.now()}.cccover.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseTemplateJSON(text: string): CoverTemplate | null {
  try {
    const obj = JSON.parse(text)
    if (obj.format !== 'createcover.template.v1') {
      throw new Error(`不支持的格式: ${obj.format}`)
    }
    if (!Array.isArray(obj.elements)) {
      throw new Error('模板格式错误：缺少 elements')
    }
    return obj as CoverTemplate
  } catch (e) {
    console.error('解析模板失败:', e)
    return null
  }
}

export function importTemplateFile(file: File): Promise<CoverTemplate | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      resolve(parseTemplateJSON(text))
    }
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}

// 备份所有 localStorage 数据（含 userPresets + current elements）
export function backupAll(): string {
  const data = {
    format: 'createcover.backup.v1',
    exportedAt: Date.now(),
    localStorage: {} as Record<string, string>,
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('createcover')) {
      data.localStorage[key] = localStorage.getItem(key) || ''
    }
  }
  return JSON.stringify(data, null, 2)
}

export function downloadBackup(): void {
  const json = backupAll()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `createcover-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function restoreBackup(text: string): boolean {
  try {
    const data = JSON.parse(text)
    if (data.format !== 'createcover.backup.v1') return false
    for (const [key, value] of Object.entries(data.localStorage || {})) {
      localStorage.setItem(key, value as string)
    }
    return true
  } catch {
    return false
  }
}
