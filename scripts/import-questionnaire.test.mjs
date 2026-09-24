import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseQuestionnaireText, slugify } from './import-questionnaire.mjs'

const validText = `
NOMBRE: Hoja de prueba
RESUMEN: Un ejemplo breve.
TITULO: {count} preguntas de prueba
DESCRIPCION: Descripción de la hoja.
INSTRUCCION: Marca lo que corresponda.
PAUSA: Revisa el resultado con calma.

[PREGUNTAS]
¿Pregunta simple?
¿Pregunta con peso? | 2

[RESULTADOS]
2 | Alto | Resultado alto.
0 | Bajo | Resultado bajo.
`

describe('text questionnaire importer', () => {
  it('convierte texto legible en una configuración completa', () => {
    const result = parseQuestionnaireText(validText)

    expect(result.slug).toBe('hoja-de-prueba')
    expect(result.questions).toEqual([
      { id: 1, text: '¿Pregunta simple?', points: 1 },
      { id: 2, text: '¿Pregunta con peso?', points: 2 },
    ])
    expect(result.scoring.criteria.map((criterion) => criterion.minScore)).toEqual([2, 0])
  })

  it('normaliza nombres y rutas con acentos', () => {
    expect(slugify('  Decisión y Acción  ')).toBe('decision-y-accion')
  })

  it('crea un cuestionario sin interpretación cuando se omiten los resultados', () => {
    const questionOnly = validText
      .replace('PAUSA: Revisa el resultado con calma.\n', '')
      .replace(/\n\[RESULTADOS][\s\S]*$/, '')

    expect(parseQuestionnaireText(questionOnly).scoring).toBeUndefined()
  })

  it('señala errores con su número de línea', () => {
    expect(() => parseQuestionnaireText(validText.replace('¿Pregunta simple?', '¿Pregunta simple? | cero')))
      .toThrow('los puntos deben ser un entero positivo')
  })

  it('exige un resultado que comience en cero', () => {
    expect(() => parseQuestionnaireText(validText.replace('0 | Bajo | Resultado bajo.', '1 | Bajo | Resultado bajo.')))
      .toThrow('puntaje mínimo 0')
  })

  it('importa pasos, notas y reglas para dos subescalas', () => {
    const contents = readFileSync(new URL('../templates/deshonra.txt', import.meta.url), 'utf8')
    const result = parseQuestionnaireText(contents)

    expect(result.introSteps).toHaveLength(4)
    expect(result.scoring.scales).toHaveLength(2)
    expect(result.scoring.scales[0].questionIds).toEqual([1, 2, 3])
    expect(result.scoring.scales[0].noteAfter).toContain('Si respondiste SÍ')
    expect(result.scoring.rules[0]).toMatchObject({ scaleId: 'determinantes', minScore: 1 })
  })
})
