import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { toast } from 'react-hot-toast'
import { EXAM_CATEGORIES, ALL_STATES, ALL_LANGUAGES } from '../data/exams'
import { CheckCircle, ArrowRight, ArrowLeft, Zap, Brain, Plus } from 'lucide-react'
import { updateUserProfile } from '../firebase/auth'
import { createTrialSubscription } from '../services/paymentService'
import { uploadToSupabase } from '../services/supabaseService'

const STEPS = ['Language','State','Exams','Profile','Schedule']

const EDUCATION_LEVELS = ['10th Pass','12th Pass','Graduate','Post Graduate','Other']
const STUDY_HOURS = ['1-2 hours','2-3 hours','3-4 hours','4-6 hours','6+ hours']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const { updateProfile, setOnboardingComplete, user, profile } = useUserStore()
  const navigate = useNavigate()

  const [data, setData] = useState(() => ({
    language: 'en', languageName: 'English',
    state: '', exams: [],
    // Pre-fill name from Google sign-in / existing profile if available
    name: profile?.displayName || profile?.name || user?.displayName || '',
    education: '', targetYear: '2026',
    studyHours: '3-4 hours', examDate: '',
    primaryTarget: '', lakshyaSlogan: ''
  }))
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(() =>
    profile?.photoURL && !profile.photoURL.startsWith('data:') ? profile.photoURL : ''
  )
  const [uploading, setUploading] = useState(false)

  const handlePrimaryTargetChange = (targetId) => {
    let defaultSlogan = "I will dedicate myself to cracking my target exam and achieving my dream career."
    if (targetId === 'ias' || targetId === 'ips' || targetId === 'upsc') {
      defaultSlogan = "I will crack UPSC CSE and serve the nation with absolute integrity as a Civil Servant."
    } else if (targetId === 'ssc_cgl') {
      defaultSlogan = "I will secure a top rank in SSC CGL and join the Central Government to serve with pride."
    } else if (targetId.includes('po') || targetId.includes('clerk') || targetId.includes('sbi') || targetId.includes('ibps')) {
      defaultSlogan = "I will clear my Bank PO exam and build a highly successful career in public service banking."
    } else if (targetId.includes('ntpc') || targetId.includes('rrb')) {
      defaultSlogan = "I will clear RRB NTPC CBT exams and serve the nation in the Indian Railways."
    } else if (targetId.includes('neet')) {
      defaultSlogan = "I will crack NEET with top marks and earn my seat in medical excellence to serve humanity."
    } else if (targetId.includes('jee')) {
      defaultSlogan = "I will clear JEE and secure my seat in a premier engineering institute to innovate for the future."
    } else if (targetId === 'appsc') {
      defaultSlogan = "I will crack APPSC and serve the people of Andhra Pradesh with integrity, transparency, and administrative excellence."
    } else if (targetId === 'tgpsc') {
      defaultSlogan = "I will clear TGPSC and contribute actively to the progressive growth and welfare of Telangana state."
    } else if (targetId.includes('police')) {
      defaultSlogan = "I will clear my State Police exam and protect our community with courage, honor, and duty."
    } else if (targetId.includes('dsc')) {
      defaultSlogan = "I will clear the teaching DSC exams and nurture the next generation of regional students with wisdom and empathy."
    }
    setData(d => ({ ...d, primaryTarget: targetId, lakshyaSlogan: defaultSlogan }))
  }

  const next = () => {
    if (step === 0 && !data.language) { toast.error('Please select a language'); return }
    if (step === 1 && !data.state) { toast.error('Please select your state'); return }
    if (step === 2 && data.exams.length === 0) { toast.error('Select at least one exam'); return }
    if (step === 2 && data.exams.length > 0 && !data.primaryTarget) { toast.error('Please select your Primary Target Exam (Lakshya)'); return }
    if (step === 3 && !data.name.trim()) { toast.error('Please enter your name'); return }
    if (step === STEPS.length - 1) { handleComplete(); return }
    setStep(s => s + 1)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo must be smaller than 2MB')
        return
      }
      setPhotoFile(file)
      setPhotoPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleComplete = async () => {
    setUploading(true)
    let finalPhotoUrl = profile?.photoURL || user?.photoURL || ''

    // Upload profile photo to Supabase Storage if user selected one
    if (photoFile && user?.uid) {
      const path = `profile_photos/${user.uid}_${Date.now()}`
      try {
        finalPhotoUrl = await uploadToSupabase(photoFile, path)
      } catch (e) {
        console.warn('[Onboarding] Supabase Storage upload failed, using Base64 fallback:', e)
        try {
          const reader = new FileReader()
          finalPhotoUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(photoFile)
          })
        } catch (err) {
          console.error('[Onboarding] Base64 fallback failed:', err)
        }
      }
    }

    const profileUpdates = {
      ...data,
      uid: user?.uid,
      email: user?.email || profile?.email || null,
      phone: user?.phone || data.phone || profile?.phone || null,
      selectedLanguage: data.languageName,
      photoURL: finalPhotoUrl,
      onboardingComplete: true,
      createdAt: profile?.createdAt || new Date().toISOString(),
      points: profile?.points || 0,
      streak: profile?.streak || 0,
      subscription: profile?.subscription?.plan === 'paid'
        ? profile.subscription  // preserve existing paid subscription
        : createTrialSubscription(),
    }

    // 1. Update Zustand store immediately (user lands on dashboard)
    updateProfile(profileUpdates)
    setOnboardingComplete(true)

    // 2. Persist demo session profiles across logout
    if (user?.uid?.startsWith('demo_')) {
      try {
        const existing = localStorage.getItem('prepbridge_demo_profiles')
        const map = existing ? JSON.parse(existing) : {}
        map[user.uid] = profileUpdates
        localStorage.setItem('prepbridge_demo_profiles', JSON.stringify(map))
      } catch (e) {
        console.error('[Onboarding] Demo profile persist failed:', e)
      }
    }

    // 3. Background sync to Supabase (non-blocking — UI already navigated)
    if (user?.uid && !user.uid.startsWith('demo_')) {
      updateUserProfile(user.uid, profileUpdates)
        .catch(e => console.error('[Onboarding] Supabase sync failed:', e))
    }

    setUploading(false)
    toast.success('Profile setup complete! Your 2-day free trial has started 🎉', { duration: 5000 })
    navigate('/app/dashboard')
  }

  const toggleExam = (examId) => {
    setData(d => ({
      ...d, exams: d.exams.includes(examId) ? d.exams.filter(e => e !== examId) : [...d.exams, examId]
    }))
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-orb" style={{ width: 500, height: 500, background: 'var(--purple)', top: '-20%', right: '-10%' }} />
      <div className="onboarding-orb" style={{ width: 300, height: 300, background: 'var(--cyan)', bottom: '-10%', left: '-5%' }} />

      <div className="onboarding-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, background: 'var(--grad)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Prep<span style={{ color: 'var(--cyan)' }}>Bridge</span></span>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} title={s} />
          ))}
        </div>

        <div className="card card-p" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>Step {step + 1} of {STEPS.length}</div>
            {step === 0 && <h3>Choose your language 🌐</h3>}
            {step === 1 && <h3>Which state are you from? 🗺️</h3>}
            {step === 2 && <h3>Which exams are you targeting? 🎯</h3>}
            {step === 3 && <h3>Tell us about yourself 👤</h3>}
            {step === 4 && <h3>Set your daily study schedule ⏰</h3>}
          </div>

          {/* Step 0: Language */}
          {step === 0 && (
            <div className="lang-grid">
              {ALL_LANGUAGES.map(lang => (
                <button key={lang.code} className={`lang-btn ${data.language === lang.code ? 'selected' : ''}`}
                  onClick={() => setData(d => ({ ...d, language: lang.code, languageName: lang.name }))}>
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang.native}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{lang.name}</div>
                  </div>
                  {data.language === lang.code && <CheckCircle size={14} color="var(--cyan)" style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: State */}
          {step === 1 && (
            <div className="state-grid">
              {ALL_STATES.map(state => (
                <button key={state} className={`state-btn ${data.state === state ? 'selected' : ''}`}
                  onClick={() => setData(d => ({ ...d, state }))}>
                  {state}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Exams */}
          {step === 2 && (
            <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {EXAM_CATEGORIES.map(cat => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <span>{cat.icon}</span>{cat.label}
                  </div>
                  <div className="exam-select-grid">
                    {cat.exams.map(exam => (
                      <div key={exam.id} className={`exam-check-item ${data.exams.includes(exam.id) ? 'selected' : ''}`}
                        onClick={() => toggleExam(exam.id)}>
                        <div className="exam-check-box">
                          {data.exams.includes(exam.id) && <CheckCircle size={12} color="white" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{exam.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{exam.fullName}</div>
                          {exam.vacancies && <div style={{ fontSize: '0.68rem', color: 'var(--emerald)', marginTop: 2 }}>{exam.vacancies.toLocaleString()} vacancies</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {data.exams.length > 0 && (
                <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>
                    🎯 Choose your Primary Target Exam (Lakshya):
                  </label>
                  <select 
                    className="form-input" 
                    value={data.primaryTarget} 
                    onChange={e => handlePrimaryTargetChange(e.target.value)}
                    style={{ background: 'var(--bg-2)', color: 'white', width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}
                    required
                  >
                    <option value="">-- Select your ultimate goal --</option>
                    {data.exams.map(examId => {
                      let name = examId
                      for (const cat of EXAM_CATEGORIES) {
                        const match = cat.exams.find(e => e.id === examId)
                        if (match) { name = match.name; break }
                      }
                      return <option key={examId} value={examId}>{name}</option>
                    })}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile Photo Upload Container */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  {photoPreviewUrl ? (
                    <img src={photoPreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan)' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                      {data.name ? data.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <label htmlFor="photo-upload" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--cyan)', border: '2px solid var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
                    <Plus size={16} color="white" />
                  </label>
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Upload a profile photo (under 2MB)</div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EDUCATION_LEVELS.map(l => (
                    <button key={l} className={`state-btn ${data.education === l ? 'selected' : ''}`} onClick={() => setData(d => ({ ...d, education: l }))} style={{ flex: 'none' }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Exam Year</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['2026','2027','2028'].map(y => (
                    <button key={y} className={`state-btn ${data.targetYear === y ? 'selected' : ''}`} onClick={() => setData(d => ({ ...d, targetYear: y }))} style={{ flex: 1, textAlign: 'center' }}>{y}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input className="form-input" type="tel" placeholder="For notifications" value={data.phone || ''} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Daily study hours</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STUDY_HOURS.map(h => (
                    <button key={h} className={`state-btn ${data.studyHours === h ? 'selected' : ''}`} onClick={() => setData(d => ({ ...d, studyHours: h }))} style={{ flex: 'none' }}>{h}</button>
                  ))}
                </div>
              </div>
              {data.exams.length > 0 && (
                <div style={{ background: 'var(--cyan-10)', border: '1px solid var(--cyan-20)', borderRadius: 'var(--r-md)', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Brain size={16} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: 6 }}>AI will build your personalized plan</div>
                      <p style={{ fontSize: '0.82rem', margin: 0 }}>Based on your {data.exams.length} selected exam(s), education level, and {data.studyHours}/day goal — our AI will create a daily study schedule, recommend topics, and adapt based on your test performance.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">🔥 Your Motivational Lakshya Slogan</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  placeholder="Describe your ultimate vision..." 
                  value={data.lakshyaSlogan} 
                  onChange={e => setData(d => ({ ...d, lakshyaSlogan: e.target.value }))}
                  style={{ fontFamily: 'inherit', resize: 'none', background: 'var(--bg-2)', color: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', width: '100%', padding: '10px', fontSize: '0.85rem', lineHeight: '1.45' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Exam date (if known)</label>
                <input className="form-input" type="date" value={data.examDate} onChange={e => setData(d => ({ ...d, examDate: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }} disabled={uploading}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button className="btn btn-primary" onClick={next} style={{ flex: 2, justifyContent: 'center' }} disabled={uploading}>
            {uploading ? (
              <>
                <div className="spinner-loader" style={{ marginRight: 8 }} />
                Completing Setup...
              </>
            ) : (
              <>
                {step === STEPS.length - 1 ? 'Complete Setup 🏃' : 'Continue'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {step === 2 && data.exams.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--cyan)', marginTop: 12 }}>
            ✓ {data.exams.length} exam(s) selected
          </p>
        )}
      </div>
    </div>
  )
}
