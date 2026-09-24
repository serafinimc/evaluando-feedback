import { Fragment } from 'react'
import type { Questionnaire } from '../lib/questionnaire'

export function QuestionsView({ questionnaire }: { questionnaire: Questionnaire }) {
  return (
    <section aria-labelledby="questions-title">
      <div className="view-heading">
        <p className="eyebrow">{questionnaire.heading.eyebrow}</p>
        <h1 id="questions-title">{questionnaire.heading.title.replace('{count}', String(questionnaire.questions.length))}</h1>
        <p>{questionnaire.heading.description}</p>
      </div>
      {questionnaire.introSteps && <ol className="intro-steps intro-steps--page">{questionnaire.introSteps.map((step) => <li key={step}>{step}</li>)}</ol>}
      <ol className="question-list">
        {questionnaire.questions.map((question, index) => {
          const scale = questionnaire.scoring?.scales?.find((item) => item.questionIds.includes(question.id))
          const isScaleStart = scale?.questionIds[0] === question.id
          const isScaleEnd = scale?.questionIds.at(-1) === question.id
          return (
            <Fragment key={question.id}>
              {isScaleStart && <li className="question-list__group"><h2>{scale.label}</h2></li>}
              <li><span>{index + 1}</span><p>{question.text}</p></li>
              {isScaleEnd && scale.noteAfter && <li className="question-list__note"><strong>Nota:</strong><p>{scale.noteAfter}</p></li>}
            </Fragment>
          )
        })}
      </ol>
    </section>
  )
}
