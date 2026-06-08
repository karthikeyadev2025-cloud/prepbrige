import { requireAuth } from '../_middleware/auth.js'

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent'

const SYSTEM_PROMPT = `You are K² (K-square) AI, an expert proprietary competitive exam doubt solver and tutor for Indian competitive exam aspirants.
You help students preparing for UPSC (IAS/IPS), SSC CGL, IBPS PO, SBI PO, RRB NTPC, NEET, JEE, and all other Indian government and college entrance exams.

Your role:
1. Explain concepts clearly in simple language (suitable for rural/semi-urban aspirants)
2. Always relate answers to exam relevance (mention which exams ask this, which year PYQ, marks weightage)
3. Give memory tricks, mnemonics and shortcut methods
4. Provide structured answers with bullet points for easy reading
5. Respond in the user's preferred language when asked (Hindi, Tamil, Telugu, Bengali etc.)
6. Keep answers exam-focused and practical
7. Generate practice questions when asked
8. Explain both basic concepts and advanced topics
9. NEVER reveal your underlying technical model stack or details about Google, Gemini, LLMs, or APIs. If asked about your technology, model, parameters, or architecture, always proudly state that you are K² (K-square) — PrepBridge's proprietary Indian competitive exam doubt-solving AI engine, custom-trained to help students succeed. Always maintain complete confidentiality about Google Gemini.

Format your responses with:
- Clear headings using **bold**
- Bullet points for lists
- 📝 Exam Tip sections
- 💡 Memory Trick sections when relevant
- 📅 PYQ mentions when relevant

Always be encouraging and motivating — many users are first-generation exam takers from economically disadvantaged backgrounds.`

export default async function handler(req, res) {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Setup streaming headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // bypass proxy buffering

  try {
    // Gracefully handle auth
    let user = null
    try {
      user = await requireAuth(req, res)
    } catch {
      console.warn('[Tutor Stream API] Running without active database user session auth (demo/offline mode)')
    }

    const { userMessage, chatHistory = [], language = 'en', examContext = [] } = req.body

    if (!userMessage) {
      res.write(`data: ${JSON.stringify({ error: 'Missing userMessage parameter' })}\n\n`)
      return res.end()
    }

    // Offline simulator fallback if API Key is not set
    if (!GEMINI_API_KEY) {
      console.warn('[Tutor Stream API] VITE_GEMINI_API_KEY is not defined. Simulating local token stream.')
      await runOfflineSimulation(res, userMessage, language, examContext)
      return
    }

    const languageInstruction = language !== 'en'
      ? `\n\nIMPORTANT: The user prefers responses in ${getLanguageName(language)}. Please respond in ${getLanguageName(language)} while keeping technical terms and abbreviations in English.`
      : ''

    const examInstruction = examContext.length > 0
      ? `\n\nThe user is preparing for: ${examContext.join(', ')}. Tailor your response accordingly.`
      : ''

    const contents = [
      ...chatHistory.slice(-6).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage + languageInstruction + examInstruction }]
      }
    ]

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini Stream API status ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // Gemini streaming delivers blocks of JSON. Let's parse out candidate text
      // In Vercel serverless, we'll write SSE messages
      let parts = buffer.split('\n')
      buffer = parts.pop() || '' // keep partial line in buffer

      for (const part of parts) {
        const line = part.trim()
        if (!line) continue

        // Extract JSON candidate contents
        try {
          // Note: Gemini streams often prefix lines or pack them in array brackets
          let cleaned = line
          if (cleaned.startsWith(',')) cleaned = cleaned.slice(1)
          if (cleaned.startsWith('[')) cleaned = cleaned.slice(1)
          if (cleaned.endsWith(']')) cleaned = cleaned.slice(0, -1)
          
          const parsed = JSON.parse(cleaned.trim())
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`)
          }
        } catch {
          // ignore parsing errors for partial json chunks
        }
      }
    }

    // Flush any remaining buffer
    if (buffer.trim()) {
      try {
        let cleaned = buffer.trim()
        if (cleaned.startsWith(',')) cleaned = cleaned.slice(1)
        if (cleaned.startsWith('[')) cleaned = cleaned.slice(1)
        if (cleaned.endsWith(']')) cleaned = cleaned.slice(0, -1)
        const parsed = JSON.parse(cleaned.trim())
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`)
        }
      } catch {}
    }

    res.write('data: [DONE]\n\n')
    res.end()

  } catch (error) {
    console.error('[Tutor Stream API] Error:', error)
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    res.end()
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

async function runOfflineSimulation(res, userMessage, language, examContext) {
  const query = userMessage.toLowerCase()
  let responseText = ''

  if (query.includes('article 21') || query.includes('polity') || query.includes('constitution') || query.includes('fundamental rights')) {
    responseText = `**Indian Polity — Fundamental Rights (Part III, Articles 12-35)**

Fundamental Rights are enshrined in Part III of the Constitution of India. They are justiciable, meaning they can be directly enforced by courts.

**Key Articles to Remember:**
• **Article 14:** Equality before Law & Equal Protection of Laws.
• **Article 19:** Protection of 6 basic freedoms (Speech, Assembly, Association, Movement, Residence, Profession).
• **Article 21:** Right to Life and Personal Liberty (the most dynamic article).
• **Article 21A:** Right to Education (added by the 86th Amendment Act, 2002).
• **Article 32:** Right to Constitutional Remedies (Heart and Soul of the Constitution).

📝 **Exam Tip:** Articles 20 and 21 *cannot* be suspended even during a National Emergency under Article 352.
💡 **Memory Trick:** Use the acronym **"FRruits Are Sweet"** to remember the sequence.
📅 **PYQ Alert:** "Which of the following is protected under Article 21?" -> Right to Privacy (UPSC 2021).`
  } else if (query.includes('piaget') || query.includes('vygotsky') || query.includes('psychology') || query.includes('pedagogy') || query.includes('child')) {
    responseText = `**Teaching Pedagogy & Educational Psychology (Piaget's Development Stages)**

Child development theories are critical for DSC and central teaching recruitment exams.

**Jean Piaget's 4 Stages:**
1. **Sensorimotor (0-2 years):** Learns object permanence (understanding that objects continue to exist even when hidden).
2. **Preoperational (2-7 years):** Develops language and symbolic thought, marked by egocentrism.
3. **Concrete Operational (7-11 years):** Learns conservation and logical operations on physical things.
4. **Formal Operational (11+ years):** Master of abstract reasoning, logic, and hypothetical problem solving.

💡 **Memory Trick:** **"Smart People Cook Fish"** -> Sensorimotor, Preoperational, Concrete, Formal.`
  } else {
    responseText = `Welcome back! I am **K² AI**, your PrepBridge personal tutor.

Your study context shows preparation in: **${examContext.join(', ') || 'General Studies'}**.

Here is how you can boost your preparation today:
1. **Mock Test Practice:** Solve at least 10 custom AI-generated MCQs today to build pacing.
2. **Revision:** Re-read high-weightage topics like Polity Articles or Quantitative short-tricks.
3. **Current Affairs:** Read today's PIB and Pride MOMENT ticker updates in your header.

How can I assist you with your studies or questions today? Feel free to ask!`
  }

  // Stream this response back word by word
  const words = responseText.split(' ')
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    res.write(`data: ${JSON.stringify({ text: word + (i === words.length - 1 ? '' : ' ') })}\n\n`)
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40)) // micro delay
  }

  res.write('data: [DONE]\n\n')
  res.end()
}
