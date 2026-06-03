import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Board, Exam } from '../lib/supabase'

interface PlatformStore {
  selectedBoard: Board | null
  selectedExam: Exam | null
  onboardingDone: boolean
  bookmarkedPaperIds: string[]

  setSelectedBoard: (board: Board | null) => void
  setSelectedExam: (exam: Exam | null) => void
  setOnboardingDone: (v: boolean) => void
  toggleBookmarkedPaper: (paperId: string) => void
  isBookmarked: (paperId: string) => boolean
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      selectedBoard: null,
      selectedExam: null,
      onboardingDone: false,
      bookmarkedPaperIds: [],

      setSelectedBoard: (board) => set({ selectedBoard: board }),
      setSelectedExam: (exam) => set({ selectedExam: exam }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),

      toggleBookmarkedPaper: (paperId) =>
        set(state => {
          const exists = state.bookmarkedPaperIds.includes(paperId)
          return {
            bookmarkedPaperIds: exists
              ? state.bookmarkedPaperIds.filter(id => id !== paperId)
              : [...state.bookmarkedPaperIds, paperId],
          }
        }),

      isBookmarked: (paperId) => get().bookmarkedPaperIds.includes(paperId),
    }),
    { name: 'prepbridge-platform' }
  )
)
