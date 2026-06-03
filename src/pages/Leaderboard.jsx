import { useState, useEffect } from 'react'
import { Crown, ChevronUp, ChevronDown, Minus, Trophy, RefreshCw } from 'lucide-react'
import { useUserStore, useAppStore } from '../store/useStore'
import { getAllSupabaseProfiles } from '../services/supabaseService'

const MOCK_LEADERS = [
  { rank:1, name:'Arjun Sharma', state:'Rajasthan', exam:'UPSC', score:2840, streak:45, avatar:'A', change:0 },
  { rank:2, name:'Priya Nair', state:'Kerala', exam:'IBPS PO', score:2720, streak:38, avatar:'P', change:1 },
  { rank:3, name:'Ravi Kumar', state:'Bihar', exam:'SSC CGL', score:2650, streak:52, avatar:'R', change:-1 },
  { rank:4, name:'Anita Patel', state:'Gujarat', exam:'UPSC', score:2580, streak:29, avatar:'A', change:2 },
  { rank:5, name:'Suresh Rao', state:'Karnataka', exam:'RRB NTPC', score:2510, streak:41, avatar:'S', change:0 },
  { rank:6, name:'Kavya Singh', state:'UP', exam:'CTET', score:2440, streak:33, avatar:'K', change:3 },
  { rank:7, name:'Mohit Jain', state:'MP', exam:'SSC CGL', score:2380, streak:25, avatar:'M', change:-2 },
  { rank:8, name:'Deepa Reddy', state:'Telangana', exam:'SBI PO', score:2310, streak:48, avatar:'D', change:1 },
  { rank:9, name:'Amit Yadav', state:'UP', exam:'UPSC', score:2240, streak:37, avatar:'A', change:0 },
  { rank:10, name:'Sneha Pillai', state:'Maharashtra', exam:'MPSC', score:2180, streak:22, avatar:'S', change:4 },
]

const RANK_COLORS = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' }

export default function Leaderboard() {
  const [period, setPeriod] = useState('weekly')
  const [examFilter, setExamFilter] = useState('all')
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useUserStore()
  const { streak, totalPoints } = useAppStore()

  useEffect(() => {
    async function fetchLeaders() {
      setLoading(true)
      try {
        const profiles = await getAllSupabaseProfiles()

        if (profiles.length > 0) {
          // Build leaderboard from real Supabase data, sorted by points descending
          const ranked = profiles
            .sort((a, b) => (b.streak || 0) - (a.streak || 0) || (b.points || 0) - (a.points || 0))
            .map((p, i) => ({
              rank: i + 1,
              id: p.id,
              name: p.name || 'Aspirant',
              state: p.state || 'India',
              exam: (p.exams?.[0] || p.primaryTarget || 'General').toUpperCase(),
              score: p.points || 0,
              streak: p.streak || 0,
              avatar: (p.name || 'A')[0].toUpperCase(),
              photoURL: p.photoURL || null,
              change: 0,
              isCurrentUser: p.id === profile?.uid,
            }))
          setLeaders(ranked)
        } else {
          // Fallback to illustrative mock data when database is empty
          setLeaders(MOCK_LEADERS.map(l => ({ ...l, isCurrentUser: false })))
        }
      } catch {
        setLeaders(MOCK_LEADERS.map(l => ({ ...l, isCurrentUser: false })))
      }
      setLoading(false)
    }
    fetchLeaders()
  }, [profile?.uid])

  // Merge current user into leaderboard if they aren't already in it
  const allLeaders = (() => {
    if (!profile?.uid || leaders.some(l => l.isCurrentUser)) return leaders
    const myEntry = {
      rank: leaders.length + 1,
      id: profile.uid,
      name: profile.name || profile.displayName || 'You',
      state: profile.state || 'India',
      exam: ((profile.exams?.[0] || profile.primaryTarget || 'General')).toUpperCase(),
      score: totalPoints || 0,
      streak: streak || 0,
      avatar: (profile.name || profile.displayName || 'U')[0].toUpperCase(),
      photoURL: profile.photoURL || null,
      change: 0,
      isCurrentUser: true,
    }
    return [...leaders, myEntry].sort((a, b) => b.score - a.score).map((l, i) => ({ ...l, rank: i + 1 }))
  })()

  const myEntry = allLeaders.find(l => l.isCurrentUser)
  const myRank = myEntry?.rank || 42
  const myScore = totalPoints || 0
  const myStreak = streak || 0

  const filteredLeaders = allLeaders.filter(l => {
    if (examFilter !== 'all') {
      const examMatch = l.exam.toLowerCase().includes(examFilter.toLowerCase())
      if (!examMatch) return false
    }
    return true
  })

  const getLeaderAtRank = (pos) => filteredLeaders[pos - 1] || MOCK_LEADERS[pos - 1] || { rank: pos, name: 'Aspirant', avatar: '?', score: 0, streak: 0 }
  const top3 = [getLeaderAtRank(2), getLeaderAtRank(1), getLeaderAtRank(3)]

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={24} color="var(--amber)" /> Leaderboard
          </h1>
          <p className="page-subtitle">Top performers across India — climb the ranks daily</p>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.8rem' }}>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading ranks...
          </div>
        )}
      </div>

      {/* My Stats */}
      <div className="card card-p" style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(0,212,255,0.08))', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--purple)' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                {(profile?.name || profile?.displayName || 'U')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Your Ranking</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{profile?.state || 'India'} • {(profile?.exams?.[0] || 'All Exams').toUpperCase()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--cyan)' }}>#{myRank}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>All India Rank</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--purple)' }}>{myScore.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Points</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--amber)' }}>🔥 {myStreak}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && filteredLeaders.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 32 }}>
          {top3.map((leader, idx) => {
            const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3
            const heights = { 1: 140, 2: 110, 3: 90 }
            return (
              <div key={pos} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {pos === 1 && <Crown size={24} color="#ffd700" style={{ filter: 'drop-shadow(0px 2px 8px rgba(255,215,0,0.4))' }} />}
                {leader.photoURL ? (
                  <img src={leader.photoURL} alt={leader.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${RANK_COLORS[pos]}`, boxShadow: `0 0 20px ${RANK_COLORS[pos]}55` }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg,${RANK_COLORS[pos]},${RANK_COLORS[pos]}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#000', boxShadow: `0 0 20px ${RANK_COLORS[pos]}55` }}>
                    {leader.avatar}
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: leader.isCurrentUser ? 'var(--cyan)' : 'var(--text-1)' }}>
                  {(leader?.name || 'Aspirant').split(' ')[0]}{leader.isCurrentUser ? ' (You)' : ''}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{leader.score.toLocaleString()} pts</div>
                <div style={{ height: heights[pos], width: 80, background: `linear-gradient(180deg,${RANK_COLORS[pos]}33,${RANK_COLORS[pos]}11)`, border: `1px solid ${RANK_COLORS[pos]}55`, borderRadius: 'var(--r-md) var(--r-md) 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: RANK_COLORS[pos] }}>#{pos}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="tabs">
          {[['weekly','This Week'],['monthly','This Month'],['alltime','All Time']].map(([v,l]) => (
            <button key={v} className={`tab ${period===v ? 'active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={examFilter} onChange={e => setExamFilter(e.target.value)}>
          <option value="all">All Exams</option>
          <option value="UPSC">UPSC</option>
          <option value="SSC">SSC CGL</option>
          <option value="IBPS">Banking</option>
          <option value="RRB">Railways</option>
          <option value="NEET">NEET</option>
          <option value="JEE">JEE</option>
        </select>
      </div>

      {/* Full List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: 'var(--bg-3)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="leaderboard-row-grid">
          <div>Rank</div><div>Student</div><div>Exam</div><div>Streak</div><div>Points</div>
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 40, height: 16, background: 'var(--bg-3)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1, height: 16, background: 'var(--bg-3)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))
        ) : filteredLeaders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            <Trophy size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No students found for this filter.</div>
          </div>
        ) : (
          filteredLeaders.map((l) => (
            <div key={l.rank}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                background: l.isCurrentUser
                  ? 'rgba(0,212,255,0.05)'
                  : l.rank <= 3 ? `${RANK_COLORS[l.rank]}08` : 'transparent',
                transition: 'background 0.2s',
                outline: l.isCurrentUser ? '1px solid rgba(0,212,255,0.25)' : 'none',
              }}
              className="leaderboard-row-grid"
              onMouseEnter={e => e.currentTarget.style.background = l.isCurrentUser ? 'rgba(0,212,255,0.08)' : 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = l.isCurrentUser ? 'rgba(0,212,255,0.05)' : l.rank <= 3 ? `${RANK_COLORS[l.rank]}08` : 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: RANK_COLORS[l.rank] || 'var(--text-2)', width: 26 }}>#{l.rank}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {l.change > 0 ? <ChevronUp size={12} color="var(--emerald)" /> : l.change < 0 ? <ChevronDown size={12} color="var(--red)" /> : <Minus size={10} color="var(--text-4)" />}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {l.photoURL ? (
                  <img src={l.photoURL} alt={l.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: l.isCurrentUser ? '2px solid var(--cyan)' : '1px solid var(--border)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: l.isCurrentUser ? 'var(--grad)' : 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0, border: l.isCurrentUser ? '2px solid var(--cyan)' : '1px solid var(--border)' }}>{l.avatar}</div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: l.isCurrentUser ? 'var(--cyan)' : 'var(--text-1)' }}>
                    {l.name}{l.isCurrentUser ? ' (You)' : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{l.state}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{l.exam}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--amber)', fontWeight: 700 }}>🔥 {l.streak}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: l.isCurrentUser ? 'var(--cyan)' : 'var(--cyan)' }}>{(l.score || 0).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 12 }}>
        Rankings update in real-time · Earn points by completing tests, quizzes, and daily study sessions
      </p>
    </div>
  )
}
