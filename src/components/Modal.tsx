import { useEffect, useId, useRef } from 'react'
import { Icon } from './Icon'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}

export function Modal({ open, title, onClose, children, wide = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal--wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === ref.current) onClose() }}
    >
      <div className="modal__sheet">
        <header className="modal__header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  )
}
