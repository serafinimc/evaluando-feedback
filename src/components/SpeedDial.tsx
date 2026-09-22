import { Icon } from './Icon'

interface SpeedDialProps {
  onNew: () => void
}

export function SpeedDial({ onNew }: SpeedDialProps) {
  return (
    <div className="speed-dial">
      <button className="fab" onClick={onNew}>
        <Icon name="plus" size={30} />
        <span>Añadir nuevo registro</span>
      </button>
    </div>
  )
}
