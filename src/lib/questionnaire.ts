import questionnaireData from '../data/questionnaire.json'

export interface Question {
  id: number
  text: string
  points: number
}

export interface ScoreCriterion {
  minScore: number
  title: string
  text: string
}

export interface Questionnaire {
  id: string
  version: number
  heading: {
    eyebrow: string
    title: string
    description: string
  }
  form: {
    instruction: string
  }
  questions: Question[]
  scoring: {
    criteria: ScoreCriterion[]
    pauseNote: string
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseQuestionnaire(value: unknown): Questionnaire {
  if (!value || typeof value !== 'object') throw new Error('La configuración del cuestionario no es válida.')
  const data = value as Record<string, unknown>
  const heading = data.heading as Record<string, unknown> | undefined
  const form = data.form as Record<string, unknown> | undefined
  const scoring = data.scoring as Record<string, unknown> | undefined
  const questions = data.questions
  const criteria = scoring?.criteria

  const validQuestions = Array.isArray(questions)
    && questions.length > 0
    && questions.every((question) => {
      if (!question || typeof question !== 'object') return false
      const item = question as Record<string, unknown>
      return Number.isInteger(item.id) && (item.id as number) > 0
        && isNonEmptyString(item.text)
        && Number.isInteger(item.points) && (item.points as number) > 0
    })
    && new Set(questions.map((question) => (question as Record<string, unknown>).id)).size === questions.length

  const validCriteria = Array.isArray(criteria)
    && criteria.length > 0
    && criteria.every((criterion) => {
      if (!criterion || typeof criterion !== 'object') return false
      const item = criterion as Record<string, unknown>
      return Number.isInteger(item.minScore) && (item.minScore as number) >= 0
        && isNonEmptyString(item.title)
        && isNonEmptyString(item.text)
    })
    && criteria.some((criterion) => (criterion as Record<string, unknown>).minScore === 0)
    && new Set(criteria.map((criterion) => (criterion as Record<string, unknown>).minScore)).size === criteria.length

  if (!isNonEmptyString(data.id)
    || !Number.isInteger(data.version) || (data.version as number) < 1
    || !heading || !isNonEmptyString(heading.eyebrow) || !isNonEmptyString(heading.title) || !isNonEmptyString(heading.description)
    || !form || !isNonEmptyString(form.instruction)
    || !scoring || !isNonEmptyString(scoring.pauseNote)
    || !validQuestions || !validCriteria) {
    throw new Error('La configuración del cuestionario no es válida.')
  }

  const questionnaire = data as unknown as Questionnaire
  const maxScore = questionnaire.questions.reduce((total, question) => total + question.points, 0)
  if (questionnaire.scoring.criteria.some((criterion) => criterion.minScore > maxScore)) {
    throw new Error('La configuración contiene un criterio mayor que el puntaje máximo.')
  }

  return {
    ...questionnaire,
    questions: [...questionnaire.questions],
    scoring: {
      ...questionnaire.scoring,
      criteria: [...questionnaire.scoring.criteria].sort((a, b) => b.minScore - a.minScore),
    },
  }
}

export const questionnaire = parseQuestionnaire(questionnaireData)

export function getMaxScore(config: Questionnaire): number {
  return config.questions.reduce((total, question) => total + question.points, 0)
}

export function calculateScore(config: Questionnaire, checkedQuestions: number[]): number {
  const checked = new Set(checkedQuestions)
  return config.questions.reduce((total, question) => total + (checked.has(question.id) ? question.points : 0), 0)
}
