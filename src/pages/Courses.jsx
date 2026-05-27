import { useState } from 'react'
import { BookOpen, Clock, Star, Users, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useUserStore } from '../store/useStore'

// eslint-disable-next-line react-refresh/only-export-components
export const COURSES = [
  {
    id: 'upsc_complete', title: 'UPSC CSE Complete Course', exam: 'UPSC', icon: '🏛️',
    color: '#7c3aed', lessons: 320, hours: 480, students: 45000, rating: 4.9,
    topics: ['History & Culture','Geography','Indian Polity','Economy','Environment','Science & Tech','Current Affairs'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'appsc_group2', title: 'APPSC Group-2 Complete Course', exam: 'APPSC', icon: '🗺️',
    color: '#0891b2', lessons: 240, hours: 300, students: 32000, rating: 4.8,
    topics: ['AP History','AP Economy','Indian Constitution','Science & Tech','Mental Ability'],
    free: false, instructor: 'PrepBridge Telugu Expert Team'
  },
  {
    id: 'tgpsc_group1', title: 'TGPSC Group-1 Complete Course', exam: 'TGPSC', icon: '🗺️',
    color: '#7c3aed', lessons: 280, hours: 350, students: 28000, rating: 4.9,
    topics: ['Telangana History','Telangana Movement','Indian Polity','Economy','Geography','Science & Tech'],
    free: false, instructor: 'PrepBridge Telangana Expert Team'
  },
  {
    id: 'police_comprehensive', title: 'AP & TS Police SI/Constable Comprehensive', exam: 'AP/TS Police', icon: '👮',
    color: '#1d4ed8', lessons: 200, hours: 250, students: 54000, rating: 4.8,
    topics: ['General Studies','Aptitude & Arithmetic','Reasoning','Basic Penal Codes','SHE Teams & Women Safety'],
    free: true, instructor: 'PrepBridge Police Prep Team'
  },
  {
    id: 'dsc_teaching', title: 'AP & TS DSC SGT/SA Teaching Course', exam: 'AP/TS DSC', icon: '📖',
    color: '#d97706', lessons: 250, hours: 320, students: 41000, rating: 4.8,
    topics: ['Educational Psychology','Pedagogy Methodology','Language I & II','Mathematics & Science','Social Studies'],
    free: false, instructor: 'PrepBridge Pedagogy Team'
  },
  {
    id: 'ssc_cgl_complete', title: 'SSC CGL Tier 1+2 Complete', exam: 'SSC CGL', icon: '📋',
    color: '#0080ff', lessons: 220, hours: 280, students: 89000, rating: 4.8,
    topics: ['Quantitative Aptitude','English Language','Reasoning','General Awareness'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'banking_po', title: 'Banking PO Crash Course', exam: 'IBPS PO / SBI PO', icon: '🏦',
    color: '#059669', lessons: 180, hours: 220, students: 67000, rating: 4.8,
    topics: ['Banking Awareness','English','Reasoning','Maths','Data Interpretation'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'rrb_ntpc', title: 'RRB NTPC CBT 1+2 Course', exam: 'RRB NTPC', icon: '🚂',
    color: '#dc2626', lessons: 160, hours: 200, students: 120000, rating: 4.7,
    topics: ['Mathematics','General Intelligence','General Awareness','Technical Ability'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'neet_physics', title: 'NEET Physics Foundation', exam: 'NEET UG', icon: '⚕️',
    color: '#dc2626', lessons: 120, hours: 160, students: 34000, rating: 4.9,
    topics: ['Mechanics','Thermodynamics','Optics','Electromagnetism','Modern Physics'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'gk_crash', title: 'Static GK Master Class', exam: 'All Exams', icon: '🌍',
    color: '#d97706', lessons: 80, hours: 60, students: 200000, rating: 4.8,
    topics: ['India & World Geography','History','Polity Basics','Sports & Awards','Important Days'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'current_affairs_monthly', title: 'Current Affairs Monthly Digest', exam: 'All Exams', icon: '📰',
    color: '#0891b2', lessons: 60, hours: 40, students: 312000, rating: 4.9,
    topics: ['National News','International Events','Economy','Sports','Science & Tech','Government Schemes'],
    free: false, instructor: 'PrepBridge News Team'
  },
  {
    id: 'reasoning_tricks', title: 'Reasoning Tricks & Shortcuts', exam: 'SSC/Banking/Railways', icon: '🧠',
    color: '#7c3aed', lessons: 90, hours: 70, students: 156000, rating: 4.8,
    topics: ['Puzzles','Syllogism','Blood Relations','Coding-Decoding','Analogy','Series'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
]

export default function Courses() {
  const [filter, setFilter] = useState('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const primaryTarget = profile?.primaryTarget || (profile?.exams && profile.exams[0]) || 'ias'

  const getCourseProgressPct = (course) => {
    let target = null
    const courseId = course.id
    const examName = course.exam.toLowerCase()

    if (examName === 'upsc' || courseId === 'upsc_complete') target = 'ias'
    else if (examName === 'appsc' || courseId === 'appsc_group2') target = 'appsc'
    else if (examName === 'tgpsc' || courseId === 'tgpsc_group1') target = 'tgpsc'
    else if (examName.includes('police') || courseId.includes('police')) target = 'police'
    else if (examName.includes('dsc') || examName.includes('teaching') || courseId.includes('dsc')) target = 'teaching'
    else if (examName.includes('ssc') || courseId.includes('ssc')) target = 'ssc_cgl'
    else if (examName.includes('banking') || examName.includes('po') || examName.includes('clerk') || courseId.includes('banking')) target = 'banking'
    else if (examName.includes('ntpc') || courseId.includes('ntpc')) target = 'rrb_ntpc'
    else if (examName.includes('neet') || courseId.includes('neet')) target = 'neet_ug'
    else if (examName.includes('jee') || courseId.includes('jee')) target = 'jee_main'

    if (!target) return null

    try {
      const saved = localStorage.getItem(`prepbridge_syllabus_progress_${target}`)
      if (saved) {
        const list = JSON.parse(saved)
        if (Array.isArray(list) && list.length > 0) {
          const total = list.reduce((acc, curr) => acc + curr.pct, 0)
          return Math.round(total / list.length)
        }
      }
    } catch (e) {
      console.error('Failed to parse syllabus progress in courses page:', e)
    }

    // Default averages if no progress is saved yet
    const defaults = {
      ias: 66,
      appsc: 63,
      tgpsc: 62,
      police: 63,
      teaching: 67,
      ssc_cgl: 69,
      banking: 68,
      neet_ug: 68,
      jee_main: 68
    }
    return defaults[target] || null
  }

  const isUserPrimaryTarget = (course) => {
    let target = null
    const courseId = course.id
    const examName = course.exam.toLowerCase()

    if (examName === 'upsc' || courseId === 'upsc_complete') target = 'ias'
    else if (examName === 'appsc' || courseId === 'appsc_group2') target = 'appsc'
    else if (examName === 'tgpsc' || courseId === 'tgpsc_group1') target = 'tgpsc'
    else if (examName.includes('police') || courseId.includes('police')) target = 'police'
    else if (examName.includes('dsc') || examName.includes('teaching') || courseId.includes('dsc')) target = 'teaching'
    else if (examName.includes('ssc') || courseId.includes('ssc')) target = 'ssc_cgl'
    else if (examName.includes('banking') || examName.includes('po') || examName.includes('clerk') || courseId.includes('banking')) target = 'banking'
    else if (examName.includes('ntpc') || courseId.includes('ntpc')) target = 'rrb_ntpc'
    else if (examName.includes('neet') || courseId.includes('neet')) target = 'neet_ug'
    else if (examName.includes('jee') || courseId.includes('jee')) target = 'jee_main'

    return target === primaryTarget
  }

  const handleStartCourse = (course) => {
    toast.success(`Starting "${course.title}" with K² AI Tutor!`)
    navigate('/app/ai-tutor', { 
      state: { 
        initialQuery: `Hi! I want to study the "${course.title}" course for my "${course.exam}" exam. Let's start with the first topic: "${course.topics[0]}".` 
      } 
    })
  }

  const filtered = COURSES.filter(c => {
    if (showFreeOnly && !c.free) return false
    if (filter === 'free' && !c.free) return false
    if (filter === 'all') return true
    return c.exam.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses & Notes 📖</h1>
          <p className="page-subtitle">Expert-curated video courses, notes, and study material for all exams</p>
        </div>
        <div className="stat-pill">🎓 {COURSES.reduce((a,c) => a+c.lessons,0)}+ Lessons</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {[['all','All Courses'],['upsc','UPSC'],['ssc','SSC'],['banking','Banking'],['appsc','APPSC'],['tgpsc','TGPSC'],['police','Police'],['dsc','Teaching DSC']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter===v ? 'btn-primary' : 'btn-outline'}`}>{l}</button>
        ))}
        <button onClick={() => setShowFreeOnly(s => !s)} className={`btn btn-sm ${showFreeOnly ? 'btn-primary' : 'btn-outline'}`} style={{ marginLeft: 'auto' }}>
          🆓 Free Only
        </button>
      </div>

      <div className="grid-3" style={{ gap: 18 }}>
        {filtered.map(course => (
          <div key={course.id} className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Course banner */}
            <div style={{ background: `linear-gradient(135deg, ${course.color}33, ${course.color}11)`, borderBottom: `1px solid ${course.color}33`, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '5rem', opacity: 0.12 }}>{course.icon}</div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{course.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{course.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{course.exam}</div>
              {course.free && (
                <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--emerald)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>FREE</span>
              )}
              {isUserPrimaryTarget(course) && (
                <span className="badge badge-purple animate-pulse" style={{ position: 'absolute', top: 12, right: course.free ? 70 : 12, background: 'var(--purple)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--r-full)', border: 'none', boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)' }}>🎯 TARGET</span>
              )}
            </div>
            <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Play size={11} /> {course.lessons} lessons
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {course.hours}h
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} /> {(course.students/1000).toFixed(0)}K
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={11} fill="var(--amber)" /> {course.rating}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {course.topics.slice(0,4).map(t => (
                  <span key={t} style={{ fontSize: '0.66rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '2px 8px', color: 'var(--text-3)' }}>{t}</span>
                ))}
                {course.topics.length > 4 && <span style={{ fontSize: '0.66rem', color: 'var(--text-4)' }}>+{course.topics.length-4} more</span>}
              </div>

              {(() => {
                const progress = getCourseProgressPct(course);
                if (progress === null) return null;
                return (
                  <div style={{ margin: '4px 0', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.76rem' }}>
                      <span style={{ color: 'var(--text-2)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>📚 Active Syllabus Progress</span>
                      <span style={{ fontWeight: 700, color: course.color }}>{progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5, background: 'rgba(255,255,255,0.1)' }}>
                      <div className="progress-fill" style={{ width: `${progress}%`, background: course.color, height: 5 }} />
                    </div>
                  </div>
                );
              })()}

              <button className="btn btn-primary btn-sm" onClick={() => handleStartCourse(course)} style={{ marginTop: 'auto', justifyContent: 'center', gap: 6 }}>
                {course.free ? <><Play size={13} /> Start Free</> : <><BookOpen size={13} /> Start Course</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
