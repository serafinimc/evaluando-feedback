import { Fragment, useState, type SyntheticEvent } from 'react'
import { calculateScore, getMaxScore, getScoreBreakdown, type Questionnaire } from '../lib/questionnaire'
import { getQuestionnaireRecommendation } from '../lib/scoring'
import type { Evaluation } from '../types'
import { Icon } from './Icon'

interface EvaluationFormProps {
  onSubmit: (evaluation: Evaluation) => void
  questionnaire: Questionnaire
}

export function EvaluationForm({ onSubmit, questionnaire }: EvaluationFormProps) {
  const [situation, setSituation] = useState('')
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (number: number) => {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })
  }

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const checkedQuestions = [...checked].sort((a, b) => a - b)
    const scoreBreakdown = getScoreBreakdown(questionnaire, checkedQuestions)
    const score = calculateScore(questionnaire, checkedQuestions)
    const recommendation = getQuestionnaireRecommendation(questionnaire, scoreBreakdown)
    onSubmit({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      situation: situation.trim(),
      checkedQuestions,
      score,
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      maxScore: getMaxScore(questionnaire),
      scoreBreakdown,
      ...(recommendation ? { recommendation } : {}),
    })
  }

  return (
    <form className="evaluation-form" onSubmit={submit}>
      <label className="field-label" htmlFor="situation">Situación o comentario <span>(opcional)</span></label>
      <textarea id="situation" value={situation} onChange={(event) => setSituation(event.target.value)} rows={3} placeholder="Describe brevemente el contexto" />
      {questionnaire.introSteps && <ol className="intro-steps">{questionnaire.introSteps.map((step) => <li key={step}>{step}</li>)}</ol>}
      <p className="instruction">{questionnaire.form.instruction}</p>
      <div className="counter" aria-live="polite"><strong>{checked.size}</strong> de {questionnaire.questions.length} marcadas</div>
      <fieldset>
        <legend className="sr-only">Preguntas de evaluación</legend>
        <div className="form-questions">
          {questionnaire.questions.map((question, index) => {
            const selected = checked.has(question.id)
            const scale = questionnaire.scoring?.scales?.find((item) => item.questionIds.includes(question.id))
            const isScaleStart = scale?.questionIds[0] === question.id
            const isScaleEnd = scale?.questionIds.at(-1) === question.id
            return (
              <Fragment key={question.id}>
                {isScaleStart && <h3 className="question-group-title">{scale.label}</h3>}
                <label className={`check-card ${selected ? 'check-card--selected' : ''}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggle(question.id)} />
                  <span className="custom-check">{selected && <Icon name="check" size={18} />}</span>
                  <span><strong>{index + 1}.</strong> {question.text}</span>
                </label>
                {isScaleEnd && scale.noteAfter && <aside className="question-note"><strong>Nota:</strong> {scale.noteAfter}</aside>}
              </Fragment>
            )
          })}
        </div>
      </fieldset>
      <div className="form-footer"><button className="primary-button" type="submit">Ver resultado</button></div>
    </form>
  )
}
