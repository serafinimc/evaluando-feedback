import { describe, expect, it } from 'vitest'
import questionnaireData from '../data/questionnaires/feedback.json'
import multiScaleData from '../data/questionnaires/deshonra.json'
import { getScoreBreakdown, parseQuestionnaire } from './questionnaire'
import { getQuestionnaireRecommendation, getRecommendation } from './scoring'

const questionnaire = parseQuestionnaire(questionnaireData)

describe('getRecommendation', () => {
  it.each([
    [0, 'Rechazar el feedback'],
    [2, 'Rechazar el feedback'],
    [3, 'Rechazar provisionalmente'],
    [4, 'Rechazar provisionalmente'],
    [5, 'Aceptar con cautela'],
    [6, 'Aceptar con cautela'],
    [7, 'Seguir evaluando'],
    [8, 'Seguir evaluando'],
    [9, 'Probablemente aceptarlo'],
    [10, 'Probablemente aceptarlo'],
    [11, 'Aceptar el feedback'],
    [12, 'Aceptar el feedback'],
  ])('asigna el puntaje %i a la recomendación correcta', (score, title) => {
    expect(getRecommendation(score, questionnaire.scoring!.criteria!).title).toBe(title)
  })
})

describe('getQuestionnaireRecommendation', () => {
  const multiScale = parseQuestionnaire(multiScaleData)

  it.each([
    [[1], 'Deshonra justificada'],
    [[4, 5, 6, 7, 8, 9, 10], 'Probablemente justificada'],
    [[4, 5, 6, 7], 'Parcialmente justificada'],
    [[], 'Probablemente injustificada'],
  ])('prioriza y evalúa las subescalas para %j', (checked, title) => {
    const result = getQuestionnaireRecommendation(multiScale, getScoreBreakdown(multiScale, checked))
    expect(result?.title).toBe(title)
  })
})
