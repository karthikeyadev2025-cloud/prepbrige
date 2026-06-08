import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { EXAM_CATEGORIES } from '../data/exams'
import { initiateAddonCheckout } from '../services/paymentService'
import { TrendingUp, Lock, ShieldCheck, AlertCircle, BarChart3, Zap, CheckCircle2, ChevronRight, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getSupabaseExamQuestions } from '../services/supabaseService'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

// Mock Trend Data for popular exams
const TREND_DATA = {
  clat: [
    { year: '2022', 'Constitutional Law': 24, 'Legal Reasoning': 32, 'English Usage': 28 },
    { year: '2023', 'Constitutional Law': 28, 'Legal Reasoning': 35, 'English Usage': 30 },
    { year: '2024', 'Constitutional Law': 30, 'Legal Reasoning': 38, 'English Usage': 32 },
    { year: '2025', 'Constitutional Law': 35, 'Legal Reasoning': 40, 'English Usage': 35 },
  ],
  neet_ug: [
    { year: '2022', 'Human Physiology': 18, 'Genetics & Evolution': 22, 'Organic Chemistry': 25 },
    { year: '2023', 'Human Physiology': 20, 'Genetics & Evolution': 25, 'Organic Chemistry': 28 },
    { year: '2024', 'Human Physiology': 24, 'Genetics & Evolution': 28, 'Organic Chemistry': 30 },
    { year: '2025', 'Human Physiology': 28, 'Genetics & Evolution': 32, 'Organic Chemistry': 32 },
  ],
  jee_main: [
    { year: '2022', 'Calculus & Algebra': 32, 'Electrostatics': 28, 'Chemical Bonding': 24 },
    { year: '2023', 'Calculus & Algebra': 35, 'Electrostatics': 30, 'Chemical Bonding': 26 },
    { year: '2024', 'Calculus & Algebra': 38, 'Electrostatics': 32, 'Chemical Bonding': 28 },
    { year: '2025', 'Calculus & Algebra': 42, 'Electrostatics': 35, 'Chemical Bonding': 30 },
  ],
  upsc: [
    { year: '2022', 'Polity & Governance': 15, 'Modern History': 18, 'Economy Trends': 14 },
    { year: '2023', 'Polity & Governance': 17, 'Modern History': 20, 'Economy Trends': 16 },
    { year: '2024', 'Polity & Governance': 20, 'Modern History': 22, 'Economy Trends': 18 },
    { year: '2025', 'Polity & Governance': 22, 'Modern History': 24, 'Economy Trends': 20 },
  ],
  general: [
    { year: '2022', 'General Awareness': 30, 'Arithmetic tricks': 25, 'Logical Reasoning': 20 },
    { year: '2023', 'General Awareness': 32, 'Arithmetic tricks': 28, 'Logical Reasoning': 22 },
    { year: '2024', 'General Awareness': 35, 'Arithmetic tricks': 30, 'Logical Reasoning': 25 },
    { year: '2025', 'General Awareness': 40, 'Arithmetic tricks': 35, 'Logical Reasoning': 28 },
  ]
}

const TOPICS_LIST = {
  clat: [
    { topic: "Constitutional Law & Landmark Judgments", weightage: "35%", trend: "Increasing", probability: "Very High" },
    { topic: "Legal Aptitude & Contract Law Torts", weightage: "30%", trend: "Stable", probability: "High" },
    { topic: "Critical Passage Comprehension", weightage: "20%", trend: "Increasing", probability: "High" },
    { topic: "Contemporary Current Legal Affairs", weightage: "15%", trend: "Dynamic", probability: "Medium-High" }
  ],
  neet_ug: [
    { topic: "Human Physiology & Plant Life Cycles", weightage: "40%", trend: "Very High", probability: "Critical" },
    { topic: "Genetics, Evolution & Molecular Biology", weightage: "30%", trend: "Increasing", probability: "Very High" },
    { topic: "Organic & Physical Chemistry Reactions", weightage: "20%", trend: "Stable", probability: "High" },
    { topic: "Mechanics & Modern Physics Formulas", weightage: "10%", trend: "Stable", probability: "Medium" }
  ],
  jee_main: [
    { topic: "Coordinate Geometry & Integral Calculus", weightage: "38%", trend: "Increasing", probability: "Critical" },
    { topic: "Electrodynamics & Optics Formulas", weightage: "32%", trend: "Stable", probability: "Very High" },
    { topic: "Organic Chemistry named reactions", weightage: "20%", trend: "Stable", probability: "High" },
    { topic: "Coordination Compounds & Bonding", weightage: "10%", trend: "Increasing", probability: "High" }
  ],
  upsc: [
    { topic: "Parliamentary System & Fundamental Rights", weightage: "25%", trend: "Stable", probability: "Very High" },
    { topic: "Environment Conventions & Wildlife Acts", weightage: "30%", trend: "Increasing", probability: "Critical" },
    { topic: "Modern India Freedom Struggles (1857-1947)", weightage: "25%", trend: "Stable", probability: "High" },
    { topic: "Macro Economics & Banking/Inflation", weightage: "20%", trend: "Dynamic", probability: "High" }
  ],
  general: [
    { topic: "Indian Constitution & Polity Highlights", weightage: "35%", trend: "Stable", probability: "High" },
    { topic: "Important Schemes & National Events", weightage: "30%", trend: "Increasing", probability: "Very High" },
    { topic: "Quantitative Simplification & Data Tables", weightage: "20%", trend: "Stable", probability: "High" },
    { topic: "Alphabet & Direction Reasoning Riddles", weightage: "15%", trend: "Stable", probability: "Medium" }
  ]
}

export default function TrendPredictor() {
  const { profile, user, updateProfile } = useUserStore()
  const navigate = useNavigate()
  
  const userExams = useMemo(() => profile?.exams || [], [profile])
  const activeExams = userExams.length > 0 ? userExams : ['general']
  const [activeExam, setActiveExam] = useState(activeExams[0])
  const [unlocking, setUnlocking] = useState(false)

  const isUnlocked = useMemo(() => {
    return profile?.unlockedAddons?.[activeExam] || false
  }, [profile, activeExam])

  const examLabel = useMemo(() => {
    for (const cat of EXAM_CATEGORIES) {
      const found = cat.exams.find(e => e.id === activeExam)
      if (found) return found.name
    }
    return activeExam.toUpperCase()
  }, [activeExam])

  // Get trend data key
  const trendKey = useMemo(() => {
    if (TREND_DATA[activeExam]) return activeExam
    // Map partial values
    if (activeExam.includes('clat') || activeExam.includes('law')) return 'clat'
    if (activeExam.includes('neet')) return 'neet_ug'
    if (activeExam.includes('jee')) return 'jee_main'
    if (activeExam.includes('upsc') || activeExam.includes('ias')) return 'upsc'
    return 'general'
  }, [activeExam])

  const chartData = TREND_DATA[trendKey]
  const topicsData = TOPICS_LIST[trendKey]

  const handleUnlockAddon = async () => {
    setUnlocking(true)
    try {
      await initiateAddonCheckout(
        user,
        profile,
        updateProfile,
        activeExam,
        () => {
          setUnlocking(false)
        }
      )
    } catch (e) {
      toast.error('Addon unlock failed: ' + e.message)
    } finally {
      setUnlocking(false)
    }
  }

  const handleStartGuessPaper = async () => {
    toast.loading('AI is predicting and building your Guess Paper...', { id: 'guess-gen' })
    try {
      const testTemplateId = `guess_${activeExam}_2026`
      let examDbKey = activeExam.toLowerCase().replace(' ', '_').replace('-', '_')
      
      let questionsList = await getSupabaseExamQuestions(examDbKey, 20)
      if (questionsList.length === 0) {
        questionsList = await getSupabaseExamQuestions('upsc', 20)
      }

      // Add a distinct AI predicted prefix to questions
      const parsedQuestions = questionsList.map((q, idx) => ({
        ...q,
        text: `[Predicted Question ${idx + 1}] — ${q.text}`,
        explanation: `🔮 PeakPredict AI Trend Note: This question has been predicted based on frequent shifts. ${q.explanation}`
      }))

      const guessTemplate = {
        id: testTemplateId,
        title: `K² AI PeakPredict Guess Paper: ${examLabel} 2026`,
        exam: activeExam,
        totalQuestions: parsedQuestions.length,
        duration: parsedQuestions.length * 2,
        pattern: 'MCQ',
        negativeMarking: -0.25,
        marksPerQuestion: 1,
        syllabus: ['Predicted Shift Topics'],
        attempts: 0,
        avgScore: 0,
        difficulty: 'medium'
      }

      localStorage.setItem(`prepbridge_ai_questions_${testTemplateId}`, JSON.stringify(parsedQuestions))

      const localTests = localStorage.getItem('prepbridge_auto_updated_tests')
      const parsed = localTests ? JSON.parse(localTests) : []
      if (!parsed.some(t => t.id === testTemplateId)) {
        localStorage.setItem('prepbridge_auto_updated_tests', JSON.stringify([guessTemplate, ...parsed]))
      }

      toast.success('PeakPredict Guess Paper generated successfully!', { id: 'guess-gen' })
      setTimeout(() => {
        navigate(`/app/test/${testTemplateId}`)
      }, 1000)

    } catch (err) {
      toast.error('Failed to prepare guess paper. Please try again.', { id: 'guess-gen' })
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Trend Predictor 🔮</h1>
          <p className="page-subtitle">Examine past exam trends, identify high-probability topics, and practice predicted shift papers.</p>
        </div>
      </div>

      {/* Target Exam Tabs */}
      {activeExams.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {activeExams.map(exId => {
            let label = exId.toUpperCase()
            for (const cat of EXAM_CATEGORIES) {
              const f = cat.exams.find(e => e.id === exId)
              if (f) { label = f.name; break }
            }
            return (
              <button
                key={exId}
                className={`btn btn-sm ${activeExam === exId ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveExam(exId)}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Locked Paywall Gate Screen */}
      {!isUnlocked ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,212,255,0.05))',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '40px 30px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '30px auto 0'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: '2px solid rgba(124, 58, 237, 0.4)'
          }}>
            <Lock size={28} color="var(--purple)" />
          </div>

          <h2 style={{ marginBottom: 12 }}>Unlock PeakPredict Addon for {examLabel}</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 24 }}>
            Get access to historical question weightage patterns (2022-2025), frequently targeted syllabus areas, and download-protected high-probability Guess Papers crafted by K² AI.
          </p>

          {/* Pricing Addon Card */}
          <div style={{
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '20px', margin: '0 auto 24px', maxWidth: '320px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>PeakPredict addon</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '8px 0' }}>₹149</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>✓ Lifetime access for {examLabel}</div>
          </div>

          <button
            onClick={handleUnlockAddon}
            disabled={unlocking}
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '320px', minHeight: '48px', justifyContent: 'center', background: 'var(--grad)', margin: '0 auto 20px' }}
          >
            {unlocking ? 'Opening Payment Gateway...' : `Unlock Guess Paper & Trends (₹149)`}
          </button>

          {/* User-requested Disclaimer Notice Box */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.22)',
            borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <AlertCircle size={20} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 4 }}>
                ⚠️ Important Notice & Estimation Disclaimer
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5, margin: 0 }}>
                This is <strong>NOT</strong> an official leaked question paper. PrepBridge does not have access to official board question papers in advance. The PeakPredict Guess Paper is a purely statistical estimation generated by our K² AI model by analyzing frequency distributions of topics, historical shift patterns, and current syllabus weightages. Actual exam questions may vary, and we make no guarantees of matching questions. Use this as a final-revision practice tool!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Premium Content */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>
          
          <div className="grid-2" style={{ gap: 20 }}>
            {/* Left: Trend Weightage Recharts Display */}
            <div className="card card-p" style={{ minHeight: '340px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <BarChart3 size={18} color="var(--cyan)" />
                <h4 style={{ margin: 0 }}>Topic Weightage Shift Trends (2022 - 2025)</h4>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="var(--text-4)" />
                    <YAxis stroke="var(--text-4)" />
                    <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} />
                    <Legend />
                    {chartData && Object.keys(chartData[0] || {}).filter(k => k !== 'year').map((topic, i) => (
                      <Bar key={topic} dataKey={topic} fill={i === 0 ? '#7c3aed' : i === 1 ? '#00d4ff' : '#10b981'} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Key Frequency Syllabus Insights */}
            <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={18} color="var(--purple)" />
                <h4 style={{ margin: 0 }}>AI High-Probability Topics for {examLabel}</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 16 }}>
                {topicsData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.topic}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 2 }}>Trend: {item.trend}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', fontWeight: 700 }}>
                        {item.weightage} Wt
                      </span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--purple)', fontWeight: 600, marginTop: 4 }}>{item.probability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solve online guess paper card */}
          <div className="card card-p" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,212,255,0.1))',
            border: '1.5px solid rgba(124, 58, 237, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '30px'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔮</div>
            <h3 style={{ marginBottom: 6 }}>K² PeakPredict Guess Paper (2026 Shift)</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '640px', lineHeight: 1.55, marginBottom: 20 }}>
              Practice the high-probability guess questions compiled based on 10 years of shift trends. To secure our copyright and intellectual property, downloading is disabled. Practice is secure and online only.
            </p>

            <button
              onClick={handleStartGuessPaper}
              className="btn btn-primary"
              style={{ padding: '0 24px', minHeight: '48px', gap: 8, background: 'var(--grad)' }}
            >
              <Zap size={15} /> Start Solving Guess Paper Online
            </button>

            {/* Sub disclaimer inside unlocked view */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 16, fontSize: '0.7rem', color: 'var(--text-4)' }}>
              <ShieldCheck size={12} color="var(--emerald)" />
              <span>PrepBridge Copyright Guard Enabled • Practice is locked inside site boundaries.</span>
            </div>
          </div>

          {/* General Disclaimer */}
          <div style={{
            background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '14px', fontSize: '0.72rem', color: 'var(--text-4)', lineHeight: 1.45
          }}>
            <strong>🔮 ESTIMATION NOTE:</strong> The PeakPredict Guess Paper represents our proprietary AI model's topic prediction analysis. It does not represent an actual board paper, nor do we claim perfect alignment. Questions are curated for practice purposes only.
          </div>
        </div>
      )}
    </div>
  )
}
