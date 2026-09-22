import { useState } from 'react'
import { questions } from '../data/questions'
import type { Evaluation } from '../types'
import { Icon } from './Icon'

interface EvaluationFormProps {
  onSubmit: (evaluation: Evaluation) => void
}

export function EvaluationForm({ onSubmit }: EvaluationFormProps) {
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
    onSubmit({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      situation: situation.trim(),
      checkedQuestions,
      score: checkedQuestions.length,
    })
  }

  return (
    <form className="evaluation-form" onSubmit={submit}>
      <label className="field-label" htmlFor="situation">Situación o comentario <span>(opcional)</span></label>
      <textarea id="situation" value={situation} onChange={(event) => setSituation(event.target.value)} rows={3} placeholder="¿Qué feedback recibiste?" />
      <p className="instruction">Marca únicamente las afirmaciones que sean ciertas. Las demás cuentan como ‘no’.</p>
      <div className="counter" aria-live="polite"><strong>{checked.size}</strong> de 12 marcadas</div>
      <fieldset>
        <legend className="sr-only">Preguntas de evaluación</legend>
        <div className="form-questions">
          {questions.map((question, index) => {
            const number = index + 1
            const selected = checked.has(number)
            return (
              <label className={`check-card ${selected ? 'check-card--selected' : ''}`} key={question}>
                <input type="checkbox" checked={selected} onChange={() => toggle(number)} />
                <span className="custom-check">{selected && <Icon name="check" size={18} />}</span>
                <span><strong>{number}.</strong> {question}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="form-footer"><button className="primary-button" type="submit">Ver resultado</button></div>
    </form>
  )
}
