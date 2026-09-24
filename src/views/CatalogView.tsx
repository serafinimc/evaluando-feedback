import type { Questionnaire } from '../lib/questionnaire'

interface CatalogViewProps {
  questionnaires: Questionnaire[]
  onSelect: (questionnaire: Questionnaire) => void
}

export function CatalogView({ questionnaires, onSelect }: CatalogViewProps) {
  return (
    <section aria-labelledby="catalog-title">
      <div className="view-heading catalog-heading">
        <p className="eyebrow">Tu biblioteca</p>
        <h1 id="catalog-title">Elegí una hoja de trabajo</h1>
        <p>Cada escala tiene sus propias preguntas, puntuación e historial privado en este dispositivo.</p>
      </div>
      <div className="scale-grid">
        {questionnaires.map((questionnaire) => (
          <a className="scale-card" href={`/${questionnaire.slug}`} key={questionnaire.id} onClick={(event) => { event.preventDefault(); onSelect(questionnaire) }}>
            <div className="scale-card__meta"><span className="scale-card__count">{questionnaire.questions.length} preguntas</span></div>
            <h2>{questionnaire.name}</h2>
            <p>{questionnaire.summary}</p>
            <span className="scale-card__action">Abrir escala <span aria-hidden="true">→</span></span>
          </a>
        ))}
      </div>
    </section>
  )
}
