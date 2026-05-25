// Gemini AI Service — PrepBridge AI Tutor
// Uses Google Gemini 2.0 Flash for real-time tutoring

const GEMINI_API_KEY = 'AIzaSyB/PLMod0rydgB6GQKgntlMjB3iwHibE'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `You are PrepBridge AI, an expert tutor for Indian competitive exam aspirants.
You help students preparing for UPSC (IAS/IPS), SSC CGL, IBPS PO, SBI PO, RRB NTPC, NEET, JEE, and all other Indian government exams.

Your role:
1. Explain concepts clearly in simple language (suitable for rural/semi-urban aspirants)
2. Always relate answers to exam relevance (mention which exams ask this, which year PYQ, marks weightage)
3. Give memory tricks, mnemonics and shortcut methods
4. Provide structured answers with bullet points for easy reading
5. Respond in the user's preferred language when asked (Hindi, Tamil, Telugu, Bengali etc.)
6. Keep answers exam-focused and practical
7. Generate practice questions when asked
8. Explain both basic concepts and advanced topics

Format your responses with:
- Clear headings using **bold**
- Bullet points for lists
- 📝 Exam Tip sections
- 💡 Memory Trick sections when relevant
- 📅 PYQ mentions when relevant

Always be encouraging and motivating — many users are first-generation exam takers from economically disadvantaged backgrounds.`

export async function askGemini(userMessage, chatHistory = [], language = 'en', examContext = []) {
  const languageInstruction = language !== 'en' 
    ? `\n\nIMPORTANT: The user prefers responses in ${getLanguageName(language)}. Please respond in ${getLanguageName(language)} while keeping technical terms in English.`
    : ''

  const examInstruction = examContext.length > 0
    ? `\n\nThe user is preparing for: ${examContext.join(', ')}. Tailor your response accordingly.`
    : ''

  // Build messages array
  const messages = [
    // Previous chat history (last 6 messages for context)
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    // Current message
    {
      role: 'user',
      parts: [{ text: userMessage + languageInstruction + examInstruction }]
    }
  ]

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1500,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Gemini API error')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('No response from AI')
  return text
}

// Generate exam-specific questions
export async function generateQuestions(topic, exam, difficulty = 'medium', count = 5, language = 'en') {
  const prompt = `Generate ${count} multiple choice questions on "${topic}" for ${exam} exam preparation.
  
Difficulty: ${difficulty}
Language: ${language !== 'en' ? getLanguageName(language) : 'English'}

Format each question as valid JSON array:
[
  {
    "text": "question text",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "explanation",
    "difficulty": "${difficulty}",
    "subject": "${topic}"
  }
]

Return ONLY the JSON array, no other text.`

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2000 }
    })
  })

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}

// Generate personalized study plan
export async function generateStudyPlan(profile) {
  const { exams = [], studyHours = '3-4 hours', education, targetYear, state } = profile
  
  const prompt = `Create a 30-day personalized study plan for an Indian competitive exam aspirant with these details:
  - Target Exams: ${exams.join(', ')}
  - Study Hours Available: ${studyHours}/day
  - Education: ${education}
  - Target Year: ${targetYear}
  - State: ${state}
  
  Provide a practical, week-by-week plan with:
  1. Daily topic allocation
  2. Weekly mock test schedule
  3. Current affairs routine
  4. Revision strategy
  
  Keep it concise, motivating, and practical for a student with limited resources.`

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 2000 }
    })
  })

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Explain a wrong answer
export async function explainWrongAnswer(question, userAnswer, correctAnswer, language = 'en') {
  const prompt = `A student got this exam question wrong. Help them understand:
  
Question: ${question}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}

Give a clear, encouraging explanation of:
1. Why the correct answer is right
2. Why their answer is wrong
3. A memory tip to remember this
4. If this is a common exam trap

${language !== 'en' ? `Respond in ${getLanguageName(language)}` : 'Respond in English'}`

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 800 }
    })
  })

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Translate content
export async function translateContent(text, targetLanguage) {
  const prompt = `Translate the following educational content to ${getLanguageName(targetLanguage)}. Keep technical terms, exam names, and proper nouns in English:

${text}

Provide only the translation, no other text.`

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
    })
  })

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || text
}

function getLanguageName(code) {
  const langs = {
    hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil',
    ur: 'Urdu', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', or: 'Odia',
    pa: 'Punjabi', as: 'Assamese', mai: 'Maithili', ne: 'Nepali', sa: 'Sanskrit'
  }
  return langs[code] || 'English'
}
