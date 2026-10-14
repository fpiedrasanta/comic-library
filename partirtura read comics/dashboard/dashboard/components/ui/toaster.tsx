import { useToast } from '@/contexts/toast-context'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toaster() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-xl border p-4 shadow-2xl flex items-start gap-3
            animate-in slide-in-from-right-full duration-300
            ${
              toast.type === 'success'
                ? 'bg-nepsCard border-emerald-500/40'
                : 'bg-nepsCard border-nepsAccent/40'
            }
          `}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-nepsAccent flex-shrink-0 mt-0.5" />
          )}
          <p className="text-xs text-slate-200 font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-nepsMuted hover:text-white flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
