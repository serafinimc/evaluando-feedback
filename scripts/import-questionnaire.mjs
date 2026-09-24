import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const SECTION_QUESTIONS = 'PREGUNTAS'
const SECTION_RESULTS = 'RESULTADOS'
const SECTION_STEPS = 'PASOS'

const FIELD_NAMES = {
  NOMBRE: 'name',
  RUTA: 'slug',
  ID: 'id',
  RESUMEN: 'summary',
  CEJA: 'eyebrow',
  SUBTITULO: 'eyebrow',
  TITULO: 'title',
  DESCRIPCION: 'description',
  INSTRUCCION: 'instruction',
  PAUSA: 'pauseNote',
  VERSION: 'version',
}

function normalizeKey(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase()
}

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function fail(lineNumber, message) {
  throw new Error(lineNumber ? `Línea ${lineNumber}: ${message}` : message)
}

export function parseQuestionnaireText(contents) {
  const fields = {}
  const questions = []
  const criteria = []
  const scales = []
  const rules = []
  const introSteps = []
  let section = null
  let currentScale = null

  contents.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = rawLine.trim()
    if (!line || line.startsWith('//')) return

    const sectionMatch = line.match(/^\[([^\]]+)]$/)
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim()
      const normalizedSection = normalizeKey(sectionName)
      currentScale = null
      if ([SECTION_QUESTIONS, SECTION_RESULTS, SECTION_STEPS].includes(normalizedSection)) {
        section = normalizedSection
      } else if (normalizedSection.startsWith('ESCALA:')) {
        const [sourceId, label] = sectionName.slice(sectionName.indexOf(':') + 1).split('|').map((part) => part.trim())
        const id = slugify(sourceId || '')
        if (!id || !label) fail(lineNumber, 'usa [ESCALA: identificador | Nombre visible].')
        if (scales.some((scale) => scale.id === id)) fail(lineNumber, `la escala “${id}” está repetida.`)
        currentScale = { id, label, questionIds: [] }
        scales.push(currentScale)
        section = 'ESCALA'
      } else if (normalizedSection.startsWith('NOTA:')) {
        const id = slugify(sectionName.slice(sectionName.indexOf(':') + 1))
        currentScale = scales.find((scale) => scale.id === id)
        if (!currentScale) fail(lineNumber, `no existe una escala anterior con id “${id}”.`)
        section = 'NOTA'
      } else {
        fail(lineNumber, `sección desconocida “${sectionMatch[1]}”.`)
      }
      return
    }

    if (!section) {
      const separator = line.indexOf(':')
      if (separator < 1) fail(lineNumber, 'se esperaba un campo con formato NOMBRE: valor.')
      const sourceKey = normalizeKey(line.slice(0, separator))
      const key = FIELD_NAMES[sourceKey]
      const value = line.slice(separator + 1).trim()
      if (!key) fail(lineNumber, `campo desconocido “${line.slice(0, separator)}”.`)
      if (!value) fail(lineNumber, 'el campo no puede estar vacío.')
      fields[key] = value
      return
    }

    if (section === SECTION_STEPS) {
      introSteps.push(line)
      return
    }

    if (section === 'NOTA') {
      currentScale.noteAfter = currentScale.noteAfter ? `${currentScale.noteAfter} ${line}` : line
      return
    }

    if (section === SECTION_QUESTIONS || section === 'ESCALA') {
      const parts = line.split('|').map((part) => part.trim())
      if (parts.length > 2 || !parts[0]) fail(lineNumber, 'usa PREGUNTA o PREGUNTA | PUNTOS.')
      const points = parts[1] === undefined ? 1 : Number(parts[1])
      if (!Number.isInteger(points) || points < 1) fail(lineNumber, 'los puntos deben ser un entero positivo.')
      const question = { id: questions.length + 1, text: parts[0], points }
      questions.push(question)
      if (currentScale) currentScale.questionIds.push(question.id)
      return
    }

    const parts = line.split('|').map((part) => part.trim())
    const multiScaleResult = scales.length > 0
    const expectedParts = multiScaleResult ? 4 : 3
    if (parts.length !== expectedParts || parts.some((part) => !part)) {
      fail(lineNumber, multiScaleResult
        ? 'usa ESCALA | PUNTAJE MÍNIMO | TÍTULO | DESCRIPCIÓN.'
        : 'usa PUNTAJE MÍNIMO | TÍTULO | DESCRIPCIÓN.')
    }
    const offset = multiScaleResult ? 1 : 0
    const minScore = Number(parts[offset])
    if (!Number.isInteger(minScore) || minScore < 0) fail(lineNumber, 'el puntaje mínimo debe ser un entero igual o mayor que cero.')
    if (multiScaleResult) {
      const scaleId = slugify(parts[0])
      if (!scales.some((scale) => scale.id === scaleId)) fail(lineNumber, `no existe la escala “${scaleId}”.`)
      rules.push({ scaleId, minScore, title: parts[2], text: parts[3] })
    } else {
      criteria.push({ minScore, title: parts[1], text: parts[2] })
    }
  })

  const required = ['name', 'summary', 'title', 'description', 'instruction']
  const missing = required.filter((key) => !fields[key])
  if (missing.length) fail(null, `Faltan campos obligatorios: ${missing.join(', ')}.`)
  if (!questions.length) fail(null, 'La sección [PREGUNTAS] está vacía.')
  if ((criteria.length || rules.length) && !fields.pauseNote) fail(null, 'Falta el campo PAUSA, obligatorio cuando hay resultados.')
  if (scales.length === 1) fail(null, 'Un cuestionario con subescalas debe incluir al menos dos secciones [ESCALA].')
  if (scales.length && scales.some((scale) => !scale.questionIds.length)) fail(null, 'Todas las subescalas deben contener preguntas.')
  if (scales.length && scales.flatMap((scale) => scale.questionIds).length !== questions.length) fail(null, 'Todas las preguntas deben pertenecer a una subescala.')

  const slug = fields.slug ? slugify(fields.slug) : slugify(fields.name)
  if (!slug) fail(null, 'No se pudo crear una ruta válida a partir del nombre.')
  const maxScore = questions.reduce((total, question) => total + question.points, 0)
  if (criteria.length && !criteria.some((criterion) => criterion.minScore === 0)) fail(null, 'Debe existir un resultado con puntaje mínimo 0.')
  if (criteria.some((criterion) => criterion.minScore > maxScore)) fail(null, `Un resultado supera el puntaje máximo de ${maxScore}.`)
  if (new Set(criteria.map((criterion) => criterion.minScore)).size !== criteria.length) fail(null, 'Hay resultados con el mismo puntaje mínimo.')
  if (rules.length && !rules.some((rule) => rule.minScore === 0)) fail(null, 'Debe existir una regla de subescala con puntaje mínimo 0.')
  if (new Set(rules.map((rule) => `${rule.scaleId}:${rule.minScore}`)).size !== rules.length) fail(null, 'Hay reglas repetidas para una subescala.')
  for (const rule of rules) {
    const scale = scales.find((item) => item.id === rule.scaleId)
    const scaleMax = scale.questionIds.reduce((total, id) => total + questions.find((question) => question.id === id).points, 0)
    if (rule.minScore > scaleMax) fail(null, `Un resultado de “${scale.label}” supera su puntaje máximo de ${scaleMax}.`)
  }

  const version = fields.version === undefined ? 1 : Number(fields.version)
  if (!Number.isInteger(version) || version < 1) fail(null, 'VERSION debe ser un entero positivo.')

  return {
    id: fields.id || slug,
    slug,
    name: fields.name,
    summary: fields.summary,
    version,
    heading: {
      eyebrow: fields.eyebrow || 'La escala',
      title: fields.title,
      description: fields.description,
    },
    form: { instruction: fields.instruction },
    ...(introSteps.length ? { introSteps } : {}),
    questions,
    ...((criteria.length || rules.length) ? {
      scoring: {
        ...(criteria.length ? { criteria: criteria.sort((a, b) => b.minScore - a.minScore) } : {}),
        ...(rules.length ? { scales, rules } : {}),
        pauseNote: fields.pauseNote,
      },
    } : {}),
  }
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRunIndex = args.indexOf('--dry-run')
  const dryRun = dryRunIndex !== -1
  if (dryRun) args.splice(dryRunIndex, 1)
  const [inputArgument, outputArgument] = args
  if (!inputArgument || args.length > 2) {
    throw new Error('Uso: npm run import:scale -- archivo.txt [salida.json] [--dry-run]')
  }

  const inputPath = resolve(inputArgument)
  const questionnaire = parseQuestionnaireText(await readFile(inputPath, 'utf8'))
  const json = `${JSON.stringify(questionnaire, null, 2)}\n`
  if (dryRun) {
    process.stdout.write(json)
    return
  }

  const outputPath = resolve(outputArgument || `src/data/questionnaires/${questionnaire.slug}.json`)
  if (await pathExists(outputPath)) throw new Error(`Ya existe ${outputPath}. Elige otra ruta o elimina el archivo de forma explícita.`)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, json, 'utf8')
  console.log(`Hoja “${questionnaire.name}” creada en ${outputPath}`)
  console.log(`Ruta de la app: /${questionnaire.slug}`)
}

const isExecutedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (isExecutedDirectly) {
  main().catch((error) => {
    console.error(`No se pudo importar ${basename(process.argv[2] || 'el archivo')}: ${error.message}`)
    process.exitCode = 1
  })
}
