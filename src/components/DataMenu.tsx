import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

interface DataMenuProps {
  onExport: () => void
  onImport: () => void
  onClear: () => void
  disabled: boolean
}

export function DataMenu({ onExport, onImport, onClear, disabled }: DataMenuProps) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  const act = (callback: () => void) => { setOpen(false); callback() }
  return (
    <div className="data-menu" ref={container}>
      <button className="icon-button header-menu" aria-label="Gestionar historial" aria-expanded={open} onClick={() => setOpen((value) => !value)}><Icon name="more" /></button>
      {open && (
        <div className="data-menu__panel" role="menu">
          <button role="menuitem" disabled={disabled} onClick={() => act(onExport)}><Icon name="download" size={20} />Descargar historial</button>
          <button role="menuitem" onClick={() => act(onImport)}><Icon name="upload" size={20} />Importar historial</button>
          <button role="menuitem" className="danger" disabled={disabled} onClick={() => act(onClear)}><Icon name="trash" size={20} />Borrar historial</button>
        </div>
      )}
    </div>
  )
}
