import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.join(__dirname, '..')
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'locales')
const EN_PATH = path.join(LOCALES_DIR, 'en.json')

const TARGET_LANGS = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'mai', name: 'Maithili' },
  { code: 'sat', name: 'Santali' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'doi', name: 'Dogri' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'kok', name: 'Konkani' },
  { code: 'brx', name: 'Bodo' },
  { code: 'mni', name: 'Manipuri' }
]

// Simple local fallback dictionary to provide basic native-feeling translations even offline
const LOCAL_TRANSLATIONS = {
  hi: { app_name: "प्रेपब्रिज", dashboard: { title: "अस्पायरेंट डैशबोर्ड", accuracy: "औसत सटीकता", streak: "दैनिक Streak" }, nav: { home: "होम", mock_tests: "मॉक टेस्ट", ai_tutor: "एआई ट्यूटर" } },
  te: { app_name: "ప్రెప్‌బ్రిడ్జ్", dashboard: { title: "ఆస్పిరెంట్ డాష్‌బోర్డ్", accuracy: "సగటు ఖచ్చితత్వం", streak: "రోజువారీ స్ట్రీక్" }, nav: { home: "హోమ్", mock_tests: "మాక్ టెస్టులు", ai_tutor: "AI ట్యూటర్" } },
  ta: { app_name: "பிரெப்ரிட்ஜ்", dashboard: { title: "ஆஸ்பிரண்ட் டாஷ்போர்டு", accuracy: "சராசரி துல்லியம்", streak: "தினசரி ஸ்ட்ரீக்" }, nav: { home: "முகப்பு", mock_tests: "போலி தேர்வுகள்", ai_tutor: "AI ஆசிரியர்" } },
  bn: { app_name: "প্রেপব্রিজ", dashboard: { title: "অ্যাসপায়ারেন্ট ড্যাশবোর্ড", accuracy: "গড় নির্ভুলতা", streak: "দৈনিক স্ট্রিক" }, nav: { home: "হোম", mock_tests: "মক টেস্ট", ai_tutor: "এআই টিউটর" } }
}

// Function to read environment variables from .env file manually (to support Node/Bun simply)
function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
        process.env[key] = value.trim()
      }
    })
  }
}

async function translateWithGemini(apiKey, textContent, targetLangName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  
  const prompt = `You are a professional translator. You will translate the following JSON dictionary from English to ${targetLangName}.
  
  Instructions:
  1. Translate the values (NOT the keys) to ${targetLangName}.
  2. Maintain the exact JSON structure.
  3. Keep specific proper nouns like "PrepBridge", "UPSC", "SSC", "NEET", "JEE", "CLAT", "K² AI", "Razorpay" and similar exam acronyms in English/Latin script.
  4. Return ONLY valid JSON, do not wrap in markdown \`\`\`json blocks or add any comments.
  
  JSON to translate:
  ${textContent}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`)
  }

  const resJson = await response.json()
  const resultText = resJson.candidates?.[0]?.content?.parts?.[0]?.text
  if (!resultText) throw new Error('Empty response from Gemini')

  return JSON.parse(resultText.trim())
}

async function run() {
  loadEnv()
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true })
  }

  if (!fs.existsSync(EN_PATH)) {
    console.error(`Baseline English translation not found at ${EN_PATH}`)
    process.exit(1)
  }

  const enContentText = fs.readFileSync(EN_PATH, 'utf8')
  const enJson = JSON.parse(enContentText)

  console.log(`Starting localization translation for 21 languages...`)
  if (!apiKey) {
    console.warn(`\n⚠️  [WARN] VITE_GEMINI_API_KEY is not defined in environment or .env file.`)
    console.warn(`Falling back to bilingual placeholder generation to build localized catalog safely.\n`)
  }

  for (const lang of TARGET_LANGS) {
    const targetPath = path.join(LOCALES_DIR, `${lang.code}.json`)
    
    try {
      if (apiKey) {
        console.log(`Translating: ${lang.name} (${lang.code})...`)
        const translatedJson = await translateWithGemini(apiKey, enContentText, lang.name)
        fs.writeFileSync(targetPath, JSON.stringify(translatedJson, null, 2), 'utf8')
        console.log(`✓ Saved: ${lang.code}.json`)
      } else {
        // Build simulated/placeholder translation based on the English baseline to prevent crashes
        const fallbackJson = JSON.parse(JSON.stringify(enJson))
        
        // Inject some native indicators if we have them in LOCAL_TRANSLATIONS
        const local = LOCAL_TRANSLATIONS[lang.code] || {}
        if (local.app_name) fallbackJson.translation.app_name = local.app_name
        if (local.dashboard) {
          fallbackJson.translation.dashboard = { ...fallbackJson.translation.dashboard, ...local.dashboard }
        }
        if (local.nav) {
          fallbackJson.translation.nav = { ...fallbackJson.translation.nav, ...local.nav }
        }

        // For other keys, suffix/mark them to indicate translation track
        const processNode = (node, prefix) => {
          for (const key in node) {
            if (typeof node[key] === 'string') {
              // Only modify if it hasn't been set by local overrides
              if (node[key] === enJson.translation[key] || !prefix) {
                node[key] = `[${lang.name}] ${node[key]}`
              }
            } else if (typeof node[key] === 'object' && node[key] !== null) {
              processNode(node[key], true)
            }
          }
        }
        processNode(fallbackJson.translation, false)

        fs.writeFileSync(targetPath, JSON.stringify(fallbackJson, null, 2), 'utf8')
        console.log(`✓ Saved fallback placeholder: ${lang.code}.json`)
      }
    } catch (err) {
      console.error(`✗ Failed translating ${lang.name} (${lang.code}):`, err.message)
      // Save at least a copy of en.json so the app compiles
      fs.writeFileSync(targetPath, enContentText, 'utf8')
    }
  }

  console.log(`\n🎉 Localization translation complete! All files saved in src/locales/`)
}

run()
