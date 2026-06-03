import { useState } from 'react'
import { EXAM_CATEGORIES, ALL_STATES } from '../data/exams'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ExamHub() {

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeLevel, setActiveLevel] = useState('all')
  const [selectedState, setSelectedState] = useState('')

  const filtered = EXAM_CATEGORIES.filter(cat => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) return false
    return true
  }).map(cat => ({
    ...cat,
    exams: cat.exams.filter(e => {
      if (activeLevel === 'central' && e.level !== 'central') return false
      if (activeLevel === 'state' && e.level !== 'state') return false
      if (selectedState && e.state && e.state !== selectedState) return false
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.fullName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  })).filter(cat => cat.exams.length > 0)

  const totalExams = EXAM_CATEGORIES.reduce((a, c) => a + c.exams.length, 0)

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Hub 📚</h1>
          <p className="page-subtitle">Browse {totalExams}+ exams across all categories — central & state</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="stat-pill">🏛️ {EXAM_CATEGORIES.filter(c => c.exams.some(e => e.level === 'central')).length} Central</div>
          <div className="stat-pill">🗺️ State PSCs & Police</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
            <Search size={14} color="var(--text-3)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', width: '100%', fontFamily: 'inherit', fontSize: '0.9rem' }} placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {[['all','All'],['central','Central'],['state','State']].map(([v,l]) => (
              <button key={v} className={`tab ${activeLevel===v?'active':''}`} onClick={() => setActiveLevel(v)}>{l}</button>
            ))}
          </div>
          {activeLevel === 'state' && (
            <select className="form-select" style={{ width: 'auto' }} value={selectedState} onChange={e => setSelectedState(e.target.value)}>
              <option value="">All States</option>
              {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={() => setActiveCategory('all')} className={`btn btn-sm ${activeCategory==='all' ? 'btn-primary' : 'btn-outline'}`}>All</button>
        {EXAM_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`btn btn-sm ${activeCategory===cat.id ? 'btn-primary' : 'btn-outline'}`}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Exam Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <p>No exams found. Try different filters.</p>
        </div>
      ) : filtered.map(cat => (
        <div key={cat.id} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
            <h3 style={{ margin: 0, color: cat.color }}>{cat.label}</h3>
            <span style={{ fontSize: '0.78rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '2px 10px', color: 'var(--text-3)' }}>{cat.exams.length} exams</span>
          </div>
          <div className="grid-3" style={{ gap: 14 }}>
            {cat.exams.map(exam => (
              <div key={exam.id} className="card card-hover" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${cat.color}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: cat.color, opacity: 0.06, borderRadius: '0 0 0 80px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{exam.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{exam.fullName}</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: exam.level === 'central' ? 'rgba(124,58,237,0.15)' : 'rgba(8,145,178,0.15)', color: exam.level === 'central' ? 'var(--purple)' : 'var(--cyan)', fontWeight: 700 }}>
                    {exam.level === 'central' ? 'Central' : exam.state || 'State'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  {exam.vacancies && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.88rem' }}>{exam.vacancies.toLocaleString()}</span> vacancies
                    </div>
                  )}
                  {exam.nextDate && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      📅 {new Date(exam.nextDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/app/mock-tests`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    Mock Test
                  </Link>
                  <Link to={`/app/question-papers`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    PYQs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
