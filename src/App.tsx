import { useEffect, useRef, useState } from 'react'
import { BottomNavigation, type Tab } from './components/BottomNavigation'
import { DataMenu } from './components/DataMenu'
import { EvaluationForm } from './components/EvaluationForm'
import { Icon } from './components/Icon'
import { Modal } from './components/Modal'
import { ResultCard } from './components/ResultCard'
import { SpeedDial } from './components/SpeedDial'
import { clearEvaluations, getEvaluations, importEvaluations, parseHistoryFile, saveEvaluation } from './lib/storage'
import type { Evaluation } from './types'
import { HistoryView } from './views/HistoryView'
import { QuestionsView } from './views/QuestionsView'

type ModalState = 'closed' | 'form' | 'result'

export default function App() {
  const [tab, setTab] = useState<Tab>('questions')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [modal, setModal] = useState<ModalState>('closed')
  const [selected, setSelected] = useState<Evaluation | null>(null)
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const reload = async () => setEvaluations(await getEvaluations())

  useEffect(() => {
    reload().catch(() => setToast('No se pudo abrir el historial en este dispositivo.'))
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [tab])

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
    const contents = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), evaluations }, null, 2)
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `evaluando-feedback-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setToast('Historial descargado.')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = parseHistoryFile(await file.text())
      await importEvaluations(imported)
      await reload()
      setTab('history')
      setToast(`${imported.length} ${imported.length === 1 ? 'evaluación importada' : 'evaluaciones importadas'}.`)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'No se pudo importar el archivo.')
    }
  }

  const clearHistory = async () => {
    if (!window.confirm('¿Borrar todo el historial? Esta acción no se puede deshacer.')) return
    try {
      await clearEvaluations()
      setEvaluations([])
      setToast('Se borró todo el historial.')
    } catch {
      setToast('No se pudo borrar el historial.')
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <a className="brand" href="./" aria-label="Evaluando feedback, inicio">
            <span className="brand__mark"><Icon name="check" size={20} /></span>
            <span>Evaluando <strong>feedback</strong></span>
          </a>
          <DataMenu onExport={exportHistory} onImport={() => fileInput.current?.click()} onClear={clearHistory} disabled={evaluations.length === 0} />
        </div>
      </header>

      <main>
        {tab === 'questions'
          ? <QuestionsView />
          : <HistoryView evaluations={evaluations} onSelect={showDetail} onCreate={createEvaluation} />}
      </main>

      <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} aria-label="Seleccionar archivo de historial JSON" />
      <SpeedDial onNew={createEvaluation} />
      <BottomNavigation active={tab} onChange={setTab} />

      <Modal open={modal === 'form'} title="Nueva evaluación" onClose={() => setModal('closed')} wide>
        <EvaluationForm onSubmit={finishEvaluation} />
      </Modal>
      <Modal open={modal === 'result'} title="Resultado" onClose={() => setModal('closed')}>
        {selected && <ResultCard evaluation={selected} />}
        <button className="primary-button modal-done" onClick={() => setModal('closed')}>Listo</button>
      </Modal>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
