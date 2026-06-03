import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, BookOpen, FileText, ClipboardList, ChevronDown, Bookmark, Clock, Star, X } from 'lucide-react'
import { fetchBoards, fetchExams, fetchCourses, fetchSubjects, fetchPapers, toggleBookmark, type Board, type Exam, type Course, type Subject, type QuestionPaper } from '../lib/supabase'
import { usePlatformStore } from '../store/usePlatformStore'
import { useUserStore } from '../store/useStore'

const PAPER_TYPE_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  question_paper: { label: 'Official', color: '#1E40AF', icon: FileText },
  model_paper:    { label: 'Model', color: '#059669', icon: BookOpen },
  mock_test:      { label: 'Mock Test', color: '#D97706', icon: ClipboardList },
  quiz:           { label: 'Quiz', color: '#0891B2', icon: Star },
}

const DIFFICULTY_META: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Easy', color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  hard:   { label: 'Hard', color: '#EF4444' },
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
      <div style={{ height: 14, width: '70%', background: 'var(--bg-4)', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: 12, width: '50%', background: 'var(--bg-4)', borderRadius: 6, marginBottom: 14, animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 24, width: 70, background: 'var(--bg-4)', borderRadius: 20, animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ height: 24, width: 60, background: 'var(--bg-4)', borderRadius: 20, animation: 'pulse 1.5s ease infinite' }} />
      </div>
    </div>
  )
}

function Chip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? (color ?? '#1E40AF') : 'var(--border)'}`, background: active ? `${color ?? '#1E40AF'}18` : 'var(--bg-3)', color: active ? (color ?? '#60A5FA') : 'var(--text-2)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s' }}>
      {label}
    </button>
  )
}

export default function Papers() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { selectedBoard, selectedExam, bookmarkedPaperIds, toggleBookmarkedPaper } = usePlatformStore()

  const [boards, setBoards] = useState<Board[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [papers, setPapers] = useState<QuestionPaper[]>([])

  const [boardId, setBoardId] = useState<string>(selectedBoard?.id ?? '')
  const [examId, setExamId] = useState<string>(selectedExam?.id ?? '')
  const [courseId, setCourseId] = useState<string>('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [paperType, setPaperType] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 15

  useEffect(() => { fetchBoards().then(setBoards) }, [])
  useEffect(() => { if (boardId) fetchExams(boardId).then(setExams); else setExams([]) }, [boardId])
  useEffect(() => { if (examId) fetchCourses(examId).then(setCourses); else setCourses([]) }, [examId])
  useEffect(() => { if (courseId) fetchSubjects(courseId).then(setSubjects); else setSubjects([]) }, [courseId])

  const load = useCallback(async (reset = false) => {
    const p = reset ? 0 : page
    if (reset) { setPage(0); setLoading(true) }
    const data = await fetchPapers({ boardId: boardId || undefined, examId: examId || undefined, courseId: courseId || undefined, subjectId: subjectId || undefined, paperType: paperType || undefined, difficulty: difficulty || undefined, search: search || undefined, limit: PAGE_SIZE, offset: p * PAGE_SIZE })
    if (reset) setPapers(data)
    else setPapers(prev => [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
    setLoading(false)
  }, [boardId, examId, courseId, subjectId, paperType, difficulty, search, page])

  useEffect(() => { load(true) }, [boardId, examId, courseId, subjectId, paperType, difficulty, search])

  const handleBookmark = async (e: React.MouseEvent, paper: QuestionPaper) => {
    e.stopPropagation()
    toggleBookmarkedPaper(paper.id)
    const uid = (user as any)?.uid
    if (uid) await toggleBookmark(uid, paper.id)
  }

  const handleOpen = (paper: QuestionPaper) => {
    if (paper.paper_type === 'mock_test' || paper.paper_type === 'quiz') {
      navigate(`/app/quiz/${paper.id}`)
    } else if (paper.file_url) {
      window.open(paper.file_url, '_blank')
    }
  }

  const hasFilters = boardId || examId || courseId || subjectId || paperType || difficulty || search

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>Question Papers</h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>Official, model, and mock papers for all boards</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '10px 16px', marginBottom: 12 }}>
        <Search size={15} color="var(--text-3)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers..."
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.88rem', width: '100%', fontFamily: 'inherit' }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}><X size={14} /></button>}
      </div>

      {/* Board / Exam / Course / Subject cascades */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 10, scrollbarWidth: 'none' }}>
        <select value={boardId} onChange={e => { setBoardId(e.target.value); setExamId(''); setCourseId(''); setSubjectId('') }}
          style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid var(--border)', background: boardId ? 'rgba(30,64,175,0.12)' : 'var(--bg-3)', color: boardId ? '#60A5FA' : 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
          <option value="">All Boards</option>
          {boards.map(b => <option key={b.id} value={b.id}>{b.short_name}</option>)}
        </select>
        {exams.length > 0 && (
          <select value={examId} onChange={e => { setExamId(e.target.value); setCourseId(''); setSubjectId('') }}
            style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid var(--border)', background: examId ? 'rgba(5,150,105,0.12)' : 'var(--bg-3)', color: examId ? '#34D399' : 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
            <option value="">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
        {courses.length > 0 && (
          <select value={courseId} onChange={e => { setCourseId(e.target.value); setSubjectId('') }}
            style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid var(--border)', background: courseId ? 'rgba(8,145,178,0.12)' : 'var(--bg-3)', color: courseId ? '#38BDF8' : 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {subjects.length > 0 && (
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid var(--border)', background: subjectId ? 'rgba(217,119,6,0.12)' : 'var(--bg-3)', color: subjectId ? '#FBBF24' : 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {/* Type filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16, scrollbarWidth: 'none' }}>
        <Chip label="All Types" active={!paperType} onClick={() => setPaperType('')} />
        {Object.entries(PAPER_TYPE_META).map(([key, meta]) => (
          <Chip key={key} label={meta.label} active={paperType === key} onClick={() => setPaperType(p => p === key ? '' : key)} color={meta.color} />
        ))}
        <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />
        {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
          <Chip key={key} label={meta.label} active={difficulty === key} onClick={() => setDifficulty(d => d === key ? '' : key)} color={meta.color} />
        ))}
      </div>

      {/* Papers list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : papers.map(paper => {
            const typeMeta = PAPER_TYPE_META[paper.paper_type] ?? PAPER_TYPE_META.question_paper
            const diffMeta = paper.difficulty ? DIFFICULTY_META[paper.difficulty] : null
            const isBookmarked = bookmarkedPaperIds.includes(paper.id)
            const isInteractive = paper.paper_type === 'mock_test' || paper.paper_type === 'quiz'

            return (
              <article key={paper.id}
                onClick={() => handleOpen(paper)}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', cursor: isInteractive || paper.file_url ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${typeMeta.color}50` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${typeMeta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <typeMeta.icon size={18} color={typeMeta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.35 }}>{paper.title}</h4>
                      <button onClick={e => handleBookmark(e, paper)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isBookmarked ? '#1E40AF' : 'var(--text-3)', flexShrink: 0 }}>
                        <Bookmark size={16} fill={isBookmarked ? '#1E40AF' : 'none'} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: `${typeMeta.color}15`, color: typeMeta.color, fontSize: '0.7rem', fontWeight: 700 }}>
                        {typeMeta.label}
                      </span>
                      {diffMeta && (
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: `${diffMeta.color}15`, color: diffMeta.color, fontSize: '0.7rem', fontWeight: 700 }}>
                          {diffMeta.label}
                        </span>
                      )}
                      {paper.year && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{paper.year}</span>}
                      {paper.duration_minutes && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--text-3)' }}>
                          <Clock size={11} /> {paper.duration_minutes}m
                        </span>
                      )}
                      {paper.total_marks > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{paper.total_marks} marks</span>}
                      {(paper.boards as any)?.short_name && (
                        <span style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 600 }}>{(paper.boards as any).short_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        }
      </div>

      {hasMore && !loading && papers.length > 0 && (
        <button onClick={() => { setPage(p => p + 1); load() }}
          style={{ width: '100%', marginTop: 16, padding: 14, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.88rem' }}>
          Load more
        </button>
      )}

      {!loading && papers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <FileText size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No papers found</p>
          <p style={{ fontSize: '0.85rem' }}>Try adjusting filters or search query.</p>
          {hasFilters && (
            <button onClick={() => { setBoardId(''); setExamId(''); setCourseId(''); setSubjectId(''); setPaperType(''); setDifficulty(''); setSearch('') }}
              style={{ marginTop: 12, padding: '8px 20px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
