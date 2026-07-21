import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  show: (message: string, options?: { type?: ToastType; duration?: number }) => void
  hide: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, options) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast: ToastItem = {
      id,
      message,
      type: options?.type || 'info',
      duration: options?.duration ?? 3000,
    }
    set(state => ({ toasts: [...state.toasts, toast] }))
    if (toast.duration > 0) {
      setTimeout(() => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
      }, toast.duration)
    }
  },
  hide: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

// 便捷 API — 直接调用不订阅
export const showToast = (
  message: string,
  options?: { type?: ToastType; duration?: number }
) => {
  useToastStore.getState().show(message, options)
}

// 替代 window.confirm：站内自定义确认弹窗
// 返回 Promise<boolean>，用户点确定 = true，取消 = false
import { useState } from 'react'

interface ConfirmState {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  danger: boolean
  resolve: ((v: boolean) => void) | null
}

let _setConfirm: ((s: Partial<ConfirmState>) => void) | null = null
const _confirmState: ConfirmState = {
  open: false,
  title: '确认操作',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  danger: false,
  resolve: null,
}

export function showConfirm(options: {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    _confirmState.open = true
    _confirmState.title = options.title || '确认操作'
    _confirmState.message = options.message
    _confirmState.confirmText = options.confirmText || '确定'
    _confirmState.cancelText = options.cancelText || '取消'
    _confirmState.danger = options.danger || false
    _confirmState.resolve = resolve
    if (_setConfirm) {
      _setConfirm({ ..._confirmState })
    }
  })
}

// 内部使用：Confirm 组件通过这个 hook 订阅
export function useConfirmBridge() {
  const [state, setState] = useState<ConfirmState>({ ..._confirmState })
  _setConfirm = (s) => setState(prev => ({ ...prev, ...s }))
  return {
    state,
    close: (result: boolean) => {
      _confirmState.open = false
      if (_confirmState.resolve) _confirmState.resolve(result)
      _confirmState.resolve = null
      setState({ ..._confirmState })
    },
  }
}
