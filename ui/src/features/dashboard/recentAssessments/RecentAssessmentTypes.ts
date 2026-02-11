export interface RecentAssessment {
  id: string
  assessmentId: string
  classId: string
  subjectId: string
  title: string
  type: 'written' | 'oral'
  date: Date
  accessedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateRecentAssessmentInput {
  assessmentId: string
  classId: string
  subjectId: string
  title: string
  type: 'written' | 'oral'
  date: Date
}

export interface CreateRecentAssessmentRepositoryInput extends CreateRecentAssessmentInput {
  accessedAt: Date
}

export interface RecentAssessmentStoreValue {
  recentAssessments: RecentAssessment[]
  loading: boolean
  loadRecentAssessments: () => Promise<void>
  trackAssessmentUsage: (input: CreateRecentAssessmentInput) => Promise<void>
}
