import React from 'react'
import { useToastStore, useConfirmBridge } from '../store/useToastStore'

// ==================== Toast ====================
const ToastContainer: React.FC = () => {
  const toasts = useToastStore(s => s.toasts)
  const hide = useToastStore(s => s.hide)

  const typeStyle: Record<string, { bg: string; icon: string }> = {
    success: { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', icon: '✓' },
    error: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', icon: '✕' },
    warning: { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', icon: '⚠' },
    info: { bg: 'bg-gradient-to-r from-gray-800 to-gray-900', icon: 'ℹ' },
  }

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => hide(t.id)}
          className={`pointer-events-auto ${typeStyle[t.type].bg} text-white pl-3 pr-5 py-3 rounded-2xl shadow-2xl flex items-start gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
          style={{ animation: 'slideInUp 0.3s ease-out' }}
        >
          <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{typeStyle[t.type].icon}</span>
          <span className="text-sm font-medium leading-relaxed whitespace-pre-line flex-1">{t.message}</span>
          <button
            onClick={(e) => { e.stopPropagation(); hide(t.id) }}
            className="text-white/60 hover:text-white text-lg flex-shrink-0 leading-none"
          >×</button>
        </div>
      ))}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ==================== Confirm Modal ====================
const ConfirmModal: React.FC = () => {
  const { state, close } = useConfirmBridge()
  if (!state.open) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.15s ease-out' }}
      onClick={() => close(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <div className="px-6 pt-6 pb-3">
          <h3 className="text-lg font-bold text-gray-900">{state.title}</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">{state.message}</p>
        </div>
        <div className="px-6 pb-5 pt-2 flex justify-end gap-2">
          <button
            onClick={() => close(false)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            {state.cancelText}
          </button>
          <button
            onClick={() => close(true)}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium ${
              state.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {state.confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}

// ==================== 合并导出 ====================
const Toast: React.FC = () => (
  <>
    <ToastContainer />
    <ConfirmModal />
  </>
)

export default Toast
