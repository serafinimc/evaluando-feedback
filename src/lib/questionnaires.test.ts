import { describe, expect, it } from 'vitest'
import shameData from '../data/questionnaires/verguenza.json'
import feedbackData from '../data/questionnaires/feedback.json'
import { createQuestionnaireCatalog } from './questionnaires'

describe('questionnaire catalog', () => {
  it('carga y ordena todas las hojas', () => {
    const catalog = createQuestionnaireCatalog([shameData, feedbackData])

    expect(catalog.map((item) => item.slug)).toEqual(['feedback', 'verguenza'])
  })

  it('rechaza ids y rutas repetidas', () => {
    expect(() => createQuestionnaireCatalog([feedbackData, { ...shameData, id: feedbackData.id }]))
      .toThrow('Hay otras hojas con el mismo id en la configuración.')
    expect(() => createQuestionnaireCatalog([feedbackData, { ...shameData, slug: feedbackData.slug }]))
      .toThrow('Hay otras hojas con la misma ruta en la configuración.')
  })
})
