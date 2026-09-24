import { getQuestionnaireRecommendation } from '../lib/scoring'
import { getScoreBreakdown, type Questionnaire } from '../lib/questionnaire'
import type { Evaluation } from '../types'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))
}

export function ResultCard({ evaluation, questionnaire }: { evaluation: Evaluation; questionnaire: Questionnaire }) {
  const breakdown = evaluation.scoreBreakdown ?? getScoreBreakdown(questionnaire, evaluation.checkedQuestions)
  const result = evaluation.recommendation ?? getQuestionnaireRecommendation(questionnaire, breakdown)
  const affirmativeCount = evaluation.checkedQuestions.length
  return (
    <article className="result-card">
      <div className={`score-summary ${breakdown.length > 1 ? 'score-summary--multiple' : ''}`}>
        {breakdown.map((item) => (
          <div className="score-item" key={item.id}>
            <div className="score" aria-label={`${item.label}: ${item.score} de ${item.maxScore}`}><strong>{item.score}</strong><span>/{item.maxScore}</span></div>
            {breakdown.length > 1 && <span className="score-label">{item.label}</span>}
          </div>
        ))}
      </div>
      <div className="result-card__content">
        <p className="eyebrow">{result ? 'Tu recomendación' : 'Tu registro'}</p>
        <h3>{result ? result.title : `${affirmativeCount} ${affirmativeCount === 1 ? 'respuesta afirmativa' : 'respuestas afirmativas'}`}</h3>
        <p className="recommendation">{result ? result.text : `Marcaste “sí” en ${affirmativeCount} de ${questionnaire.questions.length} preguntas.`}</p>
        {evaluation.situation && <div className="situation"><span>Situación o comentario</span><p>{evaluation.situation}</p></div>}
        <time dateTime={evaluation.createdAt}>{formatDate(evaluation.createdAt)}</time>
      </div>
      {questionnaire.scoring && <aside className="pause-note"><strong>Pausa útil:</strong> {questionnaire.scoring.pauseNote}</aside>}
    </article>
  )
}
