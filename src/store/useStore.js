import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      onboardingComplete: false,
      isAdmin: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setIsAdmin: (v) => set({ isAdmin: v }),
      logout: () => set({ user: null, profile: null, onboardingComplete: false }),

      updateProfile: (updates) => set(state => ({
        profile: { ...state.profile, ...updates }
      })),
    }),
    { name: 'prepbridge-user' }
  )
)

export const useAppStore = create(
  persist(
    (set) => ({
      language: 'en',
      theme: 'dark',
      sidebarOpen: true,
      notifications: [],
      streak: 0,
      lastStudyDate: null,
      totalPoints: 0,
      testHistory: [],
      bookmarks: [],

      setLanguage: (lang) => set({ language: lang }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      addNotification: (n) => set(state => ({ notifications: [n, ...state.notifications].slice(0, 50) })),
      markAllRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      incrementStreak: () => set(state => ({
        streak: state.streak + 1,
        lastStudyDate: new Date().toISOString()
      })),
      addPoints: (pts) => set(state => ({ totalPoints: state.totalPoints + pts })),
      addTestResult: (result) => set(state => ({
        testHistory: [result, ...state.testHistory].slice(0, 100)
      })),
      toggleBookmark: (id) => set(state => {
        const exists = state.bookmarks.includes(id)
        return { bookmarks: exists ? state.bookmarks.filter(b => b !== id) : [...state.bookmarks, id] }
      }),
    }),
    { name: 'prepbridge-app' }
  )
)

export const useExamStore = create(
  persist(
    (set) => ({
      selectedExams: [],
      currentTest: null,
      testAnswers: {},
      testStartTime: null,
      examProgress: {},

      setSelectedExams: (exams) => set({ selectedExams: exams }),
      startTest: (test) => set({ currentTest: test, testAnswers: {}, testStartTime: Date.now() }),
      submitAnswer: (qId, ans) => set(state => ({
        testAnswers: { ...state.testAnswers, [qId]: ans }
      })),
      endTest: () => set({ currentTest: null, testStartTime: null }),
      updateProgress: (examId, data) => set(state => ({
        examProgress: { ...state.examProgress, [examId]: { ...state.examProgress[examId], ...data } }
      })),
    }),
    { name: 'prepbridge-exam' }
  )
)
