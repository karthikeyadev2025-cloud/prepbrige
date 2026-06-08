import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabaseExamQuestions } from '../services/supabaseService'
import { useUserStore } from '../store/useStore'
import { EXAM_CATEGORIES } from '../data/exams'
import { Search, Zap, Eye, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

const YEARS = ['2025','2024','2023','2022','2021','2020','2019','2018']

const PAPER_LIST = [
  { id:'upsc_2024_pre', title:'UPSC CSE Prelims 2024', exam:'UPSC', year:'2024', paper:'GS Paper I', questions:100, pages:24, downloads:45230 },
  { id:'upsc_2023_pre', title:'UPSC CSE Prelims 2023', exam:'UPSC', year:'2023', paper:'GS Paper I', questions:100, pages:24, downloads:89430 },
  { id:'upsc_2023_csat', title:'UPSC CSE Prelims 2023', exam:'UPSC', year:'2023', paper:'CSAT Paper II', questions:80, pages:20, downloads:67320 },
  { id:'ssc_cgl_2024', title:'SSC CGL Tier-I 2024', exam:'SSC CGL', year:'2024', paper:'All Shifts', questions:100, pages:20, downloads:128560 },
  { id:'ssc_cgl_2023', title:'SSC CGL Tier-I 2023', exam:'SSC CGL', year:'2023', paper:'All Shifts', questions:100, pages:20, downloads:210340 },
  { id:'ibps_po_2024', title:'IBPS PO Prelims 2024', exam:'IBPS PO', year:'2024', paper:'Prelims', questions:100, pages:18, downloads:89430 },
  { id:'sbi_po_2024', title:'SBI PO Prelims 2024', exam:'SBI PO', year:'2024', paper:'Prelims', questions:100, pages:18, downloads:76230 },
  { id:'ibps_clerk_2024', title:'IBPS Clerk Phase-I 2024', exam:'IBPS Clerk', year:'2024', paper:'Prelims', questions:100, pages:16, downloads:65400 },
  { id:'sbi_clerk_2024', title:'SBI Clerk Phase-I 2024', exam:'SBI Clerk', year:'2024', paper:'Prelims', questions:100, pages:16, downloads:71200 },
  { id:'rrb_po_2024', title:'IBPS RRB Officer Scale-I 2024', exam:'RRB PO', year:'2024', paper:'Prelims', questions:80, pages:14, downloads:54300 },
  { id:'rrb_ntpc_2024', title:'RRB NTPC CBT-1 2024', exam:'RRB NTPC', year:'2024', paper:'CBT-1', questions:100, pages:20, downloads:203450 },
  { id:'neet_2024', title:'NEET UG 2024', exam:'NEET UG', year:'2024', paper:'Full Paper', questions:200, pages:40, downloads:312000 },
  { id:'jee_2024_jan', title:'JEE Mains Jan 2024', exam:'JEE Mains', year:'2024', paper:'Session 1', questions:90, pages:22, downloads:189000 },
  { id:'ctet_2024', title:'CTET Dec 2024', exam:'CTET', year:'2024', paper:'Paper I + II', questions:150, pages:30, downloads:98430 },
  { id:'upsc_2022_pre', title:'UPSC CSE Prelims 2022', exam:'UPSC', year:'2022', paper:'GS Paper I', questions:100, pages:24, downloads:134000 },
  { id:'ssc_chsl_2024', title:'SSC CHSL Tier-I 2024', exam:'SSC CHSL', year:'2024', paper:'All Shifts', questions:100, pages:18, downloads:87000 },
  { id:'rbi_grade_b_2024', title:'RBI Grade B 2024', exam:'RBI Grade B', year:'2024', paper:'Phase 1', questions:200, pages:36, downloads:34000 },
  { id:'bpsc_69', title:'BPSC 69th CCE 2024', exam:'BPSC', year:'2024', paper:'Prelims', questions:150, pages:28, downloads:67000 },
  { id:'uppsc_2023', title:'UPPSC PCS 2023', exam:'UPPSC', year:'2023', paper:'Prelims GS', questions:150, pages:30, downloads:56000 },
]

// Map examId to paper exam label (partial match)
function getPaperExamId(examId) {
  // Maps profile examId to paper exam name pattern
  const MAP = {
    ias: 'UPSC', ips: 'UPSC', upsc: 'UPSC',
    ssc_cgl: 'SSC CGL', ssc_chsl: 'SSC CHSL',
    ibps_po: 'IBPS PO', ibps_clerk: 'IBPS Clerk', sbi_po: 'SBI PO', sbi_clerk: 'SBI Clerk',
    rrb_ntpc: 'RRB NTPC', rrb_po: 'RRB PO',
    neet_ug: 'NEET UG', jee_main: 'JEE Mains',
    ctet: 'CTET',
  }
  return MAP[examId] || null
}

export default function QuestionPapers() {
  const { profile } = useUserStore()
  const navigate = useNavigate()
  const userExams = profile?.exams || []
  const primaryTarget = profile?.primaryTarget || null

  // Map user's primaryTarget to a paper exam label for pre-filter
  const defaultExamFilter = useMemo(() => {
    const mapped = getPaperExamId(primaryTarget)
    if (mapped) return mapped
    // Try user's first exam
    for (const e of userExams) {
      const m = getPaperExamId(e)
      if (m) return m
    }
    return 'all'
  }, [primaryTarget, userExams])
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [examFilter, setExamFilter] = useState(defaultExamFilter)
  const [previewId, setPreviewId] = useState(null)
  const [previewQuestions, setPreviewQuestions] = useState({})

  const handlePreviewClick = async (paper) => {
    if (previewId === paper.id) {
      setPreviewId(null)
      return
    }
    setPreviewId(paper.id)
    if (!previewQuestions[paper.id]) {
      let examKey = paper.exam.toLowerCase().replace(' ', '_').replace('-', '_')
      let qList = await getSupabaseExamQuestions(examKey, 2)
      if (qList.length === 0) qList = await getSupabaseExamQuestions('upsc', 2)
      setPreviewQuestions(prev => ({ ...prev, [paper.id]: qList }))
    }
  }

  const [papers, setPapers] = useState(() => {
    const local = localStorage.getItem('prepbridge_auto_updated_papers')
    const parsed = local ? JSON.parse(local) : []
    return [...parsed, ...PAPER_LIST]
  })

  useEffect(() => {
    const handleSync = () => {
      const local = localStorage.getItem('prepbridge_auto_updated_papers')
      const parsed = local ? JSON.parse(local) : []
      setPapers([...parsed, ...PAPER_LIST])
    }
    window.addEventListener('prepbridge-portal-sync', handleSync)
    return () => window.removeEventListener('prepbridge-portal-sync', handleSync)
  }, [])

  const handleSolveOnline = async (paper) => {
    toast.loading(`Preparing online test environment for "${paper.title}"...`, { id: 'pyq-solve' })
    try {
      const testTemplateId = `paper_${paper.id}`
      let examKey = paper.exam.toLowerCase().replace(' ', '_').replace('-', '_')
      let questionsList = await getSupabaseExamQuestions(examKey, 20)
      if (questionsList.length === 0) {
        questionsList = await getSupabaseExamQuestions('upsc', 20)
      }

      // Format questions for Practice Mode
      const parsedQuestions = questionsList.map((q, idx) => ({
        ...q,
        text: `[PYQ Question ${idx + 1}] — ${q.text}`,
        explanation: `📝 Previous Year Question Paper Note: ${q.explanation}`
      }))

      const paperTemplate = {
        id: testTemplateId,
        title: `PYQ Practice: ${paper.title} (${paper.year})`,
        exam: paper.exam,
        totalQuestions: parsedQuestions.length,
        duration: parsedQuestions.length * 2,
        pattern: 'MCQ',
        negativeMarking: -0.25,
        marksPerQuestion: 1,
        syllabus: [`Previous Year Question Paper - ${paper.paper}`],
        attempts: 0,
        avgScore: 0,
        difficulty: 'medium'
      }

      localStorage.setItem(`prepbridge_ai_questions_${testTemplateId}`, JSON.stringify(parsedQuestions))

      const localTests = localStorage.getItem('prepbridge_auto_updated_tests')
      const parsed = localTests ? JSON.parse(localTests) : []
      if (!parsed.some(t => t.id === testTemplateId)) {
        localStorage.setItem('prepbridge_auto_updated_tests', JSON.stringify([paperTemplate, ...parsed]))
      }

      toast.success('Online practice test prepared successfully!', { id: 'pyq-solve' })
      setTimeout(() => {
        navigate(`/app/test/${testTemplateId}`)
      }, 1000)

    } catch (err) {
      console.error('Failed to prepare PYQ practice:', err)
      toast.error('Failed to start online practice. Please try again.', { id: 'pyq-solve' })
    }
  }

  const exams = [...new Set(papers.map(p => p.exam))]

  const filtered = papers.filter(p => {
    if (yearFilter !== 'all' && p.year !== yearFilter) return false
    if (examFilter !== 'all' && p.exam !== examFilter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.exam.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Papers relevant to user's selected exams (for personalization banner)
  const userRelevantExamNames = useMemo(() => {
    return userExams.map(getPaperExamId).filter(Boolean)
  }, [userExams])

  const isRelevantToUser = (paper) => {
    return userRelevantExamNames.some(name => paper.exam?.includes(name) || name?.includes(paper.exam))
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Question Papers 📄</h1>
          <p className="page-subtitle">Previous year question papers with solutions — 10+ years, all major exams</p>
        </div>
        <div className="stat-pill">⚡ {papers.reduce((a, p) => a + p.downloads, 0).toLocaleString()} online practices</div>
      </div>

      {/* Personalization Banner */}
      {userExams.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.07))',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 'var(--r-lg)',
          padding: '12px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.82rem'
        }}>
          <Star size={14} color="var(--purple)" />
          <span style={{ color: 'var(--purple)', fontWeight: 700 }}>Personalized:</span>
          <span style={{ color: 'var(--text-3)' }}>
            Papers relevant to your exams are highlighted with ⭐ and shown first when filtered.
          </span>
          {examFilter !== 'all' && (
            <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setExamFilter('all')}>
              Show All
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
            <Search size={14} color="var(--text-3)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', width: '100%', fontFamily: 'inherit' }} placeholder="Search papers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="all">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={examFilter} onChange={e => setExamFilter(e.target.value)}>
            <option value="all">All Exams</option>
            {exams.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Papers Grid — relevant papers first */}
      <div className="grid-3" style={{ gap: 14 }}>
        {[
          ...filtered.filter(p => isRelevantToUser(p)),
          ...filtered.filter(p => !isRelevantToUser(p))
        ].map(paper => (
          <div key={paper.id} className="card card-hover" style={{
            padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
            border: isRelevantToUser(paper) ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isRelevantToUser(paper) && <span title="Relevant to your exams">⭐</span>}
                  {paper.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{paper.paper}</div>
              </div>
              <span style={{ fontSize: '0.7rem', background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', borderRadius: 'var(--r-full)', padding: '3px 10px', fontWeight: 700, flexShrink: 0 }}>{paper.year}</span>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>📝 {paper.questions} Qs</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>📄 {paper.pages} pages</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>⚡ {(paper.downloads/1000).toFixed(1)}K solved</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handlePreviewClick(paper)} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <Eye size={13} /> Preview
              </button>
              <button onClick={() => handleSolveOnline(paper)} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
                <Zap size={13} /> Solve Online
              </button>
            </div>
            {previewId === paper.id && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: '0.8rem', color: 'var(--text-2)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Sample Questions:</div>
                {(previewQuestions[paper.id] || []).map((q,i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Q{i+1}. {q.text}</div>
                    {q.options.map((o,j) => (
                      <div key={j} style={{ color: j === q.correct ? 'var(--emerald)' : 'var(--text-3)', paddingLeft: 8, fontSize: '0.75rem' }}>
                        {String.fromCharCode(65+j)}) {o} {j === q.correct && '✓'}
                      </div>
                    ))}
                  </div>
                ))}
                {!previewQuestions[paper.id] && <div>Loading...</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p>No papers found. Try different filters.</p>
        </div>
      )}
    </div>
  )
}
