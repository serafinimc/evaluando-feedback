import { useState } from 'react'
import { calculateScore, getMaxScore, type Questionnaire } from '../lib/questionnaire'
import { getRecommendation } from '../lib/scoring'
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

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const checkedQuestions = [...checked].sort((a, b) => a - b)
    const score = calculateScore(questionnaire, checkedQuestions)
    onSubmit({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      situation: situation.trim(),
      checkedQuestions,
      score,
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      maxScore: getMaxScore(questionnaire),
      recommendation: getRecommendation(score, questionnaire.scoring.criteria),
    })
  }

  return (
    <form className="evaluation-form" onSubmit={submit}>
      <label className="field-label" htmlFor="situation">Situación o comentario <span>(opcional)</span></label>
      <textarea id="situation" value={situation} onChange={(event) => setSituation(event.target.value)} rows={3} placeholder="¿Qué feedback recibiste?" />
      <p className="instruction">{questionnaire.form.instruction}</p>
      <div className="counter" aria-live="polite"><strong>{checked.size}</strong> de {questionnaire.questions.length} marcadas</div>
      <fieldset>
        <legend className="sr-only">Preguntas de evaluación</legend>
        <div className="form-questions">
          {questionnaire.questions.map((question, index) => {
            const selected = checked.has(question.id)
            return (
              <label className={`check-card ${selected ? 'check-card--selected' : ''}`} key={question.id}>
                <input type="checkbox" checked={selected} onChange={() => toggle(question.id)} />
                <span className="custom-check">{selected && <Icon name="check" size={18} />}</span>
                <span><strong>{index + 1}.</strong> {question.text}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="form-footer"><button className="primary-button" type="submit">Ver resultado</button></div>
    </form>
  )
}
