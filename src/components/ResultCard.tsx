import { getRecommendation } from '../lib/scoring'
import type { Evaluation } from '../types'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))
}

export function ResultCard({ evaluation }: { evaluation: Evaluation }) {
  const result = getRecommendation(evaluation.score)
  return (
    <article className="result-card">
      <div className="score" aria-label={`Puntaje: ${evaluation.score} de 12`}><strong>{evaluation.score}</strong><span>/12</span></div>
      <div className="result-card__content">
        <p className="eyebrow">Tu recomendación</p>
        <h3>{result.title}</h3>
        <p className="recommendation">{result.text}</p>
        {evaluation.situation && <div className="situation"><span>Situación o comentario</span><p>{evaluation.situation}</p></div>}
        <time dateTime={evaluation.createdAt}>{formatDate(evaluation.createdAt)}</time>
      </div>
      <aside className="pause-note"><strong>Pausa útil:</strong> si estás activado/a, regula primero tu cuerpo. Luego vuelve a la escala con curiosidad.</aside>
    </article>
  )
}
