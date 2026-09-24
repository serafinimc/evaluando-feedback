import { useEffect, useMemo, useRef, useState } from 'react'
import { BottomNavigation, type Tab } from './components/BottomNavigation'
import { DataMenu } from './components/DataMenu'
import { EvaluationForm } from './components/EvaluationForm'
import { Icon } from './components/Icon'
import { Modal } from './components/Modal'
import { ResultCard } from './components/ResultCard'
import { SpeedDial } from './components/SpeedDial'
import type { Questionnaire } from './lib/questionnaire'
import { findQuestionnaire, questionnaires } from './lib/questionnaires'
import { clearEvaluationsForQuestionnaire, getEvaluations, importEvaluations, parseHistoryFile, saveEvaluation } from './lib/storage'
import type { Evaluation } from './types'
import { CatalogView } from './views/CatalogView'
import { HistoryView } from './views/HistoryView'
import { QuestionsView } from './views/QuestionsView'

type ModalState = 'closed' | 'form' | 'result'

function getRouteSlug(): string | null {
  return window.location.pathname.split('/').filter(Boolean)[0] ?? null
}

function belongsToQuestionnaire(evaluation: Evaluation, questionnaire: Questionnaire): boolean {
  if (evaluation.questionnaireId) return evaluation.questionnaireId === questionnaire.id
  return questionnaire.id === 'evaluando-feedback'
}

export default function App() {
  const [routeSlug, setRouteSlug] = useState<string | null>(getRouteSlug)
  const [tab, setTab] = useState<Tab>('questions')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [modal, setModal] = useState<ModalState>('closed')
  const [selected, setSelected] = useState<Evaluation | null>(null)
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const questionnaire = findQuestionnaire(routeSlug)
  const activeEvaluations = useMemo(
    () => questionnaire ? evaluations.filter((evaluation) => belongsToQuestionnaire(evaluation, questionnaire)) : [],
    [evaluations, questionnaire],
  )

  const reload = async () => setEvaluations(await getEvaluations())

  useEffect(() => {
    reload().catch(() => setToast('No se pudo abrir el historial en este dispositivo.'))
  }, [])

  useEffect(() => {
    const handleNavigation = () => setRouteSlug(getRouteSlug())
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  useEffect(() => {
    document.title = questionnaire ? questionnaire.name : 'Mis hojas'
    setTab('questions')
    setModal('closed')
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [questionnaire])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [tab])

  const navigate = (next: Questionnaire | null) => {
    const path = next ? `/${next.slug}` : '/'
    window.history.pushState({}, '', path)
    setRouteSlug(next?.slug ?? null)
  }

  const createEvaluation = () => {
    setSelected(null)
    setModal('form')
  }

  const finishEvaluation = async (evaluation: Evaluation) => {
    try {
      await saveEvaluation(evaluation)
      setEvaluations((current) => [evaluation, ...current.filter((item) => item.id !== evaluation.id)])
      setSelected(evaluation)
      setModal('result')
      setToast('Evaluación guardada en este dispositivo.')
    } catch {
      setToast('No se pudo guardar la evaluación.')
    }
  }

  const showDetail = (evaluation: Evaluation) => {
    setSelected(evaluation)
    setModal('result')
  }

  const exportHistory = () => {
    if (!questionnaire) return
    const contents = JSON.stringify({ version: 2, questionnaireId: questionnaire.id, exportedAt: new Date().toISOString(), evaluations: activeEvaluations }, null, 2)
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${questionnaire.slug}-historial-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setToast('Historial descargado.')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !questionnaire) return
    try {
      const parsed = parseHistoryFile(await file.text())
      if (questionnaire.id !== 'evaluando-feedback' && parsed.some((evaluation) => !evaluation.questionnaireId)) {
        throw new Error('Este historial pertenece al formato anterior de la escala de feedback.')
      }
      if (parsed.some((evaluation) => evaluation.questionnaireId && evaluation.questionnaireId !== questionnaire.id)) {
        throw new Error(`El archivo corresponde a otra escala, no a “${questionnaire.name}”.`)
      }
      const imported = parsed.map((evaluation) => ({ ...evaluation, questionnaireId: evaluation.questionnaireId ?? questionnaire.id }))
      await importEvaluations(imported)
      await reload()
      setTab('history')
      setToast(`${imported.length} ${imported.length === 1 ? 'evaluación importada' : 'evaluaciones importadas'}.`)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'No se pudo importar el archivo.')
    }
  }

  const clearHistory = async () => {
    if (!questionnaire || !window.confirm(`¿Borrar todo el historial de “${questionnaire.name}”? Esta acción no se puede deshacer.`)) return
    try {
      await clearEvaluationsForQuestionnaire(questionnaire.id, questionnaire.id === 'evaluando-feedback')
      setEvaluations((current) => current.filter((evaluation) => !belongsToQuestionnaire(evaluation, questionnaire)))
      setToast('Se borró el historial de esta escala.')
    } catch {
      setToast('No se pudo borrar el historial.')
    }
  }

  const isUnknownRoute = routeSlug !== null && !questionnaire

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <a className="brand" href="/" aria-label="Mis hojas, inicio" onClick={(event) => { event.preventDefault(); navigate(null) }}>
            <span className="brand__mark"><Icon name="check" size={20} /></span>
            <span><strong>Mis hojas de trabajo</strong></span>
          </a>
          {questionnaire && <DataMenu onExport={exportHistory} onImport={() => fileInput.current?.click()} onClear={clearHistory} disabled={activeEvaluations.length === 0} />}
        </div>
      </header>

      <main className={questionnaire ? undefined : 'main--catalog'}>
        {questionnaire && <button className="back-link" type="button" onClick={() => navigate(null)}><span aria-hidden="true">←</span> Volver a todas las hojas</button>}
        {!routeSlug && <CatalogView questionnaires={questionnaires} onSelect={navigate} />}
        {isUnknownRoute && (
          <section className="empty-state route-error">
            <div className="empty-state__icon" aria-hidden="true">?</div>
            <h1>Esta escala no existe</h1>
            <p>Volvé a la biblioteca para elegir una de las escalas disponibles.</p>
            <button className="primary-button" onClick={() => navigate(null)}>Ver escalas</button>
          </section>
        )}
        {questionnaire && (tab === 'questions'
          ? <QuestionsView questionnaire={questionnaire} />
          : <HistoryView evaluations={activeEvaluations} onSelect={showDetail} onCreate={createEvaluation} questionnaire={questionnaire} />)}
      </main>

      {questionnaire && (
        <>
          <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} aria-label="Seleccionar archivo de historial JSON" />
          <SpeedDial onNew={createEvaluation} />
          <BottomNavigation active={tab} onChange={setTab} />

          <Modal open={modal === 'form'} title={`Nueva evaluación · ${questionnaire.name}`} onClose={() => setModal('closed')} wide>
            <EvaluationForm onSubmit={finishEvaluation} questionnaire={questionnaire} />
          </Modal>
          <Modal open={modal === 'result'} title="Resultado" onClose={() => setModal('closed')}>
            {selected && <ResultCard evaluation={selected} questionnaire={questionnaire} />}
            <button className="primary-button modal-done" onClick={() => setModal('closed')}>Listo</button>
          </Modal>
        </>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
