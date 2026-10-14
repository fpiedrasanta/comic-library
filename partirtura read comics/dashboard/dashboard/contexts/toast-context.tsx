import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { onApiError } from '@/infrastructure/api/client/api-client'

interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: 'success' | 'error', message: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }, [removeToast])

  useEffect(() => {
    const cleanup = onApiError((message) => {
      addToast('error', message)
    })
    return cleanup
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
