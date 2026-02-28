'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel = '확인', danger = false, onConfirm, onCancel }: Props) {
  return (
    <div className="a-confirm-backdrop" onClick={onCancel}>
      <div className="a-confirm" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <AlertTriangle size={18} color={danger ? 'var(--red)' : 'var(--gold)'} />
          <div className="a-confirm-title">{title}</div>
        </div>
        <div className="a-confirm-msg">{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="a-btn a-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>취소</button>
          <button
            className={`a-btn ${danger ? 'a-btn-danger' : 'a-btn-primary'}`}
            style={{ flex: 1 }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── hook ──────────────────────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState<{
    title: string; message: string; confirmLabel?: string; danger?: boolean;
    resolve: (v: boolean) => void
  } | null>(null)

  const confirm = (title: string, message: string, opts?: { confirmLabel?: string; danger?: boolean }) =>
    new Promise<boolean>(resolve => setState({ title, message, ...opts, resolve }))

  const node = state ? (
    <ConfirmDialog
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      danger={state.danger}
      onConfirm={() => { state.resolve(true);  setState(null) }}
      onCancel={() =>  { state.resolve(false); setState(null) }}
    />
  ) : null

  return { confirm, node }
}
