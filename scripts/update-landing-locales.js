import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales')

const EN_LANDING = {
  "nav": {
    "login": "Login",
    "start_free": "Start Free"
  },
  "landing": {
    "hero": {
      "live_aspirants": "{{count}} aspirants preparing right now · Free for everyone",
      "title_line1": "Your Dream",
      "title_line3_1": "Starts Here.",
      "title_line3_2": "Try Free.",
      "subtitle": "One login for 200+ exams — UPSC, SSC, Banking, Railways, State PSC & more. AI tutor in 22 Indian languages. Real mock tests. Live current affairs. All for less than a chai per day.",
      "cta_primary": "Start Preparing Free →",
      "cta_secondary": "Watch How It Works",
      "scroll_explore": "Scroll to explore",
      "word_0": "IAS Officer",
      "word_1": "SSC CGL Job",
      "word_2": "Bank PO",
      "word_3": "Railway Job",
      "word_4": "IPS Officer",
      "word_5": "Police Officer",
      "word_6": "Teacher (KVS)"
    },
    "stats": {
      "questions": "Questions",
      "exams": "Exams Covered",
      "starts_at": "Starts At Just",
      "languages": "Indian Languages"
    },
    "prepared_with": "Prepared with PrepBridge",
    "catalog": {
      "title": "Supported Tracks & Categories",
      "desc": "Explore the exact competitive exams we cover. Instantly launch AI-generated mocks mapped to the latest trends.",
      "govt": "Government Job Exams",
      "entrance": "College Entrance & Boards"
    },
    "demo": {
      "title": "Try a Live Mock Test",
      "desc": "No signup required. Test our interactive interface and read real-time K² AI explanations.",
      "check": "Check Answer",
      "next": "Next Question →",
      "finish": "Finish Test",
      "completed": "Mini Mock Test Completed!",
      "scored": "You scored {{score}} out of {{total}} correct options.",
      "retake": "Retake Demo Mocks",
      "access": "Access 5 Lakh+ Mocks & AI Tutor Now"
    },
    "addons": {
      "peak": {
        "title": "K² PeakPredict Addon"
      },
      "pyq": {
        "title": "Strictly Online PYQs"
      }
    },
    "pricing": {
      "title": "One plan. All exams. Try free.",
      "desc": "2-day free trial for all new students. No credit card required. Cancel anytime.",
      "beta": "Free During Beta Active",
      "start_trial": "Start Free Beta Trial"
    }
  }
}

const HI_LANDING = {
  "nav": {
    "login": "लॉगिन",
    "start_free": "मुफ़्त शुरू करें"
  },
  "landing": {
    "hero": {
      "live_aspirants": "2,45,832 उम्मीदवार अभी तैयारी कर रहे हैं · सभी के लिए मुफ़्त",
      "title_line1": "आपका सपना",
      "title_line3_1": "यहाँ शुरू होता है।",
      "title_line3_2": "मुफ़्त प्रयास करें।",
      "subtitle": "200+ परीक्षाओं के लिए एक लॉगिन — UPSC, SSC, बैंकिंग, रेलवे, राज्य PSC और बहुत कुछ। 22 भारतीय भाषाओं में AI ट्यूटर। असली मॉक टेस्ट। लाइव करंट अफेयर्स। सब कुछ प्रति दिन एक चाय से भी कम कीमत में।",
      "cta_primary": "मुफ़्त तैयारी शुरू करें →",
      "cta_secondary": "देखें यह कैसे काम करता है",
      "scroll_explore": "खोजने के लिए स्क्रॉल करें",
      "word_0": "IAS अधिकारी",
      "word_1": "SSC CGL नौकरी",
      "word_2": "बैंक PO",
      "word_3": "रेलवे नौकरी",
      "word_4": "IPS अधिकारी",
      "word_5": "पुलिस अधिकारी",
      "word_6": "शिक्षक (KVS)"
    },
    "stats": {
      "questions": "प्रश्न",
      "exams": "परीक्षाएं कवर की गईं",
      "starts_at": "मात्र शुरू",
      "languages": "भारतीय भाषाएं"
    },
    "prepared_with": "प्रेपब्रिज के साथ तैयारी की",
    "catalog": {
      "title": "समर्थित ट्रैक्स और श्रेणियां",
      "desc": "हम जिन प्रतियोगी परीक्षाओं को कवर करते हैं, उन्हें विस्तार से देखें। नवीनतम रुझानों के अनुसार तुरंत AI-जनरेटेड मॉक टेस्ट शुरू करें।",
      "govt": "सरकारी नौकरी परीक्षाएं",
      "entrance": "कॉलेज प्रवेश और बोर्ड"
    },
    "demo": {
      "title": "लाइव मॉक टेस्ट का प्रयास करें",
      "desc": "किसी साइनअप की आवश्यकता नहीं है। हमारे इंटरैक्टिव इंटरफ़ेस का परीक्षण करें और रीयल-टाइम K² AI स्पष्टीकरण पढ़ें।",
      "check": "उत्तर जांचें",
      "next": "अगला प्रश्न →",
      "finish": "परीक्षा समाप्त करें",
      "completed": "मिनी मॉक टेस्ट पूरा हुआ!",
      "scored": "आपने {{total}} में से {{score}} सही विकल्पों का स्कोर किया।",
      "retake": "डेमो मॉक पुनः लें",
      "access": "अभी 5 लाख+ मॉक और AI ट्यूटर का उपयोग करें"
    },
    "addons": {
      "peak": {
        "title": "K² पीकप्रिडिक्ट ऐडऑन"
      },
      "pyq": {
        "title": "कड़ाई से ऑनलाइन PYQs"
      }
    },
    "pricing": {
      "title": "एक योजना। सभी परीक्षाएं। मुफ़्त प्रयास करें।",
      "desc": "सभी नए छात्रों के लिए 2-दिवसीय मुफ़्त परीक्षण। किसी क्रेडिट कार्ड की आवश्यकता नहीं है। कभी भी रद्द करें।",
      "beta": "बीटा के दौरान मुफ़्त सक्रिय",
      "start_trial": "मुफ़्त बीटा परीक्षण शुरू करें"
    }
  }
}

const TE_LANDING = {
  "nav": {
    "login": "లాగిన్",
    "start_free": "ఉచితంగా ప్రారంభించండి"
  },
  "landing": {
    "hero": {
      "live_aspirants": "2,45,832 మంది ఆస్పిరెంట్స్ ప్రస్తుతం సిద్ధమవుతున్నారు · అందరికీ ఉచితం",
      "title_line1": "మీ కల",
      "title_line3_1": "ఇక్కడే మొదలవుతుంది.",
      "title_line3_2": "ఉచితంగా ప్రయత్నించండి.",
      "subtitle": "200+ పరీక్షలకు ఒకే లాగిన్ — UPSC, SSC, బ్యాంకింగ్, రైల్వేస్, స్టేట్ PSC & మరిన్ని. 22 భారతీయ భాషలలో AI ట్యూటర్. నిజమైన మాక్ టెస్టులు. లైవ్ కరెంట్ అఫైర్స్. రోజుకు ఒక చాయ్ కంటే తక్కువ ఖర్చుతో.",
      "cta_primary": "ఉచితంగా ప్రిపరేషన్ ప్రారంభించండి →",
      "cta_secondary": "ఇది ఎలా పనిచేస్తుందో చూడండి",
      "scroll_explore": "అన్వేషించడానికి స్క్రోల్ చేయండి",
      "word_0": "IAS అధికారి",
      "word_1": "SSC CGL ఉద్యోగం",
      "word_2": "బ్యాంక్ PO",
      "word_3": "రైల్వే ఉద్యోగం",
      "word_4": "IPS అధికారి",
      "word_5": "పోలీస్ అధికారి",
      "word_6": "ఉపాధ్యాయుడు (KVS)"
    },
    "stats": {
      "questions": "ప్రశ్నలు",
      "exams": "పరీక్షల కవరేజ్",
      "starts_at": "కేవలం ప్రారంభం",
      "languages": "భారతీయ భాషలు"
    },
    "prepared_with": "ప్రెప్‌బ్రిజ్ తో ప్రిపేర్ అయ్యారు",
    "catalog": {
      "title": "మద్దతు ఉన్న విభాగాలు & కేటగిరీలు",
      "desc": "మేము కవర్ చేసే పోటీ పరీక్షలను అన్వేషించండి. తాజా ట్రెండ్‌ల ఆధారంగా AI-జనరేటెడ్ మాక్ టెస్టులను వెంటనే ప్రారంభించండి.",
      "govt": "ప్రభుత్వ ఉద్యోగ పరీక్షలు",
      "entrance": "కళాశాల ప్రవేశం & బోర్డులు"
    },
    "demo": {
      "title": "లైవ్ మాక్ టెస్ట్ ప్రయత్నించండి",
      "desc": "ఎటువంటి సైన్అప్ అవసరం లేదు. మా ఇంటరాక్టివ్ ఇంటర్‌ఫేస్‌ను పరీక్షించండి మరియు రియల్-టైమ్ K² AI వివరణలను చదవండి.",
      "check": "జవాబును తనిఖీ చేయండి",
      "next": "తదుపరి ప్రశ్న →",
      "finish": "పరీక్షను పూర్తి చేయండి",
      "completed": "మినీ మాక్ టెస్ట్ పూర్తయింది!",
      "scored": "మీరు {{total}} కి గాను {{score}} సరైన సమాధానాలు సాధించారు.",
      "retake": "డెమో మాక్ తిరిగి రాయండి",
      "access": "5 లక్షలకు పైగా మాక్ టెస్టులు & AI ట్యూటర్ యాక్సెస్ చేయండి"
    },
    "addons": {
      "peak": {
        "title": "K² పీక్‌ప్రెడిక్ట్ యాడ్-ఆన్"
      },
      "pyq": {
        "title": "ఖచ్చితంగా ఆన్‌లైన్ PYQలు"
      }
    },
    "pricing": {
      "title": "ఒకే ప్లాన్. అన్ని పరీక్షలు. ఉచితంగా ప్రయత్నించండి.",
      "desc": "కొత్త విద్యార్థులందరికీ 2 రోజుల ఉచిత ట్రయల్. క్రెడిట్ కార్డ్ అవసరం లేదు. ఎప్పుడైనా రద్దు చేసుకోండి.",
      "beta": "బీటా సమయంలో ఉచితం",
      "start_trial": "ఉచిత బీటా ట్రయల్ ప్రారంభించండి"
    }
  }
}

const TA_LANDING = {
  "nav": {
    "login": "உள்நுழை",
    "start_free": "இலவசமாகத் தொடங்கு"
  },
  "landing": {
    "hero": {
      "live_aspirants": "2,45,832 தேர்வாளர்கள் இப்போது தயாராகிறார்கள் · அனைவருக்கும் இலவசம்",
      "title_line1": "உங்கள் கனவு",
      "title_line3_1": "இங்கே தொடங்குகிறது.",
      "title_line3_2": "இலவசமாக முயற்சிக்கவும்.",
      "subtitle": "200+ தேர்வுகளுக்கு ஒரே உள்நுழைவு — UPSC, SSC, வங்கி, ரயில்வே, மாநில PSC மற்றும் பல. 22 இந்திய மொழிகளில் AI ஆசிரியர். உண்மையான மாதிரி தேர்வுகள். நேரடி நடப்பு நிகழ்வுகள்.",
      "cta_primary": "இலவசமாகத் தயாராகத் தொடங்கு →",
      "cta_secondary": "இது எப்படி வேலை செய்கிறது என்று பாருங்கள்",
      "scroll_explore": "ஆராய கீழே உருட்டவும்",
      "word_0": "IAS அதிகாரி",
      "word_1": "SSC CGL வேலை",
      "word_2": "வங்கி PO",
      "word_3": "ரயில்வே வேலை",
      "word_4": "IPS அதிகாரி",
      "word_5": "காவல் அதிகாரி",
      "word_6": "ஆசிரியர் (KVS)"
    },
    "stats": {
      "questions": "கேள்விகள்",
      "exams": "தேர்வுகள் உள்ளடக்கம்",
      "starts_at": "வெறும் தொடக்கம்",
      "languages": "இந்திய மொழிகள்"
    },
    "prepared_with": "பிரெப்ரிட்ஜ் மூலம் தயாரானார்",
    "catalog": {
      "title": "ஆதரிக்கப்படும் தேர்வுகள் & பிரிவுகள்",
      "desc": "நாங்கள் உள்ளடக்கும் போட்டித் தேர்வுகளை ஆராயுங்கள். சமீபத்திய போக்குகளுக்கு ஏற்ப AI-உருவாக்கிய மாதிரித் தேர்வுகளைத் தொடங்குங்கள்.",
      "govt": "அரசு வேலை தேர்வுகள்",
      "entrance": "கல்லூரி சேர்க்கை மற்றும் வாரியங்கள்"
    },
    "demo": {
      "title": "நேரடி மாதிரித் தேர்வை முயற்சிக்கவும்",
      "desc": "பதிவு செய்ய தேவையில்லை. எங்கள் ஊடாடும் இடைமுகத்தைச் சோதித்து, நிகழ்நேர K² AI விளக்கங்களைப் படிக்கவும்.",
      "check": "பதிலைச் சரிபார்க்கவும்",
      "next": "அடுத்த கேள்வி →",
      "finish": "தேர்வை முடி",
      "completed": "மினி மாதிரி தேர்வு முடிந்தது!",
      "scored": "நீங்கள் {{total}} கேள்விகளில் {{score}} சரியான பதில்களைப் பெற்றுள்ளீர்கள்.",
      "retake": "மீண்டும் மாதிரித் தேர்வை எழுது",
      "access": "5 லட்சம்+ தேர்வுகள் & AI ஆசிரியரை இப்போது அணுகவும்"
    },
    "addons": {
      "peak": {
        "title": "K² பீக்பிரெடிக்ட் ஆட்-ஆன்"
      },
      "pyq": {
        "title": "ஆன்லைனில் மட்டுமே PYQக்கள்"
      }
    },
    "pricing": {
      "title": "ஒரு திட்டம். அனைத்து தேர்வுகள். இலவசமாக முயற்சிக்கவும்.",
      "desc": "அனைத்து புதிய மாணவர்களுக்கும் 2 நாள் இலவச சோதனை. கிரெடிட் கார்டு தேவையில்லை. எப்போது வேண்டுமானாலும் ரத்து செய்யலாம்.",
      "beta": "பீட்டா காலத்தில் இலவசம்",
      "start_trial": "இலவச பீட்டா சோதனையைத் தொடங்கு"
    }
  }
}

const BN_LANDING = {
  "nav": {
    "login": "লগইন",
    "start_free": "বিনামূল্যে শুরু করুন"
  },
  "landing": {
    "hero": {
      "live_aspirants": "২,৪৫,৮৩২ জন পরীক্ষার্থী এখন প্রস্তুতি নিচ্ছেন · সবার জন্য বিনামূল্যে",
      "title_line1": "আপনার স্বপ্ন",
      "title_line3_1": "এখানে শুরু হয়।",
      "title_line3_2": "বিনামূল্যে চেষ্টা করুন।",
      "subtitle": "২০০+ পরীক্ষার জন্য একটি লগইন — UPSC, SSC, ব্যাংকিং, রেলওয়ে, রাজ্য PSC এবং আরও অনেক কিছু। ২২টি ভারতীয় ভাষায় AI শিক্ষক। আসল মক টেস্ট। লাইভ কারেন্ট অ্যাফেয়ার্স।",
      "cta_primary": "বিনামূল্যে প্রস্তুতি শুরু করুন →",
      "cta_secondary": "কিভাবে কাজ করে দেখুন",
      "scroll_explore": "আবিষ্কার করতে স্ক্রোল করুন",
      "word_0": "IAS অফিসার",
      "word_1": "SSC CGL চাকরি",
      "word_2": "ব্যাংক PO",
      "word_3": "রেলওয়ে চাকরি",
      "word_4": "IPS অফিসার",
      "word_5": "পুলিশ অফিসার",
      "word_6": "শিক্ষক (KVS)"
    },
    "stats": {
      "questions": "প্রশ্নাবলী",
      "exams": "পরীক্ষার কভারেজ",
      "starts_at": "মাত্র শুরু",
      "languages": "ভারতীয় ভাষাসমূহ"
    },
    "prepared_with": "প্রেপব্রিজের সাথে প্রস্তুতি নিয়েছেন",
    "catalog": {
      "title": "সমর্থিত ট্র্যাক এবং বিভাগসমূহ",
      "desc": "আমরা যে সমস্ত প্রতিযোগিতামূলক পরীক্ষা কভার করি তা অন্বেষণ করুন। সর্বশেষ ট্রেন্ড অনুসারে অবিলম্বে AI-জেনারেটেড মক টেস্ট শুরু করুন।",
      "govt": "সরকারি চাকরির পরীক্ষা",
      "entrance": "কলেজ প্রবেশিকা ও বোর্ড পরীক্ষা"
    },
    "demo": {
      "title": "একটি লাইভ মক টেস্ট চেষ্টা করুন",
      "desc": "কোন সাইনআপের প্রয়োজন নেই। আমাদের ইন্টারেক্টিভ ইন্টারফেস পরীক্ষা করুন এবং রিয়েল-টাইম K² AI ব্যাখ্যা পড়ুন।",
      "check": "উত্তর যাচাই করুন",
      "next": "পরবর্তী প্রশ্ন →",
      "finish": "পরীক্ষা শেষ করুন",
      "completed": "মিনি মক টেস্ট সম্পন্ন হয়েছে!",
      "scored": "আপনি {{total}} এর মধ্যে {{score}} সঠিক উত্তর দিয়েছেন।",
      "retake": "আবার মক টেস্ট দিন",
      "access": "এখনই ৫ লক্ষ+ মক ও AI শিক্ষক অ্যাক্সেস করুন"
    },
    "addons": {
      "peak": {
        "title": "K² পিকপ্রেডিক্ট অ্যাড-অন"
      },
      "pyq": {
        "title": "কঠোরভাবে অনলাইন PYQs"
      }
    },
    "pricing": {
      "title": "একটি প্ল্যান। সব পরীক্ষা। বিনামূল্যে চেষ্টা করুন।",
      "desc": "সব নতুন শিক্ষার্থীদের জন্য ২ দিনের বিনামূল্যে ট্রায়াল। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই। যেকোনো সময় বাতিল করুন।",
      "beta": "বিটা চলাকালীন বিনামূল্যে সক্রিয়",
      "start_trial": "বিনামূল্যে বিটা ট্রায়াল শুরু করুন"
    }
  }
}

// Deep merge helper
function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object') {
      if (!target[key]) target[key] = {}
      mergeDeep(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

function run() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`Locales directory not found at ${LOCALES_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(LOCALES_DIR).filter(file => file.endsWith('.json'))

  files.forEach(file => {
    const filePath = path.join(LOCALES_DIR, file)
    try {
      const contentText = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(contentText)
      
      let sourceToMerge = EN_LANDING
      if (file === 'hi.json') sourceToMerge = HI_LANDING
      else if (file === 'te.json') sourceToMerge = TE_LANDING
      else if (file === 'ta.json') sourceToMerge = TA_LANDING
      else if (file === 'bn.json') sourceToMerge = BN_LANDING
      
      // Merge base JSON structure
      if (!json.translation) json.translation = {}
      
      mergeDeep(json.translation, sourceToMerge)
      
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8')
      console.log(`✓ Updated ${file}`)
    } catch (e) {
      console.error(`✗ Failed updating ${file}:`, e.message)
    }
  })
  
  console.log('🎉 Locale updating process completed successfully!')
}

run()
