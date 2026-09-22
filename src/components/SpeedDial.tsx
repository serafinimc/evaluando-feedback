import { Icon } from './Icon'

interface SpeedDialProps {
  onNew: () => void
}

export function SpeedDial({ onNew }: SpeedDialProps) {
  return (
    <div className="speed-dial">
      <button className="fab" onClick={onNew} aria-label="Nueva evaluación">
        <Icon name="plus" size={28} />
      </button>
    </div>
  )
}
