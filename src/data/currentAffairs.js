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
