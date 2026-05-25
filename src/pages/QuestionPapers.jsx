import React, { useState } from 'react'
import { QUESTION_BANK, MOCK_TESTS } from '../data/questions'
import { Search, Download, Eye, Filter, FileText, Calendar } from 'lucide-react'

const YEARS = ['2025','2024','2023','2022','2021','2020','2019','2018']

const PAPER_LIST = [
  { id:'upsc_2024_pre', title:'UPSC CSE Prelims 2024', exam:'UPSC', year:'2024', paper:'GS Paper I', questions:100, pages:24, downloads:45230 },
  { id:'upsc_2023_pre', title:'UPSC CSE Prelims 2023', exam:'UPSC', year:'2023', paper:'GS Paper I', questions:100, pages:24, downloads:89430 },
  { id:'upsc_2023_csat', title:'UPSC CSE Prelims 2023', exam:'UPSC', year:'2023', paper:'CSAT Paper II', questions:80, pages:20, downloads:67320 },
  { id:'ssc_cgl_2024', title:'SSC CGL Tier-I 2024', exam:'SSC CGL', year:'2024', paper:'All Shifts', questions:100, pages:20, downloads:128560 },
  { id:'ssc_cgl_2023', title:'SSC CGL Tier-I 2023', exam:'SSC CGL', year:'2023', paper:'All Shifts', questions:100, pages:20, downloads:210340 },
  { id:'ibps_po_2024', title:'IBPS PO Prelims 2024', exam:'IBPS PO', year:'2024', paper:'Prelims', questions:100, pages:18, downloads:89430 },
  { id:'sbi_po_2024', title:'SBI PO Prelims 2024', exam:'SBI PO', year:'2024', paper:'Prelims', questions:100, pages:18, downloads:76230 },
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

export default function QuestionPapers() {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [examFilter, setExamFilter] = useState('all')
  const [previewId, setPreviewId] = useState(null)

  const exams = [...new Set(PAPER_LIST.map(p => p.exam))]

  const filtered = PAPER_LIST.filter(p => {
    if (yearFilter !== 'all' && p.year !== yearFilter) return false
    if (examFilter !== 'all' && p.exam !== examFilter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.exam.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Question Papers 📄</h1>
          <p className="page-subtitle">Previous year question papers with solutions — 10+ years, all major exams</p>
        </div>
        <div className="stat-pill">📥 {PAPER_LIST.reduce((a,p) => a + p.downloads,0).toLocaleString()} downloads</div>
      </div>

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

      {/* Papers Grid */}
      <div className="grid-3" style={{ gap: 14 }}>
        {filtered.map(paper => (
          <div key={paper.id} className="card card-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{paper.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{paper.paper}</div>
              </div>
              <span style={{ fontSize: '0.7rem', background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', borderRadius: 'var(--r-full)', padding: '3px 10px', fontWeight: 700, flexShrink: 0 }}>{paper.year}</span>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>📝 {paper.questions} Qs</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>📄 {paper.pages} pages</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>📥 {(paper.downloads/1000).toFixed(1)}K</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPreviewId(previewId === paper.id ? null : paper.id)} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <Eye size={13} /> Preview
              </button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={13} /> Download
              </button>
            </div>
            {previewId === paper.id && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: '0.8rem', color: 'var(--text-2)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Sample Questions:</div>
                {(QUESTION_BANK.upsc?.history || QUESTION_BANK.upsc?.polity || []).slice(0,2).map((q,i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Q{i+1}. {q.text}</div>
                    {q.options.map((o,j) => (
                      <div key={j} style={{ color: j === q.correct ? 'var(--emerald)' : 'var(--text-3)', paddingLeft: 8, fontSize: '0.75rem' }}>
                        {String.fromCharCode(65+j)}) {o} {j === q.correct && '✓'}
                      </div>
                    ))}
                  </div>
                ))}
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
