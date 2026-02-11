import { createStore } from '../../../shared/store/jestor'
import {
  RecentAssessment,
  CreateRecentAssessmentInput,
  RecentAssessmentStoreValue,
} from './RecentAssessmentTypes'
import { recentAssessmentRepository } from './RecentAssessmentRepository'

interface RecentAssessmentStoreState {
  recentAssessments: RecentAssessment[]
  loading: boolean
}

const MAX_RECENT_ASSESSMENTS = 10

export const recentAssessmentStore = createStore<RecentAssessmentStoreState>({
  name: 'recentAssessments',
  initialState: { recentAssessments: [], loading: true },
  init: () => {
    void loadRecentAssessments()
  },
})

/**
 * Load recent assessments from repository, sorted by accessedAt
 */
export async function loadRecentAssessments() {
  recentAssessmentStore.update('recentAssessments:load:start', (state) => {
    state.loading = true
  })
  try {
    const data = await recentAssessmentRepository.findAll()
    const sorted = data.sort(
      (a, b) => b.accessedAt.getTime() - a.accessedAt.getTime()
    )
    const limited = sorted.slice(0, MAX_RECENT_ASSESSMENTS)

    const toDelete = sorted.slice(MAX_RECENT_ASSESSMENTS)
    for (const entry of toDelete) {
      await recentAssessmentRepository.delete(entry.id)
    }

    recentAssessmentStore.update('recentAssessments:load:success', (state) => {
      state.recentAssessments = limited
    })
  } catch (error) {
    console.error('Failed to load recent assessments:', error)
    throw error
  } finally {
    recentAssessmentStore.update('recentAssessments:load:finally', (state) => {
      state.loading = false
    })
  }
}

/**
 * Track assessment usage by saving or updating the recent assessment entry
 * Keeps only the 10 most recent entries
 */
export const trackAssessmentUsage = async (
  input: CreateRecentAssessmentInput
): Promise<void> => {
  try {
    const existing = await recentAssessmentRepository.findAll()
    const existingEntry = existing.find(
      (entry) => entry.assessmentId === input.assessmentId
    )

    if (existingEntry) {
      const updated = await recentAssessmentRepository.update(
        existingEntry.id,
        {
          accessedAt: new Date(),
        }
      )
      recentAssessmentStore.update(
        'recentAssessments:update:success',
        (state) => {
          const index = state.recentAssessments.findIndex(
            (item) => item.id === existingEntry.id
          )
          if (index >= 0) {
            state.recentAssessments[index] = updated
          }
          state.recentAssessments.sort(
            (a, b) => b.accessedAt.getTime() - a.accessedAt.getTime()
          )
        }
      )
    } else {
      const newEntry = await recentAssessmentRepository.create({
        ...input,
        accessedAt: new Date(),
      })
      recentAssessmentStore.update(
        'recentAssessments:create:success',
        (state) => {
          state.recentAssessments.unshift(newEntry)
          state.recentAssessments.sort(
            (a, b) => b.accessedAt.getTime() - a.accessedAt.getTime()
          )
          if (state.recentAssessments.length > MAX_RECENT_ASSESSMENTS) {
            state.recentAssessments = state.recentAssessments.slice(
              0,
              MAX_RECENT_ASSESSMENTS
            )
          }
        }
      )

      const allEntries = await recentAssessmentRepository.findAll()
      const sorted = allEntries.sort(
        (a, b) => b.accessedAt.getTime() - a.accessedAt.getTime()
      )
      const toDelete = sorted.slice(MAX_RECENT_ASSESSMENTS)
      for (const entry of toDelete) {
        await recentAssessmentRepository.delete(entry.id)
      }
    }
  } catch (error) {
    console.error('Failed to track assessment usage:', error)
    throw error
  }
}

/**
 * Hook to access recent assessment store
 */
export const useRecentAssessmentStore = (): RecentAssessmentStoreValue => {
  const recentAssessments = recentAssessmentStore.select.recentAssessments()
  const loading = recentAssessmentStore.select.loading()
  return {
    recentAssessments,
    loading,
    loadRecentAssessments,
    trackAssessmentUsage,
  }
}
