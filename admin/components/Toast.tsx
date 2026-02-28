'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const isSuccess = type === 'success'

  return (
    <div style={{
      position: 'fixed', bottom: 'calc(var(--nav-h) + 20px)', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100, width: 'calc(100% - 32px)', maxWidth: 398,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 16px', borderRadius: 12,
      background: isSuccess ? 'rgba(46,204,113,.12)' : 'rgba(224,58,58,.12)',
      border: `1px solid ${isSuccess ? 'rgba(46,204,113,.3)' : 'rgba(224,58,58,.3)'}`,
      animation: 'fadeUp .2s ease',
    }}>
      {isSuccess
        ? <CheckCircle size={18} color="var(--green)" style={{ flexShrink: 0 }} />
        : <XCircle size={18} color="var(--red)" style={{ flexShrink: 0 }} />
      }
      <span style={{ flex: 1, fontSize: 13, color: isSuccess ? 'var(--green)' : 'var(--red)' }}>
        {message}
      </span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-muted)', padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ── hook ──────────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const show = (message: string, type: ToastType = 'success') => setToast({ message, type })
  const hide = () => setToast(null)

  const node = toast ? <Toast message={toast.message} type={toast.type} onClose={hide} /> : null

  return { show, node }
}
