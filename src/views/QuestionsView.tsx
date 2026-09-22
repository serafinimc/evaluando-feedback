import { questions } from '../data/questions'

export function QuestionsView() {
  return (
    <section aria-labelledby="questions-title">
      <div className="view-heading">
        <p className="eyebrow">La escala</p>
        <h1 id="questions-title">12 preguntas para mirar el feedback</h1>
        <p>Úsalas como guía para decidir cuánto peso darle a lo que recibiste.</p>
      </div>
      <ol className="question-list">
        {questions.map((question, index) => <li key={question}><span>{index + 1}</span><p>{question}</p></li>)}
      </ol>
    </section>
  )
}
