import React, { useEffect, useState } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { projectApi, type ProjectSummary } from '../utils/api'
import { X, FolderOpen, Trash2, Save, FilePlus2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { Ratio } from '../types'
import type { Element } from '../data'

/** 截取当前画布作为项目缩略图（低分辨率 JPEG，~10KB） */
async function captureThumbnail(): Promise<string | undefined> {
  try {
    const el = document.getElementById('cover-canvas') as HTMLElement
    if (!el) return undefined
    const canvas = await html2canvas(el, {
      scale: 0.12, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false, imageTimeout: 5000,
    })
    return canvas.toDataURL('image/jpeg', 0.55)
  } catch { return undefined }
}

interface Props {
  mode: 'save' | 'open'
  onClose: () => void
}

const ProjectManager: React.FC<Props> = ({ mode, onClose }) => {
  const { elements, ratio, currentProjectId, currentProjectName, loadProject, dirty } = useEditorStore()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveName, setSaveName] = useState(currentProjectName)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    if (mode === 'open') {
      setLoading(true)
      projectApi.list()
        .then(setProjects)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [mode])

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const thumbnail = await captureThumbnail()
      if (currentProjectId) {
        await projectApi.update(currentProjectId, {
          name: saveName.trim(),
          ratio,
          elements,
          thumbnail,
        })
        loadProject(currentProjectId, saveName.trim(), ratio, elements)
      } else {
        const created = await projectApi.create({
          name: saveName.trim(),
          ratio,
          elements,
          thumbnail,
        })
        loadProject(created.id, created.name, created.ratio as Ratio, created.elements as Element[])
      }
      setSavedOk(true)
      setTimeout(onClose, 600)
    } catch (e: any) {
      setError(e.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleOpen = async (id: string) => {
    if (dirty && !window.confirm('当前项目有未保存的修改，确定要打开其他项目吗？')) return
    setLoading(true)
    setError(null)
    try {
      const project = await projectApi.get(id)
      loadProject(project.id, project.name, project.ratio as Ratio, project.elements as Element[])
      onClose()
    } catch (e: any) {
      setError(e.message || '打开失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('确定删除这个项目吗？删除后不可恢复。')) return
    try {
      await projectApi.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setError(e.message || '删除失败')
    }
  }

  const handleNew = () => {
    if (dirty && !window.confirm('当前项目有未保存的修改，确定要新建项目吗？')) return
    loadProject(null, '未命名项目', '9:16', [])
    onClose()
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'save' ? '保存项目' : '我的项目'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {mode === 'save' ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">项目名称</label>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="给这个封面起个名字"
                maxLength={50}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <p className="text-xs text-gray-400">
              {currentProjectId ? '保存将覆盖已打开的项目' : '将创建一个新项目'} · 共 {elements.length} 个元素 · {ratio} 比例
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? '保存中...' : savedOk ? '已保存 ✓' : '保存'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <button
                onClick={handleNew}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all font-medium flex items-center justify-center gap-2"
              >
                <FilePlus2 size={16} />
                新建空白项目
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">还没有保存过项目</p>
                  <p className="text-gray-300 text-xs mt-1">做好封面后点击顶部「保存」即可</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleOpen(p.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer transition-all group"
                    >
                      {/* 缩略图 */}
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-500 shrink-0">
                          <FolderOpen size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.ratio} · 更新于 {formatTime(p.updatedAt)}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="删除项目"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectManager
