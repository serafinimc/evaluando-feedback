import type { Questionnaire, ScoreCriterion } from './questionnaire'
import type { Recommendation, ScoreBreakdown } from '../types'

export function getRecommendation(score: number, criteria: ScoreCriterion[]): Recommendation {
  const result = criteria.find((criterion) => score >= criterion.minScore)
  if (!result) throw new Error('No hay un criterio de puntuación para este resultado.')
  return { title: result.title, text: result.text }
}

export function getQuestionnaireRecommendation(questionnaire: Questionnaire, breakdown: ScoreBreakdown[]): Recommendation | undefined {
  const scoring = questionnaire.scoring
  if (!scoring) return undefined
  if (scoring.criteria) {
    const total = breakdown.reduce((sum, item) => sum + item.score, 0)
    return getRecommendation(total, scoring.criteria)
  }
  const rule = scoring.rules?.find((item) => {
    const scale = breakdown.find((score) => score.id === item.scaleId)
    return scale !== undefined && scale.score >= item.minScore
  })
  return rule ? { title: rule.title, text: rule.text } : undefined
}
