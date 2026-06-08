import { getSupabaseAdmin } from '../_lib/env.js'
import { requireAuth } from '../_middleware/auth.js'

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Authenticate the user if possible (allow graceful fallback if auth/supabase is missing)
    let user = null
    try {
      user = await requireAuth(req, res)
    } catch {
      console.warn('[Quiz Generate API] Running without active database user session auth (demo/offline mode)')
    }

    const { examId, subject, difficulty = 'medium', language = 'en', count = 5 } = req.body

    if (!examId || !subject) {
      return res.status(400).json({ error: 'Missing required parameters: examId, subject' })
    }

    const langName = getLanguageName(language)
    const prompt = `Generate exactly ${count} multiple choice questions (MCQs) for the "${examId}" exam on the subject of "${subject}".
    
    Difficulty level: ${difficulty}
    Language: ${langName}

    Return the response as a JSON array of questions, matching this exact structure:
    [
      {
        "question_text": "Detailed question text written in ${langName}",
        "options": [
          {"text": "First option text"},
          {"text": "Second option text"},
          {"text": "Third option text"},
          {"text": "Fourth option text"}
        ],
        "correct_option_id": 0, // 0-based index of correct option (0, 1, 2, or 3)
        "explanation": "Detailed explanation of why the correct option is right and others are wrong, written in ${langName}",
        "difficulty": "${difficulty}",
        "subject_id": "${subject}"
      }
    ]

    Return ONLY the raw JSON array. Do not wrap in markdown \`\`\`json blocks or add any other text.`

    let questions = []
    
    if (GEMINI_API_KEY) {
      try {
        const payload = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json'
          }
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Gemini API HTTP ${response.status}`)
        }

        const resData = await response.json()
        const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResult) {
          questions = JSON.parse(textResult.trim())
        }
      } catch (err) {
        console.error('[Quiz Generate API] Gemini generation failed:', err)
      }
    }

    // Dynamic offline fallback generator if Gemini failed or key is missing
    if (!questions || questions.length === 0) {
      questions = getOfflineQuestionsFallback(examId, subject, difficulty, language, count)
    }

    // Try saving template to Supabase if config is alive and user is logged in
    let testTemplateId = 'ai_' + Math.random().toString(36).substr(2, 9)
    let dbSuccess = false

    try {
      const supabase = getSupabaseAdmin()
      if (supabase && user) {
        // 1. Create a dynamic test template
        const { data: template, error: tErr } = await supabase.from('test_templates').insert({
          title: `AI custom test: ${subject.toUpperCase()} (${examId.toUpperCase()})`,
          exam_id: examId,
          description: `Custom generated study test targeting ${subject}.`,
          total_marks: questions.length,
          duration_minutes: questions.length * 2,
          difficulty,
          is_active: true
        }).select().single()

        if (tErr) throw tErr
        testTemplateId = template.id

        // 2. Insert questions and create mappings
        for (const q of questions) {
          const { data: qData, error: qErr } = await supabase.from('questions').insert({
            question_text: q.question_text,
            options: q.options,
            correct_option_id: q.correct_option_id,
            explanation: q.explanation,
            subject_id: q.subject_id,
            difficulty: q.difficulty
          }).select().single()

          if (!qErr && qData) {
            await supabase.from('question_exam_mapping').insert({
              question_id: qData.id,
              exam_id: examId,
              test_template_id: testTemplateId
            })
          }
        }
        dbSuccess = true
      }
    } catch (dbErr) {
      console.warn('[Quiz Generate API] PostgREST DB save failed or unconfigured. Returning raw template in local mode:', dbErr.message)
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      testTemplateId,
      dbSuccess,
      title: `AI custom test: ${subject.toUpperCase()} (${examId.toUpperCase()})`,
      exam: examId,
      totalQuestions: questions.length,
      duration: questions.length * 2,
      difficulty,
      negativeMarking: -0.25,
      marksPerQuestion: 1,
      questions: questions.map((q, idx) => ({
        id: q.id || `q_${idx}_${Math.random().toString(36).substr(2, 5)}`,
        text: q.question_text,
        options: q.options.map(o => o.text),
        correct: q.correct_option_id,
        explanation: q.explanation,
        subject: q.subject_id,
        difficulty: q.difficulty
      }))
    })

  } catch (error) {
    console.error('[Quiz Generate API] Fatal error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

function getLanguageName(code) {
  const langs = {
    hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil',
    ur: 'Urdu', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', or: 'Odia',
    pa: 'Punjabi', as: 'Assamese', mai: 'Maithili', ne: 'Nepali', sa: 'Sanskrit'
  }
  return langs[code] || 'English'
}

function getOfflineQuestionsFallback(exam, subject, difficulty, language, count) {
  const dataset = [
    {
      question_text: "Which of the following describes the power of Judicial Review under the Indian Constitution?",
      options: [
        { text: "The power of the judiciary to amend the Constitution." },
        { text: "The power of courts to examine the constitutionality of legislative acts and executive orders." },
        { text: "The power of high courts to review decisions of the Supreme Court." },
        { text: "The power of parliament to appoint senior judges." }
      ],
      correct_option_id: 1,
      explanation: "Judicial Review enables courts to review actions of both legislature and executive, ensuring they align with basic constitutional rules.",
      difficulty,
      subject_id: subject
    },
    {
      question_text: "According to Lev Vygotsky, cognitive development is driven primarily by:",
      options: [
        { text: "Biological maturation and sensory experiences." },
        { text: "Social interactions and cultural scaffolding." },
        { text: "Individual discovery and logical experimentation." },
        { text: "Rewards and reinforcement schedules." }
      ],
      correct_option_id: 1,
      explanation: "Vygotsky's social constructivist theory emphasizes that cognitive development is deeply embedded in social activities and language mediation.",
      difficulty,
      subject_id: subject
    },
    {
      question_text: "The Ramappa Temple, which is a UNESCO World Heritage Site, is located in which Indian state?",
      options: [
        { text: "Andhra Pradesh" },
        { text: "Telangana" },
        { text: "Karnataka" },
        { text: "Tamil Nadu" }
      ],
      correct_option_id: 1,
      explanation: "Ramappa Temple is located in Mulugu district, Telangana state. It was declared a UNESCO World Heritage Site in 2021.",
      difficulty,
      subject_id: subject
    },
    {
      question_text: "What is the primary target organ affected in pulmonary tuberculosis (TB)?",
      options: [
        { text: "Heart" },
        { text: "Lungs" },
        { text: "Kidneys" },
        { text: "Liver" }
      ],
      correct_option_id: 1,
      explanation: "Pulmonary TB is a bacterial infection caused by Mycobacterium tuberculosis that primarily targets the lungs.",
      difficulty,
      subject_id: subject
    },
    {
      question_text: "If a sum of money doubles itself in 5 years at simple interest, what is the annual rate of interest?",
      options: [
        { text: "10%" },
        { text: "15%" },
        { text: "20%" },
        { text: "25%" }
      ],
      correct_option_id: 2,
      explanation: "Simple Interest = Principal. Interest = P * R * T / 100 => P = P * R * 5 / 100 => R = 20%.",
      difficulty,
      subject_id: subject
    }
  ]

  return dataset.slice(0, count)
}
