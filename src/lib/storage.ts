import type { Evaluation } from '../types'

const DB_NAME = 'evaluando-feedback'
const STORE_NAME = 'evaluations'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function useStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = operation(transaction.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getEvaluations(): Promise<Evaluation[]> {
  const values = await useStore<Evaluation[]>('readonly', (store) => store.getAll())
  return values.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveEvaluation(evaluation: Evaluation): Promise<void> {
  await useStore<IDBValidKey>('readwrite', (store) => store.put(evaluation))
}

export async function clearEvaluations(): Promise<void> {
  await useStore<undefined>('readwrite', (store) => store.clear())
}

function isEvaluation(value: unknown): value is Evaluation {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string'
    && typeof item.createdAt === 'string'
    && !Number.isNaN(Date.parse(item.createdAt))
    && typeof item.situation === 'string'
    && Number.isInteger(item.score)
    && (item.score as number) >= 0
    && Array.isArray(item.checkedQuestions)
    && item.checkedQuestions.every((number) => Number.isInteger(number) && number >= 1)
    && new Set(item.checkedQuestions).size === item.checkedQuestions.length
    && (item.questionnaireId === undefined || typeof item.questionnaireId === 'string')
    && (item.questionnaireVersion === undefined || (Number.isInteger(item.questionnaireVersion) && (item.questionnaireVersion as number) > 0))
    && (item.maxScore === undefined || (Number.isInteger(item.maxScore) && (item.maxScore as number) > 0 && (item.score as number) <= (item.maxScore as number)))
    && (item.recommendation === undefined || (
      !!item.recommendation
      && typeof item.recommendation === 'object'
      && typeof (item.recommendation as Record<string, unknown>).title === 'string'
      && typeof (item.recommendation as Record<string, unknown>).text === 'string'
    ))
}

export function parseHistoryFile(contents: string): Evaluation[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    throw new Error('El archivo no contiene JSON válido.')
  }
  const evaluations = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).evaluations)
      ? (parsed as { evaluations: unknown[] }).evaluations
      : null
  if (!evaluations || !evaluations.every(isEvaluation)) throw new Error('El archivo no tiene el formato de historial esperado.')
  return evaluations
}

export async function importEvaluations(evaluations: Evaluation[]): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    evaluations.forEach((evaluation) => store.put(evaluation))
    transaction.oncomplete = () => { database.close(); resolve() }
    transaction.onerror = () => { database.close(); reject(transaction.error) }
  })
}
