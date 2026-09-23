import type { Evaluation } from '../types'
import type { Questionnaire } from '../lib/questionnaire'
import { HistoryList } from '../components/HistoryList'

interface HistoryViewProps {
  evaluations: Evaluation[]
  onSelect: (evaluation: Evaluation) => void
  onCreate: () => void
  questionnaire: Questionnaire
}

export function HistoryView(props: HistoryViewProps) {
  return (
    <section aria-labelledby="history-title">
      <p className="history-privacy-note">
        Los registros se guardan localmente en cada dispositivo y se eliminan al borrar los datos del sitio.
        <br />
        Podés exportarlos o importar una copia previa desde el menú superior derecho.
      </p>
      <div className="view-heading">
        <p className="eyebrow">Tu recorrido</p>
        <h1 id="history-title">Historial</h1>
        <p>{props.evaluations.length ? `${props.evaluations.length} ${props.evaluations.length === 1 ? 'evaluación guardada' : 'evaluaciones guardadas'}` : 'Tus evaluaciones aparecerán aquí.'}</p>
      </div>
      <HistoryList {...props} />
    </section>
  )
}
