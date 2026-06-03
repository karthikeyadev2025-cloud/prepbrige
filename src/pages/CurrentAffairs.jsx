import { useState, useMemo, useEffect } from 'react'
import { getAutoUpdatedCurrentAffairs } from '../services/currentAffairsService'
import { getSupabaseCurrentAffairs } from '../services/supabaseService'
import { NEWSPAPER_TOPICS, MOCK_INTERVIEW_PREP } from '../data/currentAffairs'
import { Search, Bookmark, ChevronDown, Newspaper, RefreshCw, Award, Sparkles, Mic, Heart, Star, CheckCircle, Brain } from 'lucide-react'
import { useAppStore } from '../store/useStore'
import { toast } from 'react-hot-toast'

const CATEGORIES = ['All', 'Economy', 'Science & Technology', 'International Relations', 'Government Schemes', 'Defence & Security', 'Banking & Finance', 'Education', 'Environment & Energy']
const IMPORTANCE = ['All', 'high', 'medium', 'low']

export default function CurrentAffairs() {
  const [activeTab, setActiveTab] = useState('bulletin') // 'bulletin', 'editorials_pride', 'mock_interview'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [importance, setImportance] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [articles, setArticles] = useState([])
  const { bookmarks, toggleBookmark } = useAppStore()

  // Mock Interview State
  const [expandedInterview, setExpandedInterview] = useState(null)
  const [showGuidance, setShowGuidance] = useState(null)
  const [showSample, setShowSample] = useState(null)
  const [userDraftAnswers, setUserDraftAnswers] = useState({})
  const [socraticFeedback, setSocraticFeedback] = useState({})
  const [evaluatingId, setEvaluatingId] = useState(null)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    const supabaseData = await getSupabaseCurrentAffairs()
    if (supabaseData && supabaseData.length > 0) {
      setArticles(supabaseData)
    } else {
      setArticles(getAutoUpdatedCurrentAffairs())
    }
  }

  const filtered = useMemo(() => articles.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'All' && item.category !== category) return false
    if (importance !== 'All' && item.importance !== importance) return false
    return true
  }), [articles, search, category, importance])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadArticles()
    setRefreshing(false)
    toast.success('Current affairs & editorials updated! ✓')
  }

  const handleSocraticEvaluation = (id, topic, draft) => {
    if (!draft || draft.trim().length < 15) {
      toast.error('Please draft a more comprehensive response (minimum 15 characters) before requesting Socratic critique!')
      return
    }

    setEvaluatingId(id)
    setTimeout(() => {
      // Analyze user draft answer locally for Socratic elements
      const wordCount = draft.split(/\s+/).length
      const containsStateIssues = draft.toLowerCase().includes('coastal') || draft.toLowerCase().includes('coast') || draft.toLowerCase().includes('bifurcation') || draft.toLowerCase().includes('reorganisation') || draft.toLowerCase().includes('hub') || draft.toLowerCase().includes('andhra') || draft.toLowerCase().includes('telangana')
      const containsPolity = draft.toLowerCase().includes('priority') || draft.toLowerCase().includes('public') || draft.toLowerCase().includes('admin') || draft.toLowerCase().includes('peoples') || draft.toLowerCase().includes('officer')
      
      let evaluation = {
        score: Math.min(10, Math.max(5, Math.round(5 + (wordCount / 20) + (containsStateIssues ? 2 : 0) + (containsPolity ? 1 : 0)))),
        critique: '',
        suggestions: []
      }

      if (id === 'i3') { // bifurcation
        if (draft.toLowerCase().includes('fair') || draft.toLowerCase().includes('collaborative') || draft.toLowerCase().includes('mutual') || draft.toLowerCase().includes('gateway') || draft.toLowerCase().includes('both states')) {
          evaluation.critique = "Excellent job! You maintained a highly objective, balanced, and constructive perspective on state reorganisation. Your focus on collaborative economics rather than political friction shows true administrative maturity."
          evaluation.suggestions = [
            "Mention specific resource potentials like AP's 974 km coastline and Telangana's pharma clusters.",
            "Cite Section 5 (Hyderabad Capital) or Section 90 (Polavaram project) to ground your answer in the Reorganisation Act."
          ]
        } else {
          evaluation.critique = "A decent start, but the response could benefit from greater neutrality. Avoid taking political sides or focusing heavily on bifurcation grievances. As an administrator, your tone should be balanced and constructive."
          evaluation.suggestions = [
            "Reframe the answer to focus on mutual economic growth (Telangana's IT hub + AP's blue economy/ports).",
            "Emphasize inter-state water management panels (Krishna & Godavari boards) as collaborative solutions."
          ]
        }
      } else if (id === 'i2') { // law and order
        if (draft.toLowerCase().includes('safety') || draft.toLowerCase().includes('emergency') || draft.toLowerCase().includes('contain') || draft.toLowerCase().includes('patrol')) {
          evaluation.critique = "Strong tactical framing! You correctly prioritized immediate safety and tactical containment before moving to mediation. This exhibits crisp crisis decision-making."
          evaluation.suggestions = [
            "Mention the deployment of local safety divisions (such as TS SHE Teams or AP Disha Police officers).",
            "Highlight pacifying rumors through local press and active community liaisoning."
          ]
        } else {
          evaluation.critique = "Your response is somewhat passive. When managing a law-and-order crisis, an administrator must show direct, immediate decision-making to contain violence and ensure safety."
          evaluation.suggestions = [
            "Use a 3-phase structure: 1. Contain & Secure, 2. Mediate & Pacify, 3. Long-term Rehabilitation.",
            "Explicitly reference Section 144 CrPC or deploying SHE Teams/Disha patrol vans to pacify ground issues."
          ]
        }
      } else { // personality & motivation
        if (wordCount > 30) {
          evaluation.critique = "Great descriptive response. You have effectively linked your personal trajectory to nation-building and developmental scale."
          evaluation.suggestions = [
            "Ensure you avoid standard clichés like 'I want to serve the poor'. Highlight specific career diversity.",
            "Mention how being a first-generation representative allows you to inspire regional semi-urban/rural youth."
          ]
        } else {
          evaluation.critique = "Your motivation statement is a bit brief. The board looks for deep personal conviction combined with a realistic understanding of administrative work."
          evaluation.suggestions = [
            "Elaborate on the 'scale of impact' that only public services offer.",
            "Connect the answer to a personal anecdote or a specific developmental program you find inspiring."
          ]
        }
      }

      setSocraticFeedback(prev => ({
        ...prev,
        [id]: evaluation
      }))
      setEvaluatingId(null)
      toast.success('K² Socratic critique compiled successfully! 🧠✨')
    }, 1800)
  }

  const importanceBadge = { high: 'badge-red', medium: 'badge-amber', low: 'badge-emerald' }

  return (
    <div className="page animate-fade-in">
      {/* Title section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>Current Affairs & India Pride</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot-live" />
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Daily Newspaper Analysis • Proud to be an Indian Tracker • Socratic Mock Interview Coach</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleRefresh} style={{ gap: 8 }}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          {refreshing ? 'Updating Core...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 6, marginBottom: 24, gap: 6 }}>
        <button onClick={() => setActiveTab('bulletin')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: activeTab === 'bulletin' ? 'var(--grad)' : 'none', border: 'none', borderRadius: 'var(--r-sm)', color: activeTab === 'bulletin' ? 'white' : 'var(--text-3)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'var(--t)' }}>
          <Newspaper size={16} /> Live Bulletins
        </button>
        <button onClick={() => setActiveTab('editorials_pride')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: activeTab === 'editorials_pride' ? 'var(--grad)' : 'none', border: 'none', borderRadius: 'var(--r-sm)', color: activeTab === 'editorials_pride' ? 'white' : 'var(--text-3)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'var(--t)' }}>
          <Award size={16} /> Editorials & India Pride
        </button>
        <button onClick={() => setActiveTab('mock_interview')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: activeTab === 'mock_interview' ? 'var(--grad)' : 'none', border: 'none', borderRadius: 'var(--r-sm)', color: activeTab === 'mock_interview' ? 'white' : 'var(--text-3)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'var(--t)' }}>
          <Mic size={16} /> Mock Interview Coach
        </button>
      </div>

      {/* TAB 1: Live Bulletins */}
      {activeTab === 'bulletin' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {/* Filters */}
          <div className="card card-p" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '8px 16px', flex: 1, minWidth: 200 }}>
                <Search size={14} color="var(--text-3)" />
                <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.88rem', width: '100%', fontFamily: 'inherit' }}
                  placeholder="Search daily bulletin..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {filtered.map((item) => (
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
                      <div style={{ animation: 'fadeUp 0.3s ease', marginTop: 10 }}>
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
      )}

      {/* TAB 2: Editorials & India Pride */}
      {activeTab === 'editorials_pride' && (
        <div style={{ animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* SECTION A: Proud to be an Indian Moments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Heart size={20} color="var(--amber)" fill="var(--amber)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Proud to be an Indian Moments 🇮🇳</h3>
            </div>
            
            <div className="grid-2" style={{ gap: 16 }}>
              {NEWSPAPER_TOPICS.filter(item => item.isPrideMoment).map(item => (
                <div key={item.id} className="card card-p" style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: '0 8px 30px rgba(245, 158, 11, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(15px)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Sparkles size={16} color="var(--amber)" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>NATIONAL PRIDE</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{item.date}</span>
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.4 }}>
                        {item?.title?.split(': ')[1] || item.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                        {item.summary}
                      </p>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.06)',
                        borderLeft: '3px solid var(--amber)',
                        borderRadius: '0 var(--r-sm) var(--r-sm) 0',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                        color: 'var(--text-1)'
                      }}>
                        {item.prideDetails}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: Daily Newspaper Editorials */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Newspaper size={20} color="var(--cyan)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Daily Newspaper Editorials & Op-Eds</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {NEWSPAPER_TOPICS.map(item => (
                <div key={item.id} className="card card-p ca-card" style={{ border: '1px solid var(--border)', transition: 'var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className={`badge ${item.source === 'The Hindu' ? 'badge-purple' : 'badge-cyan'}`}>{item.source}</span>
                        <span className="badge badge-purple">{item.paper}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginLeft: 'auto' }}>{item.date}</span>
                      </div>
                      <h4 style={{ marginBottom: 8, lineHeight: 1.4, fontWeight: 700 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 12, color: 'var(--text-2)' }}>
                        {item.summary}
                      </p>
                      
                      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                          <strong>Syllabus Relevance:</strong> <span style={{ color: 'var(--cyan)' }}>{item.examRelevance}</span>
                        </div>
                        {item.isPrideMoment && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600 }}>
                            <Star size={12} fill="var(--amber)" /> National Pride Tracker Included
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mock Interview Coach */}
      {activeTab === 'mock_interview' && (
        <div style={{ animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Socratic intro header */}
          <div className="card card-p" style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={24} color="var(--purple)" />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'white' }}>K² Socratic Mock Interview Coach</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                Master administrative personality boards. Practice situational challenges, motivation queries, and regional AP/TS questions in a completely balanced, objective framework. Draft your answers and click evaluation to trigger immediate, constructive Socratic feedback.
              </p>
            </div>
          </div>

          {/* Interactive Prompts list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {MOCK_INTERVIEW_PREP.map((item) => {
              const isExpanded = expandedInterview === item.id
              const hasFeedback = socraticFeedback[item.id]
              const isEvaluating = evaluatingId === item.id
              const draft = userDraftAnswers[item.id] || ''

              return (
                <div key={item.id} className="card card-p ca-card" style={{
                  border: isExpanded ? '1px solid var(--purple)' : '1px solid var(--border)',
                  transition: 'var(--t)'
                }}>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem', marginBottom: 6 }}>{item.category.toUpperCase()}</span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white', lineHeight: 1.4 }}>
                        {item.topic}
                      </h4>
                    </div>
                    <button onClick={() => setExpandedInterview(isExpanded ? null : item.id)} className="btn btn-outline btn-sm" style={{ gap: 6, padding: '6px 12px', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      {isExpanded ? 'Minimize Coach' : 'Open Interview Panel'} <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : '', transition: 'var(--t)' }} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ animation: 'fadeUp 0.25s ease', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 12 }}>
                      
                      {/* Subsegment buttons */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => { setShowGuidance(showGuidance === item.id ? null : item.id); setShowSample(null); }} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: showGuidance === item.id ? 'var(--cyan)' : 'var(--border)', color: showGuidance === item.id ? 'var(--cyan)' : 'var(--text-2)' }}>
                          💡 View Interview Board Guidance
                        </button>
                        <button onClick={() => { setShowSample(showSample === item.id ? null : item.id); setShowGuidance(null); }} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: showSample === item.id ? 'var(--amber)' : 'var(--border)', color: showSample === item.id ? 'var(--amber)' : 'var(--text-2)' }}>
                          ⭐ View Expert Sample Answer
                        </button>
                      </div>

                      {/* Guidance Block */}
                      {showGuidance === item.id && (
                        <div style={{
                          background: 'rgba(0, 212, 255, 0.04)',
                          borderLeft: '4px solid var(--cyan)',
                          borderRadius: '0 var(--r-md) var(--r-md) 0',
                          padding: '12px 16px',
                          fontSize: '0.84rem',
                          lineHeight: 1.55,
                          animation: 'fadeUp 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--cyan)', marginBottom: 6 }}>
                            <Sparkles size={14} /> BOARD GUIDANCE & TACTICAL APPROACH
                          </div>
                          {item.guidance}
                        </div>
                      )}

                      {/* Sample Answer Block */}
                      {showSample === item.id && (
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.04)',
                          borderLeft: '4px solid var(--amber)',
                          borderRadius: '0 var(--r-md) var(--r-md) 0',
                          padding: '12px 16px',
                          fontSize: '0.84rem',
                          lineHeight: 1.55,
                          animation: 'fadeUp 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--amber)', marginBottom: 6 }}>
                            <CheckCircle size={14} /> MODEL SOCRATIC ANSWER (NEUTRAL & OBJECTIVE)
                          </div>
                          "{item.sampleAnswer}"
                        </div>
                      )}

                      {/* Draft Answer Area */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' }}>Draft Your Response below:</label>
                        <textarea
                          rows={3}
                          value={draft}
                          onChange={e => setUserDraftAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Type your response here. For example, explain how you would coordinate inter-state agencies or manage regional requirements..."
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: 12,
                            color: 'var(--text-1)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            outline: 'none',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                          <button
                            disabled={isEvaluating}
                            onClick={() => handleSocraticEvaluation(item.id, item.topic, draft)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: 6, padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            {isEvaluating ? (
                              <>
                                <RefreshCw size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                K² Socratic Parsing...
                              </>
                            ) : (
                              <>
                                <Brain size={12} />
                                Get Socratic Feedback
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Socratic Feedback Result */}
                      {hasFeedback && !isEvaluating && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(0, 212, 255, 0.03))',
                          border: '1px solid rgba(124, 58, 237, 0.25)',
                          borderRadius: 'var(--r-md)',
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          animation: 'fadeUp 0.3s ease'
                        }}>
                          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#a855f7', fontSize: '0.88rem' }}>
                              <Brain size={15} /> K² SOCRATIC EVALUATION BRIEF
                            </div>
                            <span className="badge badge-purple" style={{ fontWeight: 800 }}>BOARD RATING: {hasFeedback.score} / 10</span>
                          </div>
                          
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>
                            {hasFeedback.critique}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recommendations to reach 10/10:</div>
                            {hasFeedback.suggestions.map((sug, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--cyan)', lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 'bold' }}>→</span>
                                <span>{sug}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}

