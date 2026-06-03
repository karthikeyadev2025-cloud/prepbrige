import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ────────────────────────────────────────────────────────────────────

export interface Board {
  id: string
  name: string
  short_name: string
  state_code: string | null
  logo_url: string | null
  description: string | null
  display_order: number
  created_at: string
}

export interface Exam {
  id: string
  board_id: string
  name: string
  description: string | null
  exam_type: string | null
  display_order: number
  created_at: string
}

export interface Course {
  id: string
  exam_id: string
  name: string
  medium: string | null
  description: string | null
  display_order: number
  created_at: string
}

export interface Subject {
  id: string
  course_id: string
  name: string
  description: string | null
  display_order: number
  created_at: string
}

export interface QuestionPaper {
  id: string
  board_id: string | null
  exam_id: string | null
  course_id: string | null
  subject_id: string | null
  title: string
  year: number | null
  paper_type: 'question_paper' | 'model_paper' | 'mock_test' | 'quiz'
  difficulty: 'easy' | 'medium' | 'hard' | null
  total_marks: number
  duration_minutes: number
  is_official: boolean
  language: string
  file_url: string | null
  thumbnail_url: string | null
  description: string | null
  tags: string[] | null
  created_at: string
  // joined
  boards?: { short_name: string } | null
  exams?: { name: string } | null
  subjects?: { name: string } | null
}

export interface PaperQuestion {
  id: string
  paper_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  explanation: string | null
  marks: number
  negative_marks: number
  question_order: number
  subject_tag: string | null
  difficulty: string | null
  created_at: string
}

export interface ExamTimetable {
  id: string
  board_id: string | null
  exam_id: string | null
  title: string
  academic_year: string | null
  is_official: boolean
  source_url: string | null
  created_at: string
  entries?: TimetableEntry[]
}

export interface TimetableEntry {
  id: string
  timetable_id: string
  subject_name: string
  exam_date: string
  exam_time: string | null
  duration_minutes: number | null
  venue_notes: string | null
  created_at: string
}

export interface NewsArticle {
  id: string
  title: string
  summary: string | null
  content: string | null
  url: string | null
  image_url: string | null
  source: string | null
  category: string | null
  tags: string[] | null
  is_featured: boolean
  published_at: string
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  paper_id: string
  score: number
  total_marks: number
  correct_answers: number
  wrong_answers: number
  skipped_answers: number
  time_taken_seconds: number
  answers: Record<string, string>
  completed_at: string
  created_at: string
}

export interface UserBookmark {
  id: string
  user_id: string
  paper_id: string
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  subject_id: string
  total_score: number
  total_marks: number
  attempts_count: number
  last_attempted_at: string
  created_at: string
}

// ── Query Helpers ─────────────────────────────────────────────────────────────

export async function fetchBoards(): Promise<Board[]> {
  const { data } = await supabase.from('boards').select('*').order('display_order')
  return data ?? []
}

export async function fetchExams(boardId?: string): Promise<Exam[]> {
  let q = supabase.from('exams').select('*').order('display_order')
  if (boardId) q = q.eq('board_id', boardId)
  const { data } = await q
  return data ?? []
}

export async function fetchCourses(examId?: string): Promise<Course[]> {
  let q = supabase.from('courses').select('*').order('display_order')
  if (examId) q = q.eq('exam_id', examId)
  const { data } = await q
  return data ?? []
}

export async function fetchSubjects(courseId?: string): Promise<Subject[]> {
  let q = supabase.from('subjects').select('*').order('display_order')
  if (courseId) q = q.eq('course_id', courseId)
  const { data } = await q
  return data ?? []
}

export async function fetchPapers(filters: {
  boardId?: string
  examId?: string
  courseId?: string
  subjectId?: string
  paperType?: string
  year?: number
  difficulty?: string
  search?: string
  limit?: number
  offset?: number
} = {}): Promise<QuestionPaper[]> {
  const { limit = 20, offset = 0 } = filters
  let q = supabase
    .from('question_papers')
    .select('*, boards(short_name), exams(name), subjects(name)')
    .order('year', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filters.boardId) q = q.eq('board_id', filters.boardId)
  if (filters.examId) q = q.eq('exam_id', filters.examId)
  if (filters.courseId) q = q.eq('course_id', filters.courseId)
  if (filters.subjectId) q = q.eq('subject_id', filters.subjectId)
  if (filters.paperType) q = q.eq('paper_type', filters.paperType)
  if (filters.year) q = q.eq('year', filters.year)
  if (filters.difficulty) q = q.eq('difficulty', filters.difficulty)
  if (filters.search) q = q.ilike('title', `%${filters.search}%`)

  const { data } = await q
  return (data as QuestionPaper[]) ?? []
}

export async function fetchPaperById(paperId: string): Promise<QuestionPaper | null> {
  const { data } = await supabase
    .from('question_papers')
    .select('*, boards(short_name), exams(name), subjects(name)')
    .eq('id', paperId)
    .maybeSingle()
  return data as QuestionPaper | null
}

export async function fetchPaperQuestions(paperId: string): Promise<PaperQuestion[]> {
  const { data } = await supabase
    .from('paper_questions')
    .select('*')
    .eq('paper_id', paperId)
    .order('question_order')
  return data ?? []
}

export async function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('quiz_attempts').insert(attempt)
}

export async function fetchUserAttempts(userId: string, limit = 50): Promise<QuizAttempt[]> {
  const { data } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function fetchTimetables(boardId?: string): Promise<(ExamTimetable & { entries: TimetableEntry[] })[]> {
  let q = supabase.from('exam_timetables').select('*, entries:timetable_entries(*)').order('created_at', { ascending: false })
  if (boardId) q = q.eq('board_id', boardId)
  const { data } = await q
  return (data as (ExamTimetable & { entries: TimetableEntry[] })[]) ?? []
}

export async function fetchNews(options: {
  category?: string
  featured?: boolean
  search?: string
  limit?: number
  offset?: number
} = {}): Promise<NewsArticle[]> {
  const { limit = 20, offset = 0 } = options
  let q = supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options.category) q = q.eq('category', options.category)
  if (options.featured) q = q.eq('is_featured', true)
  if (options.search) q = q.textSearch('search_vector', options.search, { type: 'websearch' })

  const { data } = await q
  return data ?? []
}

export async function fetchBookmarks(userId: string): Promise<UserBookmark[]> {
  const { data } = await supabase.from('user_bookmarks').select('*').eq('user_id', userId)
  return data ?? []
}

export async function toggleBookmark(userId: string, paperId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('user_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('paper_id', paperId)
    .maybeSingle()

  if (existing) {
    await supabase.from('user_bookmarks').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('user_bookmarks').insert({ user_id: userId, paper_id: paperId })
    return true
  }
}

export async function upsertUserProgress(
  userId: string,
  subjectId: string,
  score: number,
  totalMarks: number
): Promise<void> {
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .maybeSingle()

  if (existing) {
    await supabase.from('user_progress').update({
      total_score: existing.total_score + score,
      total_marks: existing.total_marks + totalMarks,
      attempts_count: existing.attempts_count + 1,
      last_attempted_at: new Date().toISOString(),
    }).eq('id', existing.id)
  } else {
    await supabase.from('user_progress').insert({
      user_id: userId,
      subject_id: subjectId,
      total_score: score,
      total_marks: totalMarks,
      attempts_count: 1,
      last_attempted_at: new Date().toISOString(),
    })
  }
}
