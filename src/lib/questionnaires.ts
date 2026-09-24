import { parseQuestionnaire, type Questionnaire } from './questionnaire'

const modules = import.meta.glob('../data/questionnaires/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export function createQuestionnaireCatalog(values: unknown[]): Questionnaire[] {
  const catalog = values.map(parseQuestionnaire).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  if (new Set(catalog.map((item) => item.id)).size !== catalog.length) {
    throw new Error('Hay otras hojas con el mismo id en la configuración.')
  }
  if (new Set(catalog.map((item) => item.slug)).size !== catalog.length) {
    throw new Error('Hay otras hojas con la misma ruta en la configuración.')
  }
  return catalog
}

export const questionnaires = createQuestionnaireCatalog(Object.values(modules))

export function findQuestionnaire(slug: string | null): Questionnaire | undefined {
  return questionnaires.find((item) => item.slug === slug)
}
