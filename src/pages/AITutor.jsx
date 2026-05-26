import React, { useState, useRef, useEffect } from 'react'
import { useUserStore } from '../store/useStore'
import { Send, BrainCircuit, Sparkles, RefreshCw, Mic, Lightbulb, BookOpen, Zap, Paperclip, Camera, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { askGemini, generateQuestions } from '../services/gemini'
import { ALL_LANGUAGES } from '../data/exams'
import { Link } from 'react-router-dom'

const SUGGESTED_QUESTIONS = [
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
]

export default function AITutor() {
  const { profile } = useUserStore()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `नमस्ते! 👋 Welcome to **Gemini AI Doubt Solver**! 📸\n\nI'm here to help you crack your competitive exams. You can:\n• ✍️ **Ask any question** in Hindi, Tamil, Telugu, Marathi, or English\n• 📸 **Upload or snap a photo** of any textbook, newspaper, or test-series question\n• 💡 Get **step-by-step guidance** with memory tricks and shortcuts\n\nSelect your subject and native language above, snap/upload your question, and let's solve it! 🚀`,
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('all')
  const [language, setLanguage] = useState(profile?.language || 'en')
  const [showSuggest, setShowSuggest] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const messagesEnd = useRef(null)

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
        const rawBase64 = reader.result.split(',')[1]
        setSelectedImage(rawBase64)
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getDailyQueryCount = () => {
    const todayStr = new Date().toDateString()
    const stored = localStorage.getItem(`pb_ai_count_${todayStr}`)
    return stored ? parseInt(stored, 10) : 0
  }
  
  const incrementDailyQueryCount = () => {
    const todayStr = new Date().toDateString()
    const current = getDailyQueryCount()
    localStorage.setItem(`pb_ai_count_${todayStr}`, (current + 1).toString())
  }

  const sendMessage = async (text = input) => {
    const isPremium = profile?.subscription?.plan === 'paid'
    const dailyCount = getDailyQueryCount()
    
    if (!isPremium && dailyCount >= 5) {
      toast.error('You have reached your daily limit of 5 free AI Doubt Solver questions! Please upgrade to Premium for unlimited scans.')
      return
    }

    const msg = text.trim()
    const imgData = selectedImage
    const imgType = imageType
    
    // Allow sending just a scanned image without typing text
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
      const response = await askGemini(
        msg || 'Please solve this exam question step-by-step.',
        history,
        language,
        profile?.exams || [],
        imgData,
        imgType
      )
      setMessages(m => [...m, { role: 'ai', text: response, time: new Date() }])
    } catch (err) {
      console.error('Gemini error:', err)
      toast.error('AI tutor is busy. Please try again in a moment.')
      setMessages(m => [...m, {
        role: 'ai',
        text: `Sorry, I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, check our question bank or current affairs section! 📚`,
        time: new Date()
      }])
    }
    setLoading(false)
  }

  const handleGenerateQuiz = async () => {
    setGenerating(true)
    toast.loading('Generating practice questions...', { id: 'quiz-gen' })
    try {
      const topic = subject === 'all' ? 'General Knowledge for competitive exams' : subject
      const exam = (profile?.exams?.[0] || 'UPSC').toUpperCase()
      const qs = await generateQuestions(topic, exam, 'medium', 3, profile?.language || 'en')

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
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={22} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0 }}>Gemini AI Doubt Solver</h3>
              <span style={{ fontSize: '0.7rem', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, border: '1px solid var(--border-purple)', borderRadius: 'var(--r-full)', padding: '2px 8px', WebkitTextFillColor: 'unset', background: 'transparent', color: 'var(--purple)' }}>MULTIMODAL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <span className="dot-live" style={{ background: 'var(--emerald)' }} />
              Upload textbook photos • Ask in Hindi, Tamil, Telugu, Marathi • Step-by-Step Guidance
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
              <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-1)' }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
              <div style={{ fontSize: '0.68rem', color: 'var(--text-4)', marginTop: 6 }}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'ai' && <span style={{ marginLeft: 8, color: 'var(--purple)' }}>✦ Gemini AI</span>}
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
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginLeft: 8 }}>Gemini is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Suggestions */}
      {showSuggest && (
        <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={12} /> Try asking:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTED_QUESTIONS.slice(0, 5).map(q => (
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
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Gemini will solve this photo</div>
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
            <h4 style={{ margin: 0, marginBottom: 8, color: 'white', fontSize: '1.05rem' }}>Unlock Unlimited Gemini AI Doubt Solver</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, marginBottom: 14, lineHeight: 1.55, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              You have completed all 5 free daily competitive exam doubt scans for today. Upgrade to All-Access Premium for only <strong>₹599/year</strong> to solve unlimited textbook, test-series, and paper queries instantly!
            </p>
            <Link to="/app/profile" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8, fontWeight: 700, boxShadow: 'var(--glow-purple)' }}>
              <Zap size={14} /> Go Premium Now (₹599)
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
                placeholder={`Ask anything in English, हिंदी, தமிழ், తెలుగు, বাংলা...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              {/* Hidden Input for file uploads */}
              <input 
                type="file" 
                id="ai-scan-upload" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
              {/* Hidden Input for camera capture specifically */}
              <input 
                type="file" 
                id="ai-camera-capture" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
              
              <button 
                type="button" 
                onClick={() => document.getElementById('ai-camera-capture').click()} 
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--t)' }} 
                title="Take question photo"
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <Camera size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => document.getElementById('ai-scan-upload').click()} 
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
          Powered by Google Gemini 2.0 Flash • PrepBridge AI may make mistakes. Verify with official sources.
        </p>
      </div>
    </div>
  )
}
