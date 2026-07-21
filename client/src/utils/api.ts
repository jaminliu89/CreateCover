import type { Project } from '../types'

// 开发环境用完整地址；生产环境（由后端托管）用相对路径
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3006/api' : '/api')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as any).error || `请求失败 (${res.status})`)
  }
  return res.json() as Promise<T>
}

export interface ProjectSummary {
  id: string
  name: string
  ratio: string
  thumbnail?: string
  createdAt: number
  updatedAt: number
}

export const projectApi = {
  list: () => request<ProjectSummary[]>('/projects'),
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: { name: string; ratio: string; elements: unknown[]; thumbnail?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; ratio: string; elements: unknown[]; thumbnail: string }>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
}

export default API_BASE
