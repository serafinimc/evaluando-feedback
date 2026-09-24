import { getQuestionnaireRecommendation } from '../lib/scoring'
import { getMaxScore, getScoreBreakdown, type Questionnaire } from '../lib/questionnaire'
import type { Evaluation } from '../types'
import { formatDate } from './ResultCard'

interface HistoryListProps {
  evaluations: Evaluation[]
  onSelect: (evaluation: Evaluation) => void
  onCreate: () => void
  questionnaire: Questionnaire
}

export function HistoryList({ evaluations, onSelect, onCreate, questionnaire }: HistoryListProps) {
  if (evaluations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">0</div>
        <h2>Todavía no hay evaluaciones</h2>
        <p>Cuando guardes una, aparecerá aquí</p>
        <button className="primary-button" onClick={onCreate}>Crear evaluación</button>
      </div>
    )
  }
  return (
    <div className="history-list">
      {evaluations.map((evaluation) => {
        const breakdown = evaluation.scoreBreakdown ?? getScoreBreakdown(questionnaire, evaluation.checkedQuestions)
        const result = evaluation.recommendation ?? getQuestionnaireRecommendation(questionnaire, breakdown)
        const maxScore = evaluation.maxScore ?? getMaxScore(questionnaire)
        return (
          <button className="history-card" key={evaluation.id} onClick={() => onSelect(evaluation)}>
            <div className="history-card__top">
              <div>
                <h2>{evaluation.situation || 'Evaluación de feedback'}</h2>
                <time dateTime={evaluation.createdAt}>{formatDate(evaluation.createdAt)}</time>
              </div>
              <span className="history-score">
                {breakdown.length > 1
                  ? breakdown.map((item) => <span key={item.id}><strong>{item.score}</strong>/{item.maxScore}</span>)
                  : <><strong>{evaluation.score}</strong>/{maxScore}</>}
              </span>
            </div>
            <p>{result ? <><span>Recomendación:</span> {result.title}</> : <><span>Respuestas afirmativas:</span> {evaluation.checkedQuestions.length} de {questionnaire.questions.length}</>}</p>
          </button>
        )
      })}
    </div>
  )
}
