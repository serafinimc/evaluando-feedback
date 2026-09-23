export interface Evaluation {
  id: string
  createdAt: string
  situation: string
  checkedQuestions: number[]
  score: number
  questionnaireId?: string
  questionnaireVersion?: number
  maxScore?: number
  recommendation?: Recommendation
}

export interface Recommendation {
  title: string
  text: string
}
