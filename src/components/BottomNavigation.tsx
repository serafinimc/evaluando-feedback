import { Icon } from './Icon'

export type Tab = 'questions' | 'history'

interface BottomNavigationProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="bottom-nav__inner">
        <button className={active === 'questions' ? 'active' : ''} onClick={() => onChange('questions')} aria-current={active === 'questions' ? 'page' : undefined}>
          <Icon name="questions" /><span>Preguntas</span>
        </button>
        <span className="bottom-nav__space" aria-hidden="true" />
        <button className={active === 'history' ? 'active' : ''} onClick={() => onChange('history')} aria-current={active === 'history' ? 'page' : undefined}>
          <Icon name="history" /><span>Historial</span>
        </button>
      </div>
    </nav>
  )
}
