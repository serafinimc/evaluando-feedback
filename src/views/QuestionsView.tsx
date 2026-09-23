import type { Questionnaire } from '../lib/questionnaire'

export function QuestionsView({ questionnaire }: { questionnaire: Questionnaire }) {
  return (
    <section aria-labelledby="questions-title">
      <div className="view-heading">
        <p className="eyebrow">{questionnaire.heading.eyebrow}</p>
        <h1 id="questions-title">{questionnaire.heading.title.replace('{count}', String(questionnaire.questions.length))}</h1>
        <p>{questionnaire.heading.description}</p>
      </div>
      <ol className="question-list">
        {questionnaire.questions.map((question, index) => <li key={question.id}><span>{index + 1}</span><p>{question.text}</p></li>)}
      </ol>
    </section>
  )
}
