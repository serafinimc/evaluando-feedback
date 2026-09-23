import { describe, expect, it } from 'vitest'
import questionnaireData from '../data/questionnaire.json'
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
})
