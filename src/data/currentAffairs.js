// Simulates auto-loading current affairs - replace with API call in production
export const CURRENT_AFFAIRS_DATA = [
  {
    id: 1, date: '2026-05-26',
    title: 'India launches NISAR satellite jointly with NASA',
    summary: 'NASA-ISRO Synthetic Aperture Radar (NISAR) satellite launched successfully from Sriharikota. It will observe Earth\'s ecosystems, ice mass, vegetation and natural hazards.',
    category: 'Science & Technology', tags: ['ISRO','NASA','Space','Technology'],
    examsRelevant: ['upsc','ssc_cgl','ibps_po','rrb_ntpc'],
    importance: 'high', source: 'PIB'
  },
  {
    id: 2, date: '2026-05-26',
    title: 'RBI raises repo rate to 6.75% amid inflation concerns',
    summary: 'Reserve Bank of India Monetary Policy Committee raised the repo rate by 25 basis points citing persistent core inflation. This marks the third consecutive hike.',
    category: 'Economy', tags: ['RBI','Monetary Policy','Inflation','Banking'],
    examsRelevant: ['ibps_po','sbi_po','rbi_grade_b','upsc'],
    importance: 'high', source: 'RBI'
  },
  {
    id: 3, date: '2026-05-25',
    title: 'India signs free trade agreement with UAE',
    summary: 'India and UAE sign CEPA (Comprehensive Economic Partnership Agreement) covering goods, services and investment. Expected to double bilateral trade to $100 billion.',
    category: 'International Relations', tags: ['Trade','UAE','Economy','CEPA'],
    examsRelevant: ['upsc','ssc_cgl','ibps_po'],
    importance: 'high', source: 'MEA'
  },
  {
    id: 4, date: '2026-05-25',
    title: 'PM Awas Yojana Urban 2.0 — 1 crore houses approved',
    summary: 'Cabinet approves construction of 1 crore affordable houses for urban poor under PMAY-U 2.0 with total investment of Rs 2.30 lakh crore.',
    category: 'Government Schemes', tags: ['PMAY','Housing','Urban','Welfare'],
    examsRelevant: ['upsc','ssc_cgl','ssc_chsl','ibps_po','rrb_ntpc'],
    importance: 'medium', source: 'PIB'
  },
  {
    id: 5, date: '2026-05-25',
    title: 'Chandrayaan-4 mission gets ISRO board approval',
    summary: 'ISRO board greenlights Chandrayaan-4 mission with sample return capability. Mission aims to bring lunar samples back to Earth for the first time by India.',
    category: 'Science & Technology', tags: ['ISRO','Chandrayaan','Moon','Space'],
    examsRelevant: ['upsc','ssc_cgl','rrb_ntpc','nda'],
    importance: 'high', source: 'ISRO'
  },
  {
    id: 6, date: '2026-05-24',
    title: 'India\'s GDP growth at 7.2% for FY2025-26',
    summary: 'National Statistical Office releases advance estimate showing India\'s GDP growth at 7.2% for fiscal year 2025-26, making India the fastest growing major economy.',
    category: 'Economy', tags: ['GDP','Growth','NSO','Economy'],
    examsRelevant: ['upsc','ssc_cgl','ibps_po','sbi_po','rbi_grade_b'],
    importance: 'high', source: 'NSO'
  },
  {
    id: 7, date: '2026-05-24',
    title: 'Digital Rupee transactions cross 1 million per day',
    summary: 'RBI\'s Central Bank Digital Currency (CBDC) — the e-Rupee — crosses the milestone of 1 million daily transactions, signaling wide adoption.',
    category: 'Banking & Finance', tags: ['CBDC','RBI','Digital Rupee','Fintech'],
    examsRelevant: ['ibps_po','sbi_po','rbi_grade_b','upsc'],
    importance: 'medium', source: 'RBI'
  },
  {
    id: 8, date: '2026-05-24',
    title: 'National Education Policy 2020 implementation report released',
    summary: 'Ministry of Education releases 5-year implementation report of NEP 2020. Key achievements: mother tongue instruction up to Class 5 in 18 states, multidisciplinary curriculum in 500+ universities.',
    category: 'Education', tags: ['NEP','Education','Policy','Schools'],
    examsRelevant: ['ctet','kvs','nvs','upsc'],
    importance: 'medium', source: 'MoE'
  },
  {
    id: 9, date: '2026-05-23',
    title: 'India becomes world\'s 3rd largest renewable energy producer',
    summary: 'India surpasses Japan to become the 3rd largest renewable energy producer globally with total installed capacity crossing 200 GW, driven by solar and wind power.',
    category: 'Environment & Energy', tags: ['Renewable Energy','Solar','Climate','Environment'],
    examsRelevant: ['upsc','ssc_cgl','ibps_po'],
    importance: 'high', source: 'MNRE'
  },
  {
    id: 10, date: '2026-05-23',
    title: 'Operation Sindoor: Army neutralizes terror camps',
    summary: 'Indian Armed Forces successfully conducted Operation Sindoor targeting terror infrastructure. All objectives achieved with zero civilian casualties reported by defence ministry.',
    category: 'Defence & Security', tags: ['Defence','Army','Security','Operation'],
    examsRelevant: ['upsc','capf','nda','cds','afcat'],
    importance: 'high', source: 'Ministry of Defence'
  },
  {
    id: 11, date: '2026-05-22',
    title: 'UPI transactions hit record ₹20 lakh crore in April 2026',
    summary: 'NPCI reports UPI transactions crossed ₹20 lakh crore in value during April 2026, a new monthly record. Volume stands at 13.3 billion transactions.',
    category: 'Banking & Finance', tags: ['UPI','NPCI','Digital Payment','Fintech'],
    examsRelevant: ['ibps_po','sbi_po','rbi_grade_b','ssc_cgl'],
    importance: 'medium', source: 'NPCI'
  },
  {
    id: 12, date: '2026-05-22',
    title: 'India tops Asia in patent filings for 3rd consecutive year',
    summary: 'World Intellectual Property Organization report shows India filed 99,000+ patents in 2025, topping Asia for the third consecutive year and ranking 7th globally.',
    category: 'Economy', tags: ['Patent','Innovation','WIPO','IP'],
    examsRelevant: ['upsc','ssc_cgl','ibps_po'],
    importance: 'low', source: 'WIPO'
  },
]

export const DAILY_QUIZ_QUESTIONS = [
  {
    id: 'q1', text: 'Which organization launched NISAR satellite?',
    options: ['ISRO alone','NASA alone','ISRO and NASA jointly','ESA and ISRO'],
    correct: 2, explanation: 'NISAR (NASA-ISRO Synthetic Aperture Radar) is a joint mission between NASA and ISRO.',
    subject: 'Science & Technology', difficulty: 'medium'
  },
  {
    id: 'q2', text: 'What does CEPA stand for in trade agreements?',
    options: ['Common Economic Policy Act','Comprehensive Economic Partnership Agreement','Central Economic Partnership Authority','Cross-border Economic Protocol Act'],
    correct: 1, explanation: 'CEPA stands for Comprehensive Economic Partnership Agreement, a type of free trade agreement.',
    subject: 'Economy', difficulty: 'easy'
  },
  {
    id: 'q3', text: 'India\'s GDP growth rate for FY2025-26 was:',
    options: ['6.5%','7.2%','6.8%','7.8%'],
    correct: 1, explanation: 'NSO estimated India\'s GDP growth at 7.2% for FY2025-26, making it fastest growing major economy.',
    subject: 'Economy', difficulty: 'medium'
  },
  {
    id: 'q4', text: 'RBI raised repo rate to which percentage?',
    options: ['6.25%','6.50%','6.75%','7.00%'],
    correct: 2, explanation: 'RBI\'s MPC raised repo rate by 25 basis points to 6.75% amid inflation concerns.',
    subject: 'Banking', difficulty: 'easy'
  },
  {
    id: 'q5', text: 'India\'s total renewable energy installed capacity crossed:',
    options: ['150 GW','175 GW','200 GW','250 GW'],
    correct: 2, explanation: 'India\'s total renewable energy installed capacity crossed 200 GW, making it 3rd largest globally.',
    subject: 'Environment', difficulty: 'medium'
  },
]

export const NEWSPAPER_TOPICS = [
  {
    id: 'n1',
    date: '2026-05-26',
    title: 'The Hindu: Scaling the Space Frontier (India\'s Space Leadership)',
    summary: 'An editorial on India\'s rapid advancements in space science, highlighting the NISAR joint mission and Chandrayaan-4 sample return launch preparations. It details how ISRO is leading cost-effective space exploration globally.',
    source: 'The Hindu',
    paper: 'Editorial',
    examRelevance: 'UPSC GS-III (Science & Technology), State PSC Group-I',
    isPrideMoment: true,
    prideDetails: '🇮🇳 India stands proud as ISRO successfully pioneers low-cost lunar return missions, proving self-reliance and global technological leadership!'
  },
  {
    id: 'n2',
    date: '2026-05-26',
    title: 'Indian Express: The Digital Rupee Frontier (Fintech Dominance)',
    summary: 'Analysis of RBI\'s CBDC (Central Bank Digital Currency) e-Rupee crossing 1 million transactions daily. Explains the structural transition from physical currency to digital sovereignty and financial security improvements.',
    source: 'Indian Express',
    paper: 'Op-Ed',
    examRelevance: 'UPSC GS-III (Indian Economy), Bank PO Mains (Financial Awareness)',
    isPrideMoment: true,
    prideDetails: '🇮🇳 UPI and e-Rupee are revolutionizing worldwide digital transactions. Over 30 countries are now adopting India\'s indigenous digital payment stack!'
  },
  {
    id: 'n3',
    date: '2026-05-25',
    title: 'The Hindu: Reforming the Federal Balance (Inter-State Devolution)',
    summary: 'A detailed look at the 16th Finance Commission consultations with southern states regarding devolution of resources, fiscal autonomy, and local governance funding structures.',
    source: 'The Hindu',
    paper: 'Lead Article',
    examRelevance: 'UPSC GS-II (Polity & Federalism), APPSC/TGPSC Polity Paper',
    isPrideMoment: false
  },
  {
    id: 'n4',
    date: '2026-05-25',
    title: 'Indian Express: The Green Superpower (Renewable Milestones)',
    summary: 'Focuses on India surpassing Japan as the world\'s 3rd largest renewable energy producer with 200+ GW installed capacity, driven by solar parks in Rajasthan and Gujarat.',
    source: 'Indian Express',
    paper: 'Editorial',
    examRelevance: 'UPSC GS-III (Environment & Climate change), SSC CGL General Awareness',
    isPrideMoment: true,
    prideDetails: '🇮🇳 India is pacing ahead of global commitments, establishing the International Solar Alliance and leading the planet towards carbon neutrality!'
  }
]

export const MOCK_INTERVIEW_PREP = [
  {
    id: 'i1',
    topic: 'Why do you want to join the Civil Services?',
    category: 'Personality & Motivation',
    guidance: 'Avoid generic answers like "I want to do social service". Instead, highlight: 1. The unmatched scale of developmental impact a civil servant can bring. 2. Diverse career exposure across policy, administration, and ground-level crisis management. 3. Being a first-generation representative to inspire semi-urban/rural youths.',
    sampleAnswer: 'Sir, the civil services offer an unparalleled platform where my personal career growth aligns directly with the nation-building process. The diverse challenges, ranging from municipal management to public policy execution, allow me to utilize my skills at a scale where positive administrative action can transform thousands of rural lives instantly.'
  },
  {
    id: 'i2',
    topic: 'How would you handle a law-and-order crisis as an administrator?',
    category: 'Situational & Scenario',
    guidance: 'Structure your answer in 3 phases: 1. **Immediate Reaction**: Ensure personal safety, verify control room inputs, deploy emergency force (Section 144/SHE Teams/Constabulary), and isolate conflict areas. 2. **Mediation**: Call on local leaders, community elders, and pacify rumors via local media broadcasts. 3. **Long-Term**: Setup grievance cells, carry out impartial investigations, and restore trust.',
    sampleAnswer: 'My immediate priority would be to contain the conflict and secure public safety using tactical police deployment, while simultaneously engaging respected community leaders to halt rumors. Impartial administrative decisions and clear local communication are key to de-escalating ground tension.'
  },
  {
    id: 'i3',
    topic: 'Addressing Regional Development & Capital Bifurcation Issues (AP/TS)',
    category: 'State-Specific Prompts',
    guidance: 'For AP/Telangana candidates, remain completely neutral, balanced, and constructive. When asked about bifurcation issues: 1. Emphasize that bifurcation was a democratic process under the Reorganisation Act 2014. 2. Highlight the mutual potential: Hyderabad as a technology powerhouse, and AP as a maritime gateway with a 974 km coastline. 3. Focus on joint water management (Godavari-Krishna) and industrial corridors.',
    sampleAnswer: 'Bifurcation has created two high-potential economic hubs in South India. While Telangana leverages Hyderabad\'s global IT and biotech excellence, Andhra Pradesh has a robust coastal layout suited for blue economy growth and international shipping corridors. Collaborative administrative coordination on inter-state matters is the way forward for both Telugu states.'
  }
]
