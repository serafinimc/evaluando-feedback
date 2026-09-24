import { describe, expect, it } from 'vitest'
import questionnaireData from '../data/questionnaires/feedback.json'
import multiScaleData from '../data/questionnaires/deshonra.json'
import { calculateScore, getMaxScore, parseQuestionnaire } from './questionnaire'

describe('questionnaire', () => {
  it('carga la configuración JSON y calcula puntajes desde los puntos de cada pregunta', () => {
    const config = parseQuestionnaire(questionnaireData)

    expect(config.questions).toHaveLength(12)
    expect(getMaxScore(config)).toBe(12)
    expect(calculateScore(config, [1, 4, 8])).toBe(3)
  })

  it('permite preguntas con distinto peso', () => {
    const config = parseQuestionnaire({
      ...questionnaireData,
      questions: [
        { id: 1, text: 'Pregunta simple', points: 1 },
        { id: 2, text: 'Pregunta importante', points: 3 },
      ],
      scoring: {
        ...questionnaireData.scoring,
        criteria: [
          { minScore: 3, title: 'Alto', text: 'Resultado alto' },
          { minScore: 0, title: 'Bajo', text: 'Resultado bajo' },
        ],
      },
    })

    expect(getMaxScore(config)).toBe(4)
    expect(calculateScore(config, [2])).toBe(3)
  })

  it('acepta una guía de preguntas sin resultados', () => {
    const { scoring: _scoring, ...questionOnlyData } = questionnaireData
    const config = parseQuestionnaire(questionOnlyData)

    expect(config.scoring).toBeUndefined()
    expect(config.questions).toHaveLength(12)
    expect(getMaxScore(config)).toBe(12)
    expect(calculateScore(config, [1, 4, 8])).toBe(3)
  })

  it('rechaza identificadores repetidos y criterios fuera de escala', () => {
    expect(() => parseQuestionnaire({
      ...questionnaireData,
      questions: [
        { id: 1, text: 'Una', points: 1 },
        { id: 1, text: 'Otra', points: 1 },
      ],
    })).toThrow('La configuración del cuestionario no es válida.')

    expect(() => parseQuestionnaire({
      ...questionnaireData,
      questions: [{ id: 1, text: 'Una', points: 1 }],
    })).toThrow('La configuración contiene un criterio mayor que el puntaje máximo.')
  })

  it('rechaza rutas que no sean aptas para una URL', () => {
    expect(() => parseQuestionnaire({ ...questionnaireData, slug: 'Ruta con espacios' }))
      .toThrow('La configuración del cuestionario no es válida.')
  })

  it('calcula por separado los puntajes de un cuestionario con dos subescalas', () => {
    const config = parseQuestionnaire(multiScaleData)
    const checked = [1, 4, 5, 6, 7]

    expect(config.scoring?.scales?.map((scale) => scale.id)).toEqual(['determinantes', 'restantes'])
    expect(calculateScore(config, checked)).toBe(5)
    expect(getMaxScore(config)).toBe(13)
  })
})
