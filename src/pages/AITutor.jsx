import { useState, useRef, useEffect, useMemo } from 'react'
import { useUserStore } from '../store/useStore'
import { Send, BrainCircuit, Sparkles, RefreshCw, Lightbulb, Zap, Paperclip, Camera, X, AlertTriangle } from 'lucide-react'
import DOMPurify from 'dompurify'
import { toast } from 'react-hot-toast'
import { askGemini, generateQuestions } from '../services/gemini'
import { ALL_LANGUAGES, EXAM_CATEGORIES } from '../data/exams'
import { Link, useLocation } from 'react-router-dom'
import { getSubscriptionStatus } from '../services/paymentService'

// ---------- Free‑tier daily query limit ----------
// Store count per day in localStorage under key `pb_ai_count_YYYY-MM-DD`.
// Free users (non‑paid subscription) may send up to 5 queries per day.
// When the limit is reached we show the upgrade banner (handled in UI elsewhere).
// Helper functions:
const getTodayKey = () => `pb_ai_count_${new Date().toISOString().slice(0,10)}`
const incrementQueryCount = () => {
  const key = getTodayKey()
  const count = parseInt(localStorage.getItem(key) || '0', 10) + 1
  localStorage.setItem(key, count)
  return count
}
const getQueryCount = () => parseInt(localStorage.getItem(getTodayKey()) || '0', 10)
const isFreeTierLimitReached = (subscription) => {
  const sub = getSubscriptionStatus(subscription)
  return !sub.isPaid && getQueryCount() >= 5
}

// Exam-specific suggested questions based on primaryTarget
const EXAM_SUGGESTIONS = {
  default: [
    'Explain Fundamental Rights in simple words',
    'What is the difference between Lok Sabha and Rajya Sabha?',
    'How does monetary policy work? Explain simply',
    'Causes of World War 2 in points',
    'Difference between repo rate and reverse repo rate',
    'How to solve percentage problems quickly?',
    'What are the functions of the Reserve Bank of India?',
    'Explain photosynthesis step by step',
    'IAS vs IPS — what is the difference?',
    'What is the Basic Structure doctrine?',
  ],
  upsc: [
    'Explain the Basic Structure doctrine of the Indian Constitution',
    'What is the difference between Fundamental Rights and Directive Principles?',
    'Explain the Preamble of the Constitution with its key words',
    'What are the powers and functions of the UPSC?',
    'Explain the Rowlatt Act and the Jallianwala Bagh massacre',
    'What is the significance of the Kesavananda Bharati case?',
    'How does the Election Commission work?',
    'Explain the concept of federalism in India',
    'What is the role of the CAG of India?',
    'Explain the Montague-Chelmsford Reforms 1919',
  ],
  ias: [
    'Explain the Basic Structure doctrine of the Indian Constitution',
    'What is the difference between Fundamental Rights and Directive Principles?',
    'What are Article 32 and Article 226? What is the difference?',
    'Explain Panchayati Raj System — 73rd and 74th Amendments',
    'What is the Emergency Provisions in the Indian Constitution?',
    'Explain the Civil Services structure in India',
    'What is GS 4 Ethics? Give examples of ethical dilemmas',
    'Explain sustainable development goals related to India',
  ],
  ssc_cgl: [
    'How to solve percentage and profit-loss problems quickly?',
    'Explain tricks for solving time and work problems',
    'What are the main topics in SSC CGL Tier 1 syllabus?',
    'How to improve accuracy in reasoning and analogy questions?',
    'Explain active and passive voice transformation rules',
    'What is the difference between Simple Interest and Compound Interest?',
    'How to solve number series questions quickly?',
    'Explain direct and indirect speech conversion rules',
  ],
  ibps_po: [
    'What is the difference between Repo Rate and Reverse Repo Rate?',
    'Explain the functions of the Reserve Bank of India',
    'What is NABARD and what are its functions?',
    'How to solve Data Interpretation questions quickly?',
    'Explain Syllogism solving tricks for IBPS PO',
    'What is Priority Sector Lending?',
    'What is the difference between NEFT, RTGS and IMPS?',
    'Explain seating arrangement puzzle solving strategies',
  ],
  sbi_po: [
    'What is the difference between Repo Rate and Reverse Repo Rate?',
    'Explain the functions of the Reserve Bank of India',
    'What is NABARD and what are its functions?',
    'How to solve Data Interpretation questions quickly?',
    'What is Priority Sector Lending?',
    'What is the difference between NEFT, RTGS and IMPS?',
    'Explain the roles of SBI as a commercial bank',
    'What is Capital Adequacy Ratio and Basel norms?',
  ],
  appsc: [
    'Who were the Satavahanas and what was their contribution to Andhra?',
    'Explain the AP Reorganisation Act 2014 — key sections',
    'What is the significance of Ramappa Temple (UNESCO site)?',
    'Who was Rudrama Devi and what was her legacy?',
    'Explain the Navaratnalu welfare schemes of Andhra Pradesh',
    'What is Section 5 of the AP Reorganisation Act?',
    'What is the Polavaram project and why is it important?',
    'Explain the geography of Andhra Pradesh coastline',
    'Who was Sri Krishnadevaraya and what did he write?',
    'What are the major rivers and reservoirs of Andhra Pradesh?',
  ],
  tgpsc: [
    'Explain the Telangana Statehood Movement — key phases',
    'Who was Asaf Jah I and how did the Nizam dynasty start?',
    'What is the significance of the Kakatiya dynasty in Telangana?',
    'Explain Operation Polo and the integration of Hyderabad',
    'What is the TJAC and who led it?',
    'Who was the last Nizam and what were his contributions?',
    'Explain the geography of Telangana — rivers, plateaus, districts',
    'What is the Gentlemen\'s Agreement (1956) and why was it violated?',
    'Explain Singareni Collieries and their importance to Telangana',
    'What were the key welfare schemes introduced in Telangana?',
  ],
  ap_police: [
    'What is the Disha App and how does it protect women?',
    'Explain the SHE Teams initiative in AP and Telangana',
    'What are the key provisions of the Disha Act (AP)?',
    'What is IPC Section 354 related to women safety?',
    'Explain the AP Police recruitment eligibility criteria',
    'What are the physical fitness standards for AP Police SI?',
    'What is the difference between FIR and Complaint?',
    'Explain the Disha Fast Track Courts and their timeline',
  ],
  ts_police: [
    'What are the SHE Teams and how do they operate in Telangana?',
    'Explain the Hawkeye mobile app of TS Police',
    'What are the key IPC provisions related to women safety?',
    'What is the eligibility for TS Police SI exam?',
    'Explain the Telangana Police organizational structure',
    'What is the role of Task Force in Telangana?',
    'What is the importance of the TSPA (Police Academy)?',
    'How to solve aptitude problems for TS Police exam?',
  ],
  ap_dsc_sgt: [
    'Explain Jean Piaget\'s 4 stages of cognitive development',
    'What is Vygotsky\'s Zone of Proximal Development (ZPD)?',
    'Explain the NEP 2020 — 5+3+3+4 school structure',
    'What is the Heuristic Method of teaching?',
    'Explain Kohlberg\'s stages of moral development',
    'What is Bloom\'s Taxonomy and its educational significance?',
    'What is the difference between formative and summative assessment?',
    'Explain the concept of Constructivism in education',
  ],
  ts_dsc_sgt: [
    'Explain Jean Piaget\'s 4 stages of cognitive development',
    'What is Vygotsky\'s Zone of Proximal Development (ZPD)?',
    'Explain the NEP 2020 — 5+3+3+4 school structure',
    'What is B.F. Skinner\'s Operant Conditioning theory?',
    'Explain Kohlberg\'s stages of moral development',
    'What is the Heuristic Method of teaching?',
    'Explain Inclusive Education under RTE Act 2009',
    'What is Action Research in teaching?',
  ],
  neet_ug: [
    'Explain the process of photosynthesis step by step',
    'What is Mendel\'s Law of Segregation?',
    'Explain the structure of DNA and RNA',
    'What is the difference between mitosis and meiosis?',
    'Explain the human excretory system',
    'How does enzyme action work? Explain with example',
    'What is NEET syllabus for Biology?',
    'Explain the periodic table trends in Chemistry',
  ],
  jee_main: [
    'Explain Newton\'s Laws of Motion with examples',
    'What is the concept of integration and differentiation?',
    'Explain organic reaction mechanisms — SN1 and SN2',
    'How to solve coordinate geometry problems quickly?',
    'What is electrochemistry and Faraday\'s laws?',
    'Explain wave optics — interference and diffraction',
    'How to approach JEE Mains Maths preparation?',
    'Explain the Periodic Table trends and atomic structure',
  ],
  rrb_ntpc: [
    'What are the main topics in RRB NTPC General Awareness?',
    'How to solve time, speed and distance problems quickly?',
    'Explain Number Series solving tricks',
    'What are the different divisions of Indian Railways?',
    'How to improve accuracy in Coding-Decoding questions?',
    'What is GK related to Indian Railways for NTPC?',
    'Explain profit and loss shortcut methods',
    'What are the key historical facts about Indian Railways?',
  ],
}

function getSuggestionsForExam(primaryTarget) {
  if (!primaryTarget) return EXAM_SUGGESTIONS.default
  if (EXAM_SUGGESTIONS[primaryTarget]) return EXAM_SUGGESTIONS[primaryTarget]
  // Partial matches
  for (const key of Object.keys(EXAM_SUGGESTIONS)) {
    if (primaryTarget.includes(key) || key.includes(primaryTarget)) return EXAM_SUGGESTIONS[key]
  }
  return EXAM_SUGGESTIONS.default
}

function getExamLabel(primaryTarget) {
  if (!primaryTarget) return null
  for (const cat of EXAM_CATEGORIES) {
    const found = cat.exams.find(e => e.id === primaryTarget)
    if (found) return found.name
  }
  return primaryTarget.toUpperCase()
}

const API_KEY_CONFIGURED = !!import.meta.env.VITE_GEMINI_API_KEY

export default function AITutor() {
  const { profile } = useUserStore()
  const primaryTarget = profile?.primaryTarget || null
  const examLabel = getExamLabel(primaryTarget)
  const suggestions = useMemo(() => getSuggestionsForExam(primaryTarget), [primaryTarget])

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `नमस्ते! 👋 Welcome to **K² Doubt Solver**! 📸\n\n${examLabel ? `I can see you're preparing for **${examLabel}** — I'll tailor all my explanations for your exam! 🎯\n\n` : ''}You can:\n• ✍️ **Ask any question** in Hindi, Tamil, Telugu, Marathi, or English\n• 📸 **Upload or snap a photo** of any textbook, newspaper, or test-series question\n• 💡 Get **step-by-step guidance** with memory tricks and shortcuts\n\nSelect your subject and native language above, snap/upload your question, and let's solve it! 🚀`,
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('all')
  const [language, setLanguage] = useState(profile?.language || profile?.selectedLanguage || 'en')
  const [showSuggest, setShowSuggest] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const messagesEnd = useRef(null)
  const location = useLocation()

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Question image must be smaller than 3MB')
        return
      }
      setImageType(file.type)
      const reader = new FileReader()
      reader.onload = () => {
        if (!reader.result || typeof reader.result !== 'string') {
          toast.error('Could not read image file')
          return
        }
        const rawBase64 = reader.result.split(',')[1]
        if (!rawBase64) { toast.error('Invalid image format'); return }
        setSelectedImage(rawBase64)
        setImagePreview(reader.result)
      }
      reader.onerror = () => toast.error('Failed to read image')
      reader.readAsDataURL(file)
    }
  }

  // Use the centralized helper functions defined above
  const getDailyQueryCount = () => getQueryCount()
  const incrementDailyQueryCount = () => incrementQueryCount()

  const sendMessage = async (text = input) => {
    const sub = getSubscriptionStatus(profile?.subscription)
    const isPremium = sub.isPaid || (sub.isTrial && sub.isActive)
    const dailyCount = getDailyQueryCount()

    if (!isPremium && dailyCount >= 5) {
      toast.error('You have reached your daily limit of 5 free AI Doubt Solver questions! Please upgrade to Premium for unlimited scans.')
      return
    }

    const msg = text.trim()
    const imgData = selectedImage
    const imgType = imageType

    if (!msg && !imgData) return
    if (loading) return

    setInput('')
    setSelectedImage(null)
    setImagePreview(null)
    setShowSuggest(false)

    if (!isPremium) {
      incrementDailyQueryCount()
    }

    const userMsg = {
      role: 'user',
      text: msg || 'Please solve this exam question step-by-step.',
      image: imgData,
      mimeType: imgType,
      time: new Date()
    }
    setMessages(m => [...m, userMsg])
    setLoading(true)

    try {
      const history = messages.filter(m => m.role !== 'system')
      // Include primaryTarget in exam context for personalized responses
      const examContext = profile?.exams || (primaryTarget ? [primaryTarget] : [])
      const response = await askGemini(
        msg || 'Please solve this exam question step-by-step.',
        history,
        language,
        examContext,
        imgData,
        imgType
      )
      setMessages(m => [...m, { role: 'ai', text: response, time: new Date() }])
    } catch (err) {
      console.error('Gemini error:', err)
      if (err.message === 'NO_API_KEY') {
        setMessages(m => [...m, {
          role: 'ai',
          text: `**⚠️ AI Service Not Configured**\n\nThe Gemini API key is not set up yet. To enable the full AI Tutor:\n\n1. Get your free API key from [Google AI Studio](https://aistudio.google.com)\n2. Add it to your \`.env.local\` file: \`VITE_GEMINI_API_KEY=your_key_here\`\n3. Restart the dev server\n\nIn the meantime, I'll answer from my offline knowledge base! Ask me about **${examLabel || 'your target exam'}** topics. 📚`,
          time: new Date()
        }])
      } else {
        toast.error('AI tutor is busy. Please try again in a moment.')
        setMessages(m => [...m, {
          role: 'ai',
          text: `Sorry, I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, check our question bank or current affairs section! 📚`,
          time: new Date()
        }])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (location.state?.initialQuery) {
      sendMessage(location.state.initialQuery) // eslint-disable-line react-hooks/set-state-in-effect
      window.history.replaceState({}, document.title)
    }
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateQuiz = async () => {
    setGenerating(true)
    toast.loading('Generating practice questions...', { id: 'quiz-gen' })
    try {
      const topic = subject === 'all'
        ? (primaryTarget ? `${examLabel} General Studies` : 'General Knowledge for competitive exams')
        : subject
      const exam = (primaryTarget || profile?.exams?.[0] || 'UPSC').toUpperCase()
      const qs = await generateQuestions(topic, exam, 'medium', 3, language)

      if (qs.length > 0) {
        const quizText = `Here are **3 practice questions** on ${topic} for ${exam}:\n\n${qs.map((q, i) =>
          `**Q${i + 1}:** ${q.text}\n${q.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join('\n')}\n✅ **Answer:** ${String.fromCharCode(65 + q.correct)}\n💡 **Explanation:** ${q.explanation}`
        ).join('\n\n---\n\n')}`
        setMessages(m => [...m, { role: 'ai', text: quizText, time: new Date() }])
        toast.success('Quiz generated!', { id: 'quiz-gen' })
      } else {
        throw new Error('No questions generated')
      }
    } catch {
      toast.error('Could not generate quiz. Try again.', { id: 'quiz-gen' })
    }
    setGenerating(false)
  }

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
      .replace(/•/g, '&bull;')
      .replace(/---/g, '<hr style="border-color:var(--border);margin:8px 0" />')
  }

  return (
    <div className="page animate-fade-in" style={{ height: 'calc(100vh - var(--navbar-h))', display: 'flex', flexDirection: 'column', padding: 0 }}>

      {/* API Key Warning Banner */}
      {!API_KEY_CONFIGURED && (
        <div style={{
          padding: '10px 20px',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.8rem',
          color: 'var(--amber)'
        }}>
          <AlertTriangle size={14} />
          <span>
            <strong>AI Tutor needs setup:</strong> Add <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>VITE_GEMINI_API_KEY</code> to your <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> file to enable live AI responses.
            Offline knowledge base is active for now.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={22} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24,
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%)',
                  color: 'white', fontWeight: 900, borderRadius: 6, fontSize: '0.8rem', marginRight: 8,
                  boxShadow: '0 0 12px rgba(124, 58, 237, 0.5)',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>K²</span>
                Doubt Solver
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, border: '1px solid var(--border-purple)', borderRadius: 'var(--r-full)', padding: '2px 8px', background: 'transparent', color: 'var(--purple)' }}>MULTIMODAL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <span className="dot-live" style={{ background: API_KEY_CONFIGURED ? 'var(--emerald)' : 'var(--amber)' }} />
              {examLabel
                ? `Personalized for ${examLabel} • Hindi, Tamil, Telugu, Marathi`
                : 'Upload textbook photos • Ask in Hindi, Tamil, Telugu, Marathi • Step-by-Step Guidance'
              }
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Native Language Selector */}
          <select className="form-select" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 12px' }} value={language} onChange={e => setLanguage(e.target.value)}>
            {ALL_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.native} ({lang.name})
              </option>
            ))}
          </select>

          <select className="form-select" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 12px' }} value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            <option value="Indian Polity">Polity</option>
            <option value="Indian History">History</option>
            <option value="Indian Geography">Geography</option>
            <option value="Indian Economy">Economy</option>
            <option value="Quantitative Aptitude">Maths/Aptitude</option>
            <option value="English Grammar">English</option>
            <option value="Current Affairs">Current Affairs</option>
            <option value="General Science">Science</option>
            <option value="Banking Awareness">Banking</option>
            {primaryTarget?.includes('appsc') || primaryTarget?.includes('tgpsc') ? <option value="AP/TS History">AP/TS History</option> : null}
            {primaryTarget?.includes('dsc') ? <option value="Educational Psychology">Pedagogy</option> : null}
          </select>
          <button className="btn btn-outline btn-sm" onClick={handleGenerateQuiz} disabled={generating}>
            {generating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
            Generate Quiz
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setMessages([messages[0]]); setShowSuggest(true) }}>Clear</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: msg.role === 'ai' ? 'var(--grad)' : 'var(--purple-10)', border: '1px solid var(--purple-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'ai'
                ? <BrainCircuit size={16} color="white" />
                : <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
              }
            </div>
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user' ? 'var(--purple-10)' : 'var(--bg-3)',
              border: `1px solid ${msg.role === 'user' ? 'var(--purple-20)' : 'var(--border)'}`,
              borderRadius: msg.role === 'user' ? 'var(--r-lg) var(--r-lg) 4px var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) 4px',
              padding: '12px 16px'
            }}>
              {msg.image && (
                <div style={{ marginBottom: 10, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '100%' }}>
                  <img src={`data:${msg.mimeType || 'image/jpeg'};base64,${msg.image}`} alt="Scan" style={{ display: 'block', maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-1)' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatMessage(msg.text)) }} />
              <div style={{ fontSize: '0.68rem', color: 'var(--text-4)', marginTop: 6 }}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'ai' && <span style={{ marginLeft: 8, color: 'var(--purple)' }}>✦ K²</span>}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={16} color="white" />
            </div>
            <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg) var(--r-lg) var(--r-lg) 4px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, background: 'var(--cyan)', borderRadius: '50%', animation: `typing 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s`, display: 'inline-block' }} />
                ))}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginLeft: 8 }}>K² is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Personalized Suggestions */}
      {showSuggest && (
        <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={12} />
            {examLabel ? `Try asking (${examLabel}):` : 'Try asking:'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.slice(0, 5).map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{ padding: '6px 14px', borderRadius: 'var(--r-full)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--t)', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.color = 'var(--cyan)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-2)' }}
              >{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {/* Scanned Image Preview Chip */}
        {imagePreview && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 12, width: 'fit-content', position: 'relative', animation: 'fadeUp 0.2s ease' }}>
            <img src={imagePreview} alt="Preview" style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--purple-20)' }} />
            <div style={{ fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 600, color: 'white' }}>Question Scan Captured</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>K² will solve this photo</div>
            </div>
            <button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null) }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 8, transition: 'var(--t)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div id="recaptcha-container" />
        {profile?.subscription?.plan !== 'paid' && getDailyQueryCount() >= 5 ? (
          <div style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,212,255,0.08))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
            animation: 'fadeUp 0.3s ease'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>🔒 Daily Limit Reached</div>
            <h4 style={{ margin: 0, marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Unlock Unlimited K² Doubt Solver</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, marginBottom: 14, lineHeight: 1.55, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              You have completed all 5 free daily competitive exam doubt scans for today. Upgrade to All-Access Premium starting at only <strong>₹249/month</strong> to solve unlimited textbook, test-series, and paper queries instantly!
            </p>
            <Link to="/app/profile" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8, fontWeight: 700, boxShadow: 'var(--glow-purple)' }}>
              <Zap size={14} /> Go Premium Now (from ₹249/mo)
            </Link>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); sendMessage() }} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-xl)', padding: '10px 18px', transition: 'var(--t)' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            >
              <Sparkles size={16} color="var(--purple)" style={{ flexShrink: 0 }} />
              <input
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.92rem', fontFamily: 'inherit' }}
                placeholder={examLabel ? `Ask anything about ${examLabel} in English, हिंदी, తెలుగు...` : `Ask anything in English, हिंदी, தமிழ், తెలుగు, বাংলা...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              {/* Hidden Input for file uploads */}
              <input type="file" id="ai-scan-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              {/* Hidden Input for camera capture specifically */}
              <input type="file" id="ai-camera-capture" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />

              <button type="button" onClick={() => document.getElementById('ai-camera-capture').click()}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--t)' }}
                title="Take question photo"
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <Camera size={18} />
              </button>
              <button type="button" onClick={() => document.getElementById('ai-scan-upload').click()}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--t)' }}
                title="Upload textbook query image"
                onMouseEnter={e => e.currentTarget.style.color = 'var(--purple)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <Paperclip size={18} />
              </button>
            </div>
            <button type="submit" className="btn btn-primary" disabled={(!input.trim() && !selectedImage) || loading} style={{ borderRadius: '50%', width: 46, height: 46, padding: 0, flexShrink: 0 }}>
              {loading
                ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={18} />
              }
            </button>
          </form>
        )}
        <p style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 6, textAlign: 'center' }}>
          Powered by K² Proprietary AI Engine • PrepBridge AI may make mistakes. Verify with official sources.
        </p>
      </div>
    </div>
  )
}
