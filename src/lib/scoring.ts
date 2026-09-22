export interface Recommendation {
  title: string
  text: string
}

export function getRecommendation(score: number): Recommendation {
  if (score >= 11) return { title: 'Aceptar el feedback', text: 'Acepta la retroalimentación como precisa y efectiva, aunque incomode.' }
  if (score >= 9) return { title: 'Probablemente aceptarlo', text: 'Acepta la retroalimentacion como probablemente precisa y efectiva.' }
  if (score >= 7) return { title: 'Seguir evaluando', text: 'Acepta la retroalimentación como probablemente precisa y efectiva: seguir comprobando si es útil o verdadero.' }
  if (score >= 5) return { title: 'Aceptar con cautela', text: 'Acepta tentativamente la retroalimentación.' }
  if (score >= 3) return { title: 'Rechazar provisionalmente', text: 'Rechaza provisionalmente la retroalimentación, manteniendo la mente abierta.' }
  return { title: 'Rechazar el feedback', text: 'Rechaza la retroalimentación.' }
}
