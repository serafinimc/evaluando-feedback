import type { ScoreBreakdown } from '../types'

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

export interface ScoreScale {
  id: string
  label: string
  questionIds: number[]
  noteAfter?: string
}

export interface ScoreRule extends ScoreCriterion {
  scaleId: string
}

export interface QuestionnaireScoring {
  criteria?: ScoreCriterion[]
  scales?: ScoreScale[]
  rules?: ScoreRule[]
  pauseNote: string
}

export interface Questionnaire {
  id: string
  slug: string
  name: string
  summary: string
  version: number
  heading: {
    eyebrow: string
    title: string
    description: string
  }
  form: {
    instruction: string
  }
  introSteps?: string[]
  questions: Question[]
  scoring?: QuestionnaireScoring
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
  const introSteps = data.introSteps
  const questions = data.questions
  const criteria = scoring?.criteria
  const scales = scoring?.scales
  const rules = scoring?.rules

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

  const validCriterion = (criterion: unknown) => {
      if (!criterion || typeof criterion !== 'object') return false
      const item = criterion as Record<string, unknown>
      return Number.isInteger(item.minScore) && (item.minScore as number) >= 0
        && isNonEmptyString(item.title)
        && isNonEmptyString(item.text)
  }

  const singleScoring = Array.isArray(criteria)
    && criteria.length > 0
    && criteria.every(validCriterion)
    && criteria.some((criterion) => (criterion as Record<string, unknown>).minScore === 0)
    && new Set(criteria.map((criterion) => (criterion as Record<string, unknown>).minScore)).size === criteria.length
    && scales === undefined && rules === undefined

  const multiScoring = Array.isArray(scales) && scales.length > 1
    && scales.every((scale) => {
      if (!scale || typeof scale !== 'object') return false
      const item = scale as Record<string, unknown>
      return isNonEmptyString(item.id) && isNonEmptyString(item.label)
        && Array.isArray(item.questionIds) && item.questionIds.length > 0
        && item.questionIds.every((id) => Number.isInteger(id))
        && (item.noteAfter === undefined || isNonEmptyString(item.noteAfter))
    })
    && new Set(scales.map((scale) => (scale as Record<string, unknown>).id)).size === scales.length
    && Array.isArray(rules) && rules.length > 0
    && rules.every((rule) => validCriterion(rule) && isNonEmptyString((rule as Record<string, unknown>).scaleId))
    && criteria === undefined

  const validScoring = scoring === undefined || (isNonEmptyString(scoring.pauseNote) && (singleScoring || multiScoring))
  const validIntro = introSteps === undefined || (Array.isArray(introSteps) && introSteps.length > 0 && introSteps.every(isNonEmptyString))

  if (!isNonEmptyString(data.id)
    || !isNonEmptyString(data.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
    || !isNonEmptyString(data.name)
    || !isNonEmptyString(data.summary)
    || !Number.isInteger(data.version) || (data.version as number) < 1
    || !heading || !isNonEmptyString(heading.eyebrow) || !isNonEmptyString(heading.title) || !isNonEmptyString(heading.description)
    || !form || !isNonEmptyString(form.instruction)
    || !validQuestions || !validScoring || !validIntro) {
    throw new Error('La configuración del cuestionario no es válida.')
  }

  const questionnaire = data as unknown as Questionnaire
  const questionById = new Map(questionnaire.questions.map((question) => [question.id, question]))
  const maxScore = questionnaire.questions.reduce((total, question) => total + question.points, 0)
  if (questionnaire.scoring?.criteria?.some((criterion) => criterion.minScore > maxScore)) {
    throw new Error('La configuración contiene un criterio mayor que el puntaje máximo.')
  }
  if (questionnaire.scoring?.scales && questionnaire.scoring.rules) {
    const assignedIds = questionnaire.scoring.scales.flatMap((scale) => scale.questionIds)
    const scaleById = new Map(questionnaire.scoring.scales.map((scale) => [scale.id, scale]))
    const validAssignments = assignedIds.length === questionnaire.questions.length
      && new Set(assignedIds).size === assignedIds.length
      && assignedIds.every((id) => questionById.has(id))
    const validRules = questionnaire.scoring.rules.every((rule) => {
      const scale = scaleById.get(rule.scaleId)
      if (!scale) return false
      const scaleMax = scale.questionIds.reduce((total, id) => total + questionById.get(id)!.points, 0)
      return rule.minScore <= scaleMax
    })
      && questionnaire.scoring.rules.some((rule) => rule.minScore === 0)
      && new Set(questionnaire.scoring.rules.map((rule) => `${rule.scaleId}:${rule.minScore}`)).size === questionnaire.scoring.rules.length
    if (!validAssignments || !validRules) throw new Error('La configuración de las subescalas no es válida.')
  }

  return {
    ...questionnaire,
    questions: [...questionnaire.questions],
    ...(questionnaire.scoring ? {
      scoring: {
        ...questionnaire.scoring,
        ...(questionnaire.scoring.criteria ? { criteria: [...questionnaire.scoring.criteria].sort((a, b) => b.minScore - a.minScore) } : {}),
        ...(questionnaire.scoring.scales ? { scales: questionnaire.scoring.scales.map((scale) => ({ ...scale, questionIds: [...scale.questionIds] })) } : {}),
        ...(questionnaire.scoring.rules ? { rules: [...questionnaire.scoring.rules] } : {}),
      },
    } : {}),
  }
}

export function getMaxScore(config: Questionnaire): number {
  return getScoreBreakdown(config, []).reduce((total, item) => total + item.maxScore, 0)
}

export function calculateScore(config: Questionnaire, checkedQuestions: number[]): number {
  return getScoreBreakdown(config, checkedQuestions).reduce((total, item) => total + item.score, 0)
}

export function getScoreBreakdown(config: Questionnaire, checkedQuestions: number[]): ScoreBreakdown[] {
  const checked = new Set(checkedQuestions)
  if (!config.scoring) {
    return [{ id: 'answers', label: 'Respuestas afirmativas', score: config.questions.filter((question) => checked.has(question.id)).length, maxScore: config.questions.length }]
  }
  const scoreQuestions = (questionIds: number[]) => {
    const selected = config.questions.filter((question) => questionIds.includes(question.id))
    return {
      score: selected.reduce((total, question) => total + (checked.has(question.id) ? question.points : 0), 0),
      maxScore: selected.reduce((total, question) => total + question.points, 0),
    }
  }
  if (config.scoring.scales) {
    return config.scoring.scales.map((scale) => ({ id: scale.id, label: scale.label, ...scoreQuestions(scale.questionIds) }))
  }
  return [{ id: 'total', label: 'Puntaje', ...scoreQuestions(config.questions.map((question) => question.id)) }]
}
