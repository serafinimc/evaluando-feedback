import { describe, expect, it } from 'vitest'
import { questionnaire } from './questionnaire'
import { getRecommendation } from './scoring'

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
    expect(getRecommendation(score, questionnaire.scoring.criteria).title).toBe(title)
  })
})
