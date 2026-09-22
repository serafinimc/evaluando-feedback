import { describe, expect, it } from 'vitest'
import { parseHistoryFile } from './storage'

const evaluation = {
  id: 'test-id',
  createdAt: '2026-09-22T12:00:00.000Z',
  situation: 'Una situación',
  checkedQuestions: [1, 4, 8],
  score: 3,
}

describe('parseHistoryFile', () => {
  it('acepta el formato exportado por la aplicación', () => {
    expect(parseHistoryFile(JSON.stringify({ version: 1, evaluations: [evaluation] }))).toEqual([evaluation])
  })

  it('acepta una lista de evaluaciones válida', () => {
    expect(parseHistoryFile(JSON.stringify([evaluation]))).toEqual([evaluation])
  })

  it.each([
    ['texto roto', 'El archivo no contiene JSON válido.'],
    [JSON.stringify({ anything: [] }), 'El archivo no tiene el formato de historial esperado.'],
    [JSON.stringify([{ ...evaluation, score: 4 }]), 'El archivo no tiene el formato de historial esperado.'],
    [JSON.stringify([{ ...evaluation, checkedQuestions: [1, 1, 2] }]), 'El archivo no tiene el formato de historial esperado.'],
  ])('rechaza archivos inválidos', (contents, message) => {
    expect(() => parseHistoryFile(contents)).toThrow(message)
  })
})
