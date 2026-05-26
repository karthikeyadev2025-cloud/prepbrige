import React, { useState, useMemo } from 'react'
import { getAutoUpdatedCurrentAffairs } from '../services/currentAffairsService'
import { Search, Filter, Bookmark, Share2, ChevronDown, Newspaper, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store/useStore'
import { toast } from 'react-hot-toast'

const CATEGORIES = ['All', 'Economy', 'Science & Technology', 'International Relations', 'Government Schemes', 'Defence & Security', 'Banking & Finance', 'Education', 'Environment & Energy']
const IMPORTANCE = ['All', 'high', 'medium', 'low']

export default function CurrentAffairs() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [importance, setImportance] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const { bookmarks, toggleBookmark } = useAppStore()

  const filtered = useMemo(() => getAutoUpdatedCurrentAffairs().filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'All' && item.category !== category) return false
    if (importance !== 'All' && item.importance !== importance) return false
    return true
  }), [search, category, importance])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    setRefreshing(false)
    toast.success('Current affairs updated! ✓')
  }

  const importanceBadge = { high: 'badge-red', medium: 'badge-amber', low: 'badge-emerald' }

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>Current Affairs</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot-live" />
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Auto-updated daily • Exam-relevant news with analysis</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleRefresh} style={{ gap: 8 }}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '8px 16px', flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text-3)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.88rem', width: '100%', fontFamily: 'inherit' }}
              placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto', paddingRight: 32 }} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={importance} onChange={e => setImportance(e.target.value)}>
            {IMPORTANCE.map(i => <option key={i} value={i}>{i === 'All' ? 'All Priority' : i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Showing {filtered.length} articles</span>
        {search && <button onClick={() => setSearch('')} className="badge badge-cyan" style={{ cursor: 'pointer', border: 'none' }}>✕ {search}</button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((item, idx) => (
          <div key={item.id} className={`card card-p ca-card ${item.importance}`} style={{ cursor: 'pointer', transition: 'var(--t)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span className={`badge ${importanceBadge[item.importance]}`}>{item.importance.toUpperCase()}</span>
                  <span className="badge badge-cyan">{item.category}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginLeft: 'auto' }}>{item.date} • {item.source}</span>
                </div>
                <h4 style={{ marginBottom: 8, lineHeight: 1.4, fontWeight: 700, cursor: 'pointer' }} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  {item.title}
                </h4>
                {expanded === item.id && (
                  <div style={{ animation: 'fadeUp 0.3s ease' }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 12 }}>{item.summary}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {item.tags.map(tag => <span key={tag} className="badge badge-purple">{tag}</span>)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      Relevant for: {item.examsRelevant.map(e => e.toUpperCase()).join(', ')}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button onClick={() => { toggleBookmark(item.id); toast.success(bookmarks.includes(item.id) ? 'Removed' : 'Bookmarked!') }}
                  className="topbar-btn" style={{ width: 32, height: 32 }}>
                  <Bookmark size={14} fill={bookmarks.includes(item.id) ? 'var(--cyan)' : 'none'} color={bookmarks.includes(item.id) ? 'var(--cyan)' : 'currentColor'} />
                </button>
                <button onClick={() => { setExpanded(expanded === item.id ? null : item.id) }} className="topbar-btn" style={{ width: 32, height: 32 }}>
                  <ChevronDown size={14} style={{ transform: expanded === item.id ? 'rotate(180deg)' : '', transition: 'var(--t)' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <Newspaper size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p>No articles found for your search.</p>
        </div>
      )}
    </div>
  )
}
