import type { ScoreCriterion } from './questionnaire'
import type { Recommendation } from '../types'

export function getRecommendation(score: number, criteria: ScoreCriterion[]): Recommendation {
  const result = criteria.find((criterion) => score >= criterion.minScore)
  if (!result) throw new Error('No hay un criterio de puntuación para este resultado.')
  return { title: result.title, text: result.text }
}
