export interface Evaluation {
  id: string
  createdAt: string
  situation: string
  checkedQuestions: number[]
  score: number
  questionnaireId?: string
  questionnaireVersion?: number
  maxScore?: number
  scoreBreakdown?: ScoreBreakdown[]
  recommendation?: Recommendation
}

export interface ScoreBreakdown {
  id: string
  label: string
  score: number
  maxScore: number
}

export interface Recommendation {
  title: string
  text: string
}
