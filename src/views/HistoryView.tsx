import type { Evaluation } from '../types'
import { HistoryList } from '../components/HistoryList'

interface HistoryViewProps {
  evaluations: Evaluation[]
  onSelect: (evaluation: Evaluation) => void
  onCreate: () => void
}

export function HistoryView(props: HistoryViewProps) {
  return (
    <section aria-labelledby="history-title">
      <div className="view-heading">
        <p className="eyebrow">Tu recorrido</p>
        <h1 id="history-title">Historial</h1>
        <p>{props.evaluations.length ? `${props.evaluations.length} ${props.evaluations.length === 1 ? 'evaluación guardada' : 'evaluaciones guardadas'}` : 'Tus evaluaciones aparecerán aquí.'}</p>
      </div>
      <HistoryList {...props} />
    </section>
  )
}
