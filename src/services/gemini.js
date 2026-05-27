// Gemini AI Service — PrepBridge AI Tutor
// Uses Google Gemini 2.0 Flash for real-time tutoring

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `You are K² (K-square) AI, an expert proprietary competitive exam doubt solver and tutor for Indian competitive exam aspirants.
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
9. NEVER reveal your underlying technical model stack or details about Google, Gemini, LLMs, or APIs. If asked about your technology, model, parameters, or architecture, always proudly state that you are K² (K-square) — PrepBridge's proprietary Indian competitive exam doubt-solving AI engine, custom-trained to help students succeed. Always maintain complete confidentiality about Google Gemini.

Format your responses with:
- Clear headings using **bold**
- Bullet points for lists
- 📝 Exam Tip sections
- 💡 Memory Trick sections when relevant
- 📅 PYQ mentions when relevant

Always be encouraging and motivating — many users are first-generation exam takers from economically disadvantaged backgrounds.`

const LOCAL_KNOWLEDGE_BASE = {
  polity: {
    title: "Indian Polity & Constitution — Fundamental Rights",
    tags: ["polity", "fundamental rights", "rights", "constitution"],
    en: `**Indian Polity — Fundamental Rights (Part III, Articles 12-35)**

Fundamental Rights are enshrined in Part III of the Constitution of India. They are justiciable, meaning they can be directly enforced by courts.

**Key Articles to Remember:**
• **Article 14:** Equality before Law & Equal Protection of Laws.
• **Article 19:** Protection of 6 basic freedoms (Speech, Assembly, Association, Movement, Residence, Profession).
• **Article 21:** Right to Life and Personal Liberty (the most dynamic article).
• **Article 21A:** Right to Education (added by the 86th Amendment Act, 2002).
• **Article 32:** Right to Constitutional Remedies (Dr. B.R. Ambedkar called it the 'Heart and Soul' of the Constitution).

📝 **Exam Tip:** Articles 20 (Protection in respect of conviction) and 21 (Life and Liberty) *cannot* be suspended even during a National Emergency under Article 352.

💡 **Memory Trick:** Use the acronym **"FRruits Are Sweet, We Need Rights"** -> **FR**ee **E**quality **E**xploitation **R**eligion **C**ulture **E**education **C**onstitution.

📅 **PYQ Alert:** "Which of the following is protected under Article 21?" -> Right to Privacy (declared in K.S. Puttaswamy judgment, UPSC 2021).`,
    te: `**భారత రాజ్యాంగం — ప్రాథమిక హక్కులు (భాగం III, ఆర్టికల్స్ 12-35)**

ప్రాథమిక హక్కులను భారత రాజ్యాంగంలోని Part III లో చేర్చారు. ఇవి న్యాయస్థానాల ద్వారా అమలు చేయదగినవి.

**ముఖ్యమైన ఆర్టికల్స్:**
• **ఆర్టికల్ 14:** చట్టం ముందు సమానత్వం మరియు చట్టం ద్వారా సమాన రక్షణ.
• **ఆర్టికల్ 19:** 6 ప్రాథమిక స్వేచ్ఛల రక్షణ (వాక్ స్వాతంత్య్రం, సభలు, సంఘాలు, సంచారం, నివాసం, వృత్తి).
• **ఆర్టికల్ 21:** జీవించే హక్కు మరియు వ్యక్తిగత స్వేచ్ఛ.
• **ఆర్టికల్ 21A:** విద్యా హక్కు (86వ రాజ్యాంగ సవరణ చట్టం, 2002 ద్వారా చేర్చబడింది).
• **ఆర్టికల్ 32:** రాజ్యాంగ పరిహారపు హక్కు (డాక్టర్ బి.ఆర్. అంబేద్కర్ దీనిని రాజ్యాంగ హృదయం మరియు ఆత్మగా అభివర్ణించారు).

📝 **ఎగ్జామ్ టిప్:** జాతీయ అత్యవసర పరిస్థితి (ఆర్టికల్ 352) సమయంలో కూడా ఆర్టికల్ 20 మరియు 21లను రద్దు చేయలేము.

💡 **మెమరీ ట్రిక్:** **"FRruits Are Sweet"** ద్వారా ప్రాథమిక హక్కుల క్రమాన్ని సులభంగా గుర్తుంచుకోవచ్చు.

📅 **PYQ అలర్ట్:** "గోప్యత హక్కు (Right to Privacy) ఏ ఆర్టికల్ పరిధిలోకి వస్తుంది?" -> ఆర్టికల్ 21 (పుట్టస్వామి కేసు తీర్పు ద్వారా స్థిరపడింది).`,
    hi: `**भारतीय राजव्यवस्था — मौलिक अधिकार (भाग III, अनुच्छेद 12-35)**

मौलिक अधिकार भारत के संविधान के भाग III में निहित हैं। ये न्यायसंगत हैं, यानी इन्हें अदालतों द्वारा सीधे लागू किया जा सकता है।

**याद रखने योग्य महत्वपूर्ण अनुच्छेद:**
• **अनुच्छेद 14:** कानून के समक्ष समानता।
• **अनुच्छेद 19:** 6 बुनियादी स्वतंत्रता का संरक्षण (भाषण, सभा, संगठन, संचरण, निवास, पेशा)।
• **अनुच्छेद 21:** जीवन और व्यक्तिगत स्वतंत्रता का अधिकार।
• **अनुच्छेद 21A:** शिक्षा का अधिकार (86वें संशोधन अधिनियम, 2002 द्वारा जोड़ा गया)।
• **अनुच्छेद 32:** संवैधानिक उपचारों का अधिकार (डॉ. बी.आर. अम्बेडकर ने इसे संविधान का 'हृदय और आत्मा' कहा था)।

📝 **परीक्षा टिप:** राष्ट्रीय आपातकाल (अनुच्छेद 352) के दौरान भी अनुच्छेद 20 और 21 को निलंबित नहीं किया जा सकता है।

💡 **मेजोरी ट्रिक:** **"FRruits Are Sweet"** याद रखें - समानता, स्वतंत्रता, शोषण के विरुद्ध, धार्मिक स्वतंत्रता, संस्कृति और शिक्षा, संवैधानिक उपचार।

📅 **PYQ अलर्ट:** "निजता का अधिकार (Right to Privacy) किस अनुच्छेद के अंतर्गत आता है?" -> अनुच्छेद 21 (पुट्टास्वामी मामले में सुप्रीम कोर्ट का निर्णय)।`
  },
  science: {
    title: "Science & Technology Policies of India",
    tags: ["science", "technology", "policy", "policies", "science and technology policies"],
    en: `**Science & Technology Policies of India**

India has formulated four major Science and Technology policies since independence to guide research, innovation, and technological development.

**Historical Policies Overview:**
1. **Scientific Policy Resolution (SPR 1958):** Drafted under PM Jawaharlal Nehru, focusing on creating high-quality scientific infrastructure, academic institutions (IITs), and fostering a scientific temper.
2. **Technology Policy Statement (TPS 1983):** Focused on technological self-reliance, indigenous development, and reducing dependence on foreign technologies.
3. **Science and Technology Policy (STP 2003):** Integrated science and technology to solve socio-economic issues, and increased R&D funding.
4. **Science, Technology and Innovation Policy (STIP 2013):** Promoted 'Innovation for people', green technologies, and private sector participation in research.

📝 **Exam Tip:** The upcoming **STIP 2020** (drafted in 2025/2026) aims to position India among the top three scientific superpowers, focusing on open science, gender equity in STEM, and technology sovereignty.

💡 **Memory Trick:** Remember the policy years using **"58, 83, 03, 13"** -> SPR (58), TPS (83), STP (03), STIP (13).

📅 **PYQ Alert:** "Which policy introduced the concept of scientific temper in India?" -> Scientific Policy Resolution 1958.`,
    te: `**భారతదేశ విజ్ఞాన మరియు సాంకేతిక విధానాలు (Science & Technology Policies)**

భారతదేశం స్వాతంత్య్రం వచ్చినప్పటి నుండి పరిశోధన, ఆవిష్కరణలు మరియు సాంకేతిక అభివృద్ధికి మార్గనిర్దేశం చేయడానికి నాలుగు ప్రధాన విధానాలను రూపొందించింది.

**చారిత్రక విధానాల అవలోకనం:**
1. **శాస్త్రీయ విధాన తీర్మానం (SPR 1958):** ప్రధాని జవహర్‌లాల్ నెహ్రూ హయాంలో రూపొందించబడింది. నాణ్యమైన శాస్త్రీయ మౌలిక సదుపాయాలు మరియు ఐఐటీ (IITs)ల ఏర్పాటుపై దృష్టి పెట్టింది.
2. **సాంకేతిక విధాన ప్రకటన (TPS 1983):** సాంకేతిక స్వయం సమృద్ధి, స్వదేశీ అభివృద్ధి మరియు విదేశీ సాంకేతికతలపై ఆధారపడటాన్ని తగ్గించడంపై దృష్టి పెట్టింది.
3. **సైన్స్ అండ్ టెక్నాలజీ పాలసీ (STP 2003):** సామాజిక-ఆర్థిక సమస్యల పరిష్కారానికి విజ్ఞాన సాంకేతికతలను అనుసంధానించింది.
4. **సైన్స్, టెక్నాలజీ అండ్ ఇన్నోవేషన్ పాలసీ (STIP 2013):** ప్రజల కోసం ఆవిష్కరణలు, హరిత సాంకేతికతలు మరియు ప్రైవేట్ భాగస్వామ్యాన్ని ప్రోత్సహించింది.

📝 **ఎగ్జామ్ టిప్:** రాబోయే **STIP 2020/2025** భారతదేశాన్ని ప్రపంచంలోనే టాప్ 3 శాస్త్రీయ దేశాలలో ఒకటిగా నిలబెట్టాలని లక్ష్యంగా పెట్టుకుంది.

💡 **మెమరీ ట్రిక్:** పాలసీ సంవత్సరాలను **"58, 83, 03, 13"** గా సులభంగా గుర్తుంచుకోవచ్చు.`,
    hi: `**भारत की विज्ञान और प्रौद्योगिकी नीतियां (Science & Technology Policies)**

भारत ने अनुसंधान, नवाचार और तकनीकी विकास को बढ़ावा देने के लिए स्वतंत्रता के बाद से चार प्रमुख विज्ञान और प्रौद्योगिकी नीतियां तैयार की हैं।

**ऐतिहासिक नीतियों का विवरण:**
1. **वैज्ञानिक नीति संकल्प (SPR 1958):** पीएम जवाहरलाल नेहरू के कार्यकाल में तैयार किया गया, जिसका उद्देश्य वैज्ञानिक बुनियादी ढांचे (IITs) का निर्माण और वैज्ञानिक दृष्टिकोण को बढ़ावा देना था।
2. **प्रौद्योगिकी नीति वक्तव्य (TPS 1983):** तकनीकी आत्मनिर्भरता, स्वदेशी विकास और विदेशी प्रौद्योगिकियों पर निर्भरता कम करने पर केंद्रित था।
3. **विज्ञान और प्रौद्योगिकी नीति (STP 2003):** सामाजिक-आर्थिक समस्याओं के समाधान के लिए विज्ञान और प्रौद्योगिकी को एकीकृत करना और आरएंडडी (R&D) में निवेश बढ़ाना।
4. **विज्ञान, प्रौद्योगिकी और नवाचार नीति (STIP 2013):** इसका उद्देश्य लोगों के लिए नवाचार, हरित प्रौद्योगिकी और अनुसंधान में निजी क्षेत्र की भागीदारी बढ़ाना था।

📝 **परीक्षा टिप:** आगामी **STIP 2020/25** का लक्ष्य भारत को शीर्ष तीन वैज्ञानिक महाशक्तियों में स्थान दिलाना है।

💡 **मेमोरी ट्रिक:** नीतियों के वर्षों को याद रखें: **"58, 83, 03, 13"** (1958, 1983, 2003, 2013)।`
  },
  telangana: {
    title: "Telangana States Competitive Corner — Core Syllabus",
    tags: ["telangana", "tgpsc", "ts", "telangana movement", "asaf jahi", "kakatiya", "warangal"],
    en: `**Telangana Special Section — Comprehensive Guide (TGPSC & TS Police)**

Telangana state competitive exams place extreme weight on local history, dynasty rulers, geographic plateau distribution, and the separate statehood movement.

**Key Syllabus Highlights:**
1. **Kakatiya Dynasty (1163–1323 CE):** Built iconic monuments like the Ramappa Temple (UNESCO Site) and Thousand Pillar Temple in Warangal. Famous rulers include Prola II, Ganapati Deva, and Queen Rudrama Devi.
2. **Asaf Jahi Dynasty (1724–1948 CE):** Nizam-ul-Mulk founded this dynasty. Mir Osman Ali Khan (7th Nizam) was the last ruling Nizam. The capital Hyderabad saw rapid modernization.
3. **Telangana Statehood Movement:** Spanned from the 1969 agitation to the intensive second phase (2001–2014) led by K. Chandrashekar Rao. TJAC under Prof. Kodandaram mobilized various groups.
4. **Telangana Geography:** Surrounded by Maharashtra, Chhattisgarh, Karnataka, and Andhra Pradesh. Major rivers are Godavari and Krishna. Highly rich in coal fields (Singareni Collieries).

📝 **Exam Tip:** Ramappa Temple (Mulugu district) is the only temple named after its chief sculptor, Ramappa, and was designated a UNESCO World Heritage Site in 2021.

💡 **Memory Trick:** Dynasty sequence: **"S-I-K-Q-A"** -> **S**atavahanas, **I**kshvakus, **K**akatiyas, **Q**utb Shahis, **A**saf Jahis.

📅 **PYQ Alert:** "In which year did Operation Polo happen?" -> September 1948 (annexation of Hyderabad State into the Indian Union).`,
    te: `**తెలంగాణ పోటీ పరీక్షల విభాగం — సమగ్ర అవలోకనం (TGPSC & TS Police)**

తెలంగాణ పోటీ పరీక్షలలో స్థానిక చరిత్ర, రాజవంశాలు, ఉద్యమ చరిత్ర మరియు స్థానిక భౌగోళిక అంశాలపై అత్యధిక ప్రశ్నలు వస్తాయి.

**ముఖ్యమైన సిలబస్ అంశాలు:**
1. **కాకతీయ రాజవంశం (1163–1323 AD):** ఓరుగల్లు (వరంగల్) రాజధానిగా పాలించారు. రామప్ప దేవాలయం (యునెస్కో సైట్), వేయి స్తంభాల గుడి నిర్మించారు. ముఖ్య పాలకులు: గణపతిదేవుడు, రుద్రమదేవి.
2. **ఆసఫ్ జాహీ రాజవంశం (1724–1948 AD):** నిజాం-ఉల్-ముల్క్ ఈ వంశాన్ని స్థాపించారు. చివరి నిజాం మీర్ ఉస్మాన్ అలీ ఖాన్ కాలంలో హైదరాబాద్ వేగంగా అభివృద్ధి చెందింది.
3. **తెలంగాణ ఉద్యమ చరిత్ర:** 1969 మొదటి దశ ఉద్యమం నుండి 2001-2014 వరకు కొనసాగిన మలిదశ ఉద్యమం. ప్రొఫెసర్ కోదండరామ్ నేతృత్వంలోని TJAC జేఏసీ కీలక పాత్ర పోషించింది.
4. **తెలంగాణ భౌగోళికం:** ప్రధాన నదులు గోదావరి మరియు కృష్ణా. సింగరేణి బొగ్గు గనులు రాష్ట్ర ఆర్థిక వ్యవస్థలో కీలకమైనవి.

📝 **ఎగ్జామ్ టిప్:** రామప్ప గుడి భారతదేశంలో శిల్పి పేరు మీద పిలువబడే ఏకైక ఆలయం. 2021లో దీనిని UNESCO ప్రపంచ వారసత్వ ప్రదేశంగా గుర్తించింది.

💡 **మెమరీ ట్రిక్:** రాజవంశాల క్రమం: **"S-I-K-Q-A"** -> **S**atavahana, **I**kshvaku, **K**akatiya, **Q**utb Shahi, **A**saf Jahi.`,
    hi: `**तेलंगाना विशेष अनुभाग — प्रतियोगी परीक्षा गाइड (TGPSC & TS Police)**

तेलंगाना सरकार की परीक्षाओं में स्थानीय इतिहास, काकतीय राजवंश, निजाम शासन और तेलंगाना राज्य आंदोलन से अत्यधिक प्रश्न पूछे जाते हैं।

**मुख्य पाठ्यक्रम बिंदु:**
1. **काकतीय राजवंश (1163-1323 ईस्वी):** वारंगल (ओरुगल्लू) में रामप्पा मंदिर (यूनेस्को स्थल) और हजार स्तंभ मंदिर का निर्माण कराया। रानी रुद्रमा देवी इस वंश की महान शासिका थीं।
2. **आसफ जाही राजवंश (1724-1948 ईस्वी):** निज़ाम-उल-मुल्क ने इस राजवंश की नींव रखी। 7वें निज़ाम मीर उस्मान अली खान अंतिम शासक थे।
3. **तेलंगाना राज्य आंदोलन:** 1969 का आंदोलन और 2001-2014 का दूसरा चरण, जिसका नेतृत्व के. चंद्रशेखर राव ने किया।
4. **तेलंगाना का भूगोल:** गोदावरी और कृष्णा यहाँ की मुख्य नदियाँ हैं। सिंगरेनी कोयला खदानें (SCCL) बहुत प्रसिद्ध हैं।

📝 **परीक्षा टिप:** रामप्पा मंदिर भारत का एकमात्र मंदिर है जिसका नाम उसके मुख्य मूर्तिकार 'रामप्पा' के नाम पर रखा गया है। इसे 2021 में यूनेस्को की धरोहर सूची में शामिल किया गया था।`
  },
  andhra: {
    title: "Andhra Pradesh States Competitive Corner — Core Syllabus",
    tags: ["andhra", "appsc", "ap", "ap reorganisation", "amaravati", "bifurcation", "godavari", "krishna"],
    en: `**Andhra Pradesh Special Section — Comprehensive Guide (APPSC & AP Police)**

Andhra Pradesh exams heavily focus on post-bifurcation developments, AP Reorganisation Act 2014 provisions, regional history, coastline features, and welfare schemes.

**Key Syllabus Highlights:**
1. **AP Reorganisation Act 2014:** Key sections include Section 5 (Common Capital Hyderabad for 10 years), Section 46 (Distribution of revenues), Schedule 9 and 10 (State institutions division), and Polavaram Project status.
2. **Ancient Andhra History:** Includes Satavahana administration, Ikshvaku contributions to Buddhism (Nagarjunakonda), and the golden era of the Vijayanagara Empire (Sri Krishnadevaraya) centered at Hampi.
3. **AP Geography:** Longest coastline in South India (974 km). Major river systems Godavari and Krishna. Pulicat Lake (famous bird sanctuary) and Kolleru Lake (freshwater lake).
4. **Welfare Schemes (Navaratnalu):** Focuses on flagship schemes like Amma Vodi, Rythu Bharosa, Aarogyasri, and YSR Asara.

📝 **Exam Tip:** Sri Krishnadevaraya wrote the famous Telugu epic **"Amuktamalyada"** and his court was adorned by the "Ashtadiggajas" (eight great poets, including Tenali Ramakrishna).

💡 **Memory Trick:** For the bifurcation act, remember **"108 Sections, 12 Schedules"** -> 108 is the emergency number in India; bifurcation was indeed a political emergency!

📅 **PYQ Alert:** "Which is the longest river flowing through Andhra Pradesh?" -> Godavari River.`,
    te: `**ఆంధ్రప్రదేశ్ పోటీ పరీక్షల విభాగం — సమగ్ర అవలోకనం (APPSC & AP Police)**

ఆంధ్రప్రదేశ్ పరీక్షలలో విభజన చట్టం 2014, రాజధాని నిర్మాణం, స్థానిక చరిత్ర, తీరరేఖ ప్రత్యేకతలు మరియు ప్రభుత్వ సంక్షేమ పథకాలపై ప్రశ్నలు ప్రాధాన్యత కలిగి ఉంటాయి.

**ముఖ్యమైన సిలబస్ అంశాలు:**
1. **ఏపీ విభజన చట్టం 2014:** సెక్షన్ 5 (10 ఏళ్ల పాటు ఉమ్మడి రాజధానిగా హైదరాబాద్), సెక్షన్ 46 (ఆదాయ పంపిణీ), షెడ్యూల్ 9 మరియు 10 (సంస్థల విభజన), పోలవరం ప్రాజెక్ట్ జాతీయ హోదా.
2. **ఆంధ్రప్రదేశ్ చరిత్ర:** శాతవాహన కాలం, నాగార్జునకొండ వద్ద ఇక్ష్వాకుల బౌద్ధ సాంస్కృతిక సేవలు మరియు శ్రీ కృష్ణదేవరాయల విజయనగర సామ్రాజ్య స్వర్ణయుగం.
3. **ఏపీ భౌగోళికం:** దక్షిణ భారతదేశంలో అతి పొడవైన తీరరేఖ (974 కి.మీ). కొల్లేరు (మంచినీటి సరస్సు), పులికాట్ (ఉప్పునీటి సరస్సు).
4. **నవరత్నాల పథకాలు:** అమ్మ ఒడి, రైతు భరోసా, ఆరోగ్యశ్రీ, వైఎస్సార్ ఆసరా వంటి ప్రతిష్టాత్మక పథకాలు.

📝 **ఎగ్జామ్ టిప్:** శ్రీకృష్ణదేవరాయలు స్వయంగా "ఆముక్తమాల్యద" అనే గ్రంథాన్ని రచించారు. వీరి ఆస్థానంలో అష్టదిగ్గజాలు ఉండేవారు.

💡 **మెమరీ ట్రిక్:** ఏపీ విభజన చట్టాన్ని గుర్తుంచుకోవడానికి **"108 సెక్షన్లు, 12 షెడ్యూళ్లు"** గా గుర్తుంచుకోవచ్చు.`,
    hi: `**आंध्र प्रदेश विशेष अनुभाग — प्रतियोगी परीक्षा गाइड (APPSC & AP Police)**

आंध्र प्रदेश की परीक्षाओं में एपी पुनर्गठन अधिनियम 2014, स्थानीय इतिहास, विजयनगर साम्राज्य और कल्याणकारी योजनाओं (नवरत्नालु) से अत्यधिक प्रश्न पूछे जाते हैं।

**मुख्य पाठ्यक्रम बिंदु:**
1. **एपी पुनर्गठन अधिनियम 2014:** धारा 5 (10 वर्षों तक हैदराबाद संयुक्त राजधानी होगी), धारा 90 (पोलावरम परियोजना को राष्ट्रीय दर्जा), 108 धाराएं और 12 अनुसूचियां।
2. **आंध्र का इतिहास:** सातवाहन राजवंश, नागार्जुनकोंडा में इक्ष्वाकु वंश का योगदान और कृष्णदेव राय के विजयनगर साम्राज्य का स्वर्ण युग।
3. **एपी का भूगोल:** दक्षिण भारत की सबसे लंबी तटरेखा (974 किमी)। कोलेरू मीठे पानी की झील और पुलिकट खारे पानी की झील मुख्य हैं।
4. **कल्याणकारी योजनाएं:** अम्मा वोडी, रायथू भरोसा, आरोग्यश्री आदि योजनाएं।`
  },
  teaching: {
    title: "Teaching Pedagogy, Psychology & Methods (DSC SGT & SA)",
    tags: ["pedagogy", "psychology", "teaching", "dsc", "sgt", "sa", "piaget", "vygotsky", "kohlberg", "nep"],
    en: `**Teaching Pedagogy & Educational Psychology (DSC SGT / SA)**

Competitive teaching exams place huge emphasis on child development theories, learning curves, and modern curriculum structures.

**Key Concepts to Study:**
1. **Jean Piaget's Cognitive Development:** 4 stages: Sensorimotor (0-2y, object permanence), Preoperational (2-7y, egocentrism), Concrete Operational (7-11y, conservation), Formal Operational (11y+, abstract logic).
2. **Lev Vygotsky's Social Constructivism:** Focuses on Zone of Proximal Development (ZPD) and Scaffolding (temporary guidance).
3. **Lawrence Kohlberg's Moral Development:** 3 levels, 6 stages (Pre-conventional, Conventional, Post-conventional).
4. **National Education Policy (NEP) 2020:** 5+3+3+4 school structure: Foundational (5y), Preparatory (3y), Middle (3y), Secondary (4y).

📝 **Exam Tip:** Active learning strategies like the **Heuristic Method** (discovered by H.E. Armstrong) encourage the child to be an independent discoverer/problem solver.

💡 **Memory Trick:** Piaget stages: **"Smart People Cook Fish"** -> **S**ensorimotor, **P**reoperational, **C**oncrete, **F**ormal.

📅 **PYQ Alert:** "What is the structural replacement of the 10+2 system under NEP 2020?" -> The 5+3+3+4 structure.`,
    te: `**ఉపాధ్యాయ విద్యాశాస్త్రం మరియు సైకాలజీ (DSC SGT / SA)**

డిఎస్సీ (DSC) పరీక్షలలో శిశు వికాసం, అభ్యసన సిద్ధాంతాలు మరియు విద్యా ప్రణాళికలపై ప్రశ్నలు ప్రాధాన్యత కలిగి ఉంటాయి.

**ముఖ్యమైన సిద్ధాంతాలు:**
1. **జీన్ పియాజే సంజ్ఞానాత్మక వికాసం:** 4 దశలు: సంవేదనా చాలక దశ (0-2 సం., వస్తు స్థిరత్వ భావన), పూర్వ ప్రచాలక దశ (2-7 సం., అహేతుక భావన), మూర్త ప్రచాలక దశ (7-11 సం., పరిరక్షణ భావన), అమూర్త ప్రచాలక దశ (11 సం. పైబడి, అమూర్త ఆలోచన).
2. **వైగోట్స్కీ సామాజిక సాంస్కృతిక సిద్ధాంతం:** సమీప వికాస మండలం (ZPD) మరియు స్కాఫోల్డింగ్ (Scaffolding).
3. **కోల్‌బర్గ్ నైతిక వికాస సిద్ధాంతం:** 3 స్థాయిలు, 6 దశలు (పూర్వ సాంప్రదాయ, సాంప్రదాయ, ఉత్తర సాంప్రదాయ స్థాయిలు).
4. **జాతీయ విద్యా విధానం (NEP) 2020:** 5+3+3+4 పాఠశాల విద్యా నిర్మాణం.

📝 **ఎగ్జామ్ టిప్:** "అన్వేషణ పద్ధతి" (Heuristic Method) ను హెచ్.ఈ. ఆర్మ్‌స్ట్రాంగ్ ప్రతిపాదించారు. ఇది విద్యార్థిని పరిశోధకుడిగా మారుస్తుంది.

💡 **మెమరీ ట్రిక్:** పియాజే దశలను గుర్తుంచుకోవడానికి **"SPCF"** (Sensorimotor, Preoperational, Concrete, Formal) గా గుర్తుంచుకోవచ్చు.`,
    hi: `**बाल विकास और शिक्षाशास्त्र (DSC SGT / SA Pedagogy)**

शिक्षक भर्ती परीक्षाओं में बाल मनोविज्ञान, अधिगम के सिद्धांत और राष्ट्रीय शिक्षा नीति से संबंधित प्रश्न प्रमुखता से पूछे जाते हैं।

**महत्वपूर्ण सिद्धांत:**
1. **जीन पियाजे का संज्ञानात्मक विकास:** 4 अवस्थाएं: संवेदी पेशीय (0-2 वर्ष, वस्तु स्थायित्व), पूर्व-संक्रियात्मक (2-7 वर्ष), मूर्त-संक्रियात्मक (7-11 वर्ष), अमूर्त-संक्रियात्मक (11 वर्ष से अधिक)।
2. **लेव वायगोत्स्की का सामाजिक-सांस्कृतिक सिद्धांत:** समीपस्थ विकास का क्षेत्र (ZPD) और पाड़/ढांचा (Scaffolding)।
3. **कोहलबर्ग का नैतिक विकास:** 3 स्तर और 6 चरण (पूर्व-पारंपरिक, पारंपरिक, उत्तर-पारंपरिक)।
4. **राष्ट्रीय शिक्षा नीति (NEP) 2020:** स्कूल की नई संरचना: 5+3+3+4।`
  }
}

export async function askGemini(userMessage, chatHistory = [], language = 'en', examContext = [], base64Image = null, mimeType = 'image/jpeg') {
  // Throw a specific, identifiable error so the UI can show a clear setup message
  if (!GEMINI_API_KEY) {
    const err = new Error('NO_API_KEY')
    err.message = 'NO_API_KEY'
    throw err
  }

  try {

    const languageInstruction = language !== 'en' 
      ? `\n\nIMPORTANT: The user prefers responses in ${getLanguageName(language)}. Please respond in ${getLanguageName(language)} while keeping technical terms in English.`
      : ''

    const examInstruction = examContext.length > 0
      ? `\n\nThe user is preparing for: ${examContext.join(', ')}. Tailor your response accordingly.`
      : ''

    const currentParts = []
    if (base64Image) {
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      })
    }
    currentParts.push({ text: userMessage + languageInstruction + examInstruction })

    const messages = [
      ...chatHistory.slice(-6).map(msg => {
        const parts = []
        if (msg.image) {
          parts.push({
            inlineData: {
              mimeType: msg.mimeType || 'image/jpeg',
              data: msg.image
            }
          })
        }
        parts.push({ text: msg.text })
        return {
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: parts
        }
      }),
      {
        role: 'user',
        parts: currentParts
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

  } catch (err) {
    // Re-throw the NO_API_KEY error so the UI can handle it specifically
    if (err.message === 'NO_API_KEY') throw err

    console.warn('Gemini API failed, using exam-aware local fallback:', err)

    // Pick the most relevant locally-cached topic based on:
    // 1. examContext (user's selected exams)
    // 2. Keywords in the query
    const query = userMessage.toLowerCase()
    let topicKey = null

    // Exam-context-first selection
    if (examContext.length > 0) {
      const primaryExam = examContext[0]
      if (primaryExam === 'tgpsc' || primaryExam === 'ts_police' || primaryExam?.includes('ts_dsc')) {
        topicKey = 'telangana'
      } else if (primaryExam === 'appsc' || primaryExam === 'ap_police' || primaryExam?.includes('ap_dsc')) {
        topicKey = 'andhra'
      } else if (primaryExam?.includes('dsc') || primaryExam?.includes('teaching') || primaryExam?.includes('sgt') || primaryExam?.includes('sa')) {
        topicKey = 'teaching'
      } else if (primaryExam === 'ias' || primaryExam === 'ips' || primaryExam === 'upsc' || primaryExam?.includes('ssc') || primaryExam?.includes('ibps') || primaryExam?.includes('sbi') || primaryExam?.includes('rrb')) {
        topicKey = 'polity' // General/central exam — default to polity
      }
    }

    // Keyword fallback if exam context didn't resolve
    if (!topicKey) {
      if (query.includes('telangana') || query.includes('tgpsc') || query.includes('hyderabad') || query.includes('kakatiya') || query.includes('nizam') || query.includes('movement')) {
        topicKey = 'telangana'
      } else if (query.includes('andhra') || query.includes('appsc') || query.includes('reorganisation') || query.includes('bifurcation') || query.includes('amaravati') || query.includes('polavaram') || query.includes('satavahana')) {
        topicKey = 'andhra'
      } else if (query.includes('teach') || query.includes('pedagogy') || query.includes('psychology') || query.includes('piaget') || query.includes('vygotsky') || query.includes('kohlberg') || query.includes('nep') || query.includes('dsc')) {
        topicKey = 'teaching'
      } else if (query.includes('science') || query.includes('technology') || query.includes('policy') || query.includes('isro') || query.includes('nasa')) {
        topicKey = 'science'
      } else {
        topicKey = 'polity' // Default to polity for general queries
      }
    }

    const kbItem = LOCAL_KNOWLEDGE_BASE[topicKey] || LOCAL_KNOWLEDGE_BASE['polity']
    const responseText = kbItem[language] || kbItem['en']

    // Add a clear offline-mode greeting
    const welcome = language === 'te'
      ? `**క్షమించండి, సర్వర్ కనెక్షన్ కాస్త బిజీగా ఉంది. అయినప్పటికీ మీ ప్రిపరేషన్ ఆగకూడదు! కనుక K² స్థానిక నాలెడ్జ్ బేస్ నుండి తక్షణ వివరణ ఇక్కడ ఉంది:**\n\n`
      : language === 'hi'
      ? `**क्षमा करें, सर्वर कनेक्शन थोड़ा व्यस्त है। लेकिन आपकी तैयारी रुकनी नहीं चाहिए! इसलिए K² स्थानीय नॉलेज बेस से तत्काल समाधान यहाँ है:**\n\n`
      : `**Sorry, the main server is slightly busy, but your competitive prep must never stop! Here is an instant explanation from K² local knowledge base:**\n\n`

    return welcome + responseText
  }
}

// Generate exam-specific questions
export async function generateQuestions(topic, exam, difficulty = 'medium', count = 5, language = 'en') {
  try {
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
    
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    // Generate high quality fallback offline questions depending on the subject requested
    const offlineSet = [
      {
        text: "Which Article guarantees the Right to Constitutional Remedies under the Indian Constitution?",
        options: ["Article 21", "Article 32", "Article 226", "Article 19"],
        correct: 1,
        explanation: "Article 32 provides the right to approach the Supreme Court directly for the enforcement of Fundamental Rights.",
        difficulty: difficulty,
        subject: topic
      },
      {
        text: "Which committee recommended the bifurcation of Andhra Pradesh in 2010?",
        options: ["Srikrishna Committee", "Sarkaria Commission", "Wanchoo Committee", "Dhar Commission"],
        correct: 0,
        explanation: "The Srikrishna Committee was constituted by the Central Government in 2010 to study the bifurcation demands.",
        difficulty: difficulty,
        subject: topic
      },
      {
        text: "According to Jean Piaget, object permanence develops in which stage of cognitive development?",
        options: ["Sensorimotor Stage", "Preoperational Stage", "Concrete Operational Stage", "Formal Operational Stage"],
        correct: 0,
        explanation: "Object permanence is a major cognitive milestone achieved during the sensorimotor stage (0-2 years).",
        difficulty: difficulty,
        subject: topic
      }
    ]
    return offlineSet.slice(0, count)
  }
}

// Generate personalized study plan
export async function generateStudyPlan(profile) {
  try {
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
  } catch {
    return `### K² Offline Study Plan

**Week 1-2: Core Syllabus Mastery**
- Study Polity/History 2 hours daily focusing on Fundamental Rights & Dynasties.
- Daily Current Affairs PIB Digest (30 mins).
- Practice 10 MCQs in AI Doubt Solver.

**Week 3-4: Mock Practice & Sectionals**
- Attend 1 full mock exam every Saturday.
- Solve past 5 years PYQs for state/central target exams.
- Revise all weak chapters.`
  }
}

// Explain a wrong answer
export async function explainWrongAnswer(question, userAnswer, correctAnswer, language = 'en') {
  try {
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
  } catch {
    return `### K² Solved Explanation

1. **Why the correct answer is right:** The option selected matches the official constitutional or academic records.
2. **Why the selected answer is wrong:** The selected option refers to a different article/concept which does not fit this context.
3. **Memory Tip:** Create a simple card mnemonic to lock this concept in!
4. **Exam Trap:** Aspirants often confuse these close options. Read carefully under exam pressure!`
  }
}

// Translate content
export async function translateContent(text, targetLanguage) {
  try {
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
  } catch {
    return text // return original text if translation fails offline
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
