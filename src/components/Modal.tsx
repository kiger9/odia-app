import type { ReactNode } from 'react'

export interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'danger' | 'ghost'
  disabled?: boolean
}

export default function Modal({
  title,
  message,
  actions,
  children,
}: {
  title?: string
  message?: string
  actions: ModalAction[]
  children?: ReactNode
}) {
  return (
    <div className="modal-ov" role="dialog" aria-modal="true">
      <div className="modal">
        {title && <p className="modal-title">{title}</p>}
        {message && <p className="modal-msg">{message}</p>}
        {children}
        <div className="modal-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={`modal-btn ${a.variant ?? 'primary'}`}
              disabled={a.disabled}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
