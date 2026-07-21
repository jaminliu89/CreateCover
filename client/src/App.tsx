import { useEffect, useState } from 'react'
import Toolbar from './components/Toolbar'
import TemplatesPanel from './components/TemplatesPanel'
import PropertiesPanel from './components/PropertiesPanel'
import Canvas from './components/Canvas'
import ProjectManager from './components/ProjectManager'
import Toast from './components/Toast'
import { useEditorStore } from './store/useEditorStore'
import { templates } from './data/templates'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  const { setElements, setRatio, setSelected } = useEditorStore()
  const [saveModalOpen, setSaveModalOpen] = useState(false)

  useKeyboardShortcuts({ onSave: () => setSaveModalOpen(true) })

  // 默认加载第一个模板（仅在 hydrate 完成 + 用户无进度时）
  useEffect(() => {
    const tryLoadDefault = () => {
      const state = useEditorStore.getState()
      // 如果用户已有进度（localStorage 恢复了内容），直接跳过
      if (state.elements.length > 0) return

      const defaultTemplate = templates[0]
      if (defaultTemplate) {
        setRatio(defaultTemplate.ratio)
        setElements(defaultTemplate.elements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })))
        setSelected(null)
      }
    }
    if (useEditorStore.persist.hasHydrated()) {
      tryLoadDefault()
    } else {
      const unsub = useEditorStore.persist.onFinishHydration(() => tryLoadDefault())
      return unsub
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-200 overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <TemplatesPanel />
        <Canvas />
        <PropertiesPanel />
      </div>
      {saveModalOpen && (
        <ProjectManager mode="save" onClose={() => setSaveModalOpen(false)} />
      )}
      <Toast />
    </div>
  )
}

export default App
