import { getRecommendation } from '../lib/scoring'
import { getMaxScore, type Questionnaire } from '../lib/questionnaire'
import type { Evaluation } from '../types'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))
}

export function ResultCard({ evaluation, questionnaire }: { evaluation: Evaluation; questionnaire: Questionnaire }) {
  const result = evaluation.recommendation ?? getRecommendation(evaluation.score, questionnaire.scoring.criteria)
  const maxScore = evaluation.maxScore ?? getMaxScore(questionnaire)
  return (
    <article className="result-card">
      <div className="score" aria-label={`Puntaje: ${evaluation.score} de ${maxScore}`}><strong>{evaluation.score}</strong><span>/{maxScore}</span></div>
      <div className="result-card__content">
        <p className="eyebrow">Tu recomendación</p>
        <h3>{result.title}</h3>
        <p className="recommendation">{result.text}</p>
        {evaluation.situation && <div className="situation"><span>Situación o comentario</span><p>{evaluation.situation}</p></div>}
        <time dateTime={evaluation.createdAt}>{formatDate(evaluation.createdAt)}</time>
      </div>
      <aside className="pause-note"><strong>Pausa útil:</strong> {questionnaire.scoring.pauseNote}</aside>
    </article>
  )
}
