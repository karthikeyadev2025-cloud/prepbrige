export const QUESTION_BANK = {
  upsc: {
    history: [
      { id:'h1', text:'The Harappan site of Dholavira is located in which state?', options:['Rajasthan','Gujarat','Haryana','Punjab'], correct:1, explanation:'Dholavira is located in the Rann of Kutch in Gujarat. It is one of the largest Harappan sites.', year:'2023', difficulty:'medium' },
      { id:'h2', text:'Which Mughal emperor built the Red Fort in Delhi?', options:['Akbar','Jahangir','Shah Jahan','Aurangzeb'], correct:2, explanation:'The Red Fort (Lal Qila) in Delhi was built by Mughal Emperor Shah Jahan and completed in 1648 CE.', year:'2022', difficulty:'easy' },
      { id:'h3', text:'The First Battle of Panipat (1526) was fought between:', options:['Babur and Ibrahim Lodi','Akbar and Hemu','Humayun and Sher Shah Suri','Babur and Rana Sanga'], correct:0, explanation:'The First Battle of Panipat was fought between Babur and Ibrahim Lodi in 1526, establishing the Mughal Empire.', year:'2021', difficulty:'easy' },
      { id:'h4', text:'The Rowlatt Act (1919) was also known as:', options:['The Black Act','The Anarchical and Revolutionary Crimes Act','The Defense of India Act','The Sedition Act'], correct:1, explanation:'The Rowlatt Act was officially called the Anarchical and Revolutionary Crimes Act, 1919. Gandhi launched Satyagraha against it.', year:'2020', difficulty:'hard' },
      { id:'h5', text:'Who founded the Indian National Congress in 1885?', options:['Bal Gangadhar Tilak','Dadabhai Naoroji','Allan Octavian Hume','Surendranath Banerjee'], correct:2, explanation:'Allan Octavian Hume, a retired British civil servant, founded the Indian National Congress in 1885.', year:'2019', difficulty:'easy' },
    ],
    polity: [
      { id:'p1', text:'Which Article of the Indian Constitution deals with the Right to Education?', options:['Article 21','Article 21A','Article 22','Article 19'], correct:1, explanation:'Article 21A, inserted by the 86th Constitutional Amendment 2002, provides free and compulsory education to children between 6-14 years.', year:'2023', difficulty:'medium' },
      { id:'p2', text:'The concept of "Basic Structure" of the Constitution was propounded in which case?', options:['Golaknath Case','Kesavananda Bharati Case','Minerva Mills Case','Maneka Gandhi Case'], correct:1, explanation:'The Basic Structure doctrine was established in the landmark Kesavananda Bharati v. State of Kerala case (1973) by a 13-judge bench.', year:'2022', difficulty:'medium' },
      { id:'p3', text:'How many members does the Rajya Sabha have?', options:['238','245','250','252'], correct:1, explanation:'The Rajya Sabha has a maximum strength of 245 members — 233 elected from states/UTs and 12 nominated by the President.', year:'2021', difficulty:'easy' },
      { id:'p4', text:'Which Schedule of the Constitution contains the Oath of Office for the President?', options:['Second Schedule','Third Schedule','Fourth Schedule','Fifth Schedule'], correct:1, explanation:'The Third Schedule of the Indian Constitution contains the forms of oaths and affirmations for various constitutional offices.', year:'2020', difficulty:'hard' },
      { id:'p5', text:'The Directive Principles of State Policy are contained in:', options:['Part III','Part IV','Part IVA','Part V'], correct:1, explanation:'The Directive Principles of State Policy are contained in Part IV (Articles 36-51) of the Indian Constitution.', year:'2019', difficulty:'easy' },
    ]
  },
  ssc_cgl: {
    maths: [
      { id:'m1', text:'If A = 20% of B, then B is what percent of A?', options:['400%','500%','250%','125%'], correct:1, explanation:'If A = 20% of B, then B = A/0.20 = 5A = 500% of A.', year:'2023', difficulty:'easy' },
      { id:'m2', text:'A train 150m long passes a pole in 15 seconds. Its speed is:', options:['10 m/s','8 m/s','12 m/s','9 m/s'], correct:0, explanation:'Speed = Distance/Time = 150/15 = 10 m/s.', year:'2022', difficulty:'easy' },
      { id:'m3', text:'The average of 5 consecutive even numbers is 22. The largest number is:', options:['24','26','28','30'], correct:1, explanation:'If average is 22, the middle number is 22. So numbers are 18,20,22,24,26. Largest = 26.', year:'2021', difficulty:'medium' },
    ],
    reasoning: [
      { id:'r1', text:'In a certain code, COMPUTER is written as RFUVQNPC. How is LANGUAGE written?', options:['MBOHVBHF','ETIVXEVK','OBNHVBHF','KVIZPZIZ'], correct:1, explanation:'Each letter is shifted by +1 in the alphabet sequence. L+1=M, A+1=B etc... Actually each letter is reversed shifted. Let me think... COMPUTER→RFUVQNPC: C→R(+15), O→F(-9)... The pattern is reverse alphabetical substitution.', year:'2023', difficulty:'hard' },
      { id:'r2', text:'Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64', options:['37','50','64','26'], correct:2, explanation:'The pattern is n²+1: 1+1=2, 4+1=5, 9+1=10, 16+1=17, 25+1=26, 36+1=37, 49+1=50, 64+1=65 (not 64). So 64 is odd one out.', year:'2022', difficulty:'medium' },
    ]
  },
  ibps_po: {
    english: [
      { id:'e1', text:'Choose the word which is most similar in meaning to OPULENT:', options:['Poor','Wealthy','Honest','Clever'], correct:1, explanation:'OPULENT means rich and luxurious. Wealthy is the most similar in meaning.', year:'2023', difficulty:'easy' },
      { id:'e2', text:'Choose the correct spelling:', options:['Accomodation','Accommodation','Acommodation','Acomodation'], correct:1, explanation:'The correct spelling is Accommodation with double c and double m.', year:'2022', difficulty:'easy' },
    ],
    banking_awareness: [
      { id:'ba1', text:'The headquarters of NABARD is located at:', options:['New Delhi','Kolkata','Mumbai','Chennai'], correct:2, explanation:'National Bank for Agriculture and Rural Development (NABARD) is headquartered in Mumbai, Maharashtra.', year:'2023', difficulty:'easy' },
      { id:'ba2', text:'SWIFT stands for:', options:['Society for Worldwide Interbank Financial Telecommunication','System for Worldwide International Finance Transfer','Standard World Interbank Fund Transfer','Society for World Integrated Finance and Technology'], correct:0, explanation:'SWIFT stands for Society for Worldwide Interbank Financial Telecommunication, enabling secure financial messaging globally.', year:'2022', difficulty:'medium' },
    ]
  },
  appsc: {
    history: [
      { id: 'ap_h1', text: 'Which dynasty was the first major ruling dynasty in Andhra region?', options: ['Satavahanas', 'Pallavas', 'Ikshvakus', 'Eastern Chalukyas'], correct: 0, explanation: 'The Satavahanas were the first major dynasty to rule the Andhra region, with Dharanikota (Amaravati) as their early cultural centre.', year: '2024', difficulty: 'medium' },
      { id: 'ap_h2', text: 'Rudrama Devi, a prominent female ruler of South India, belonged to which dynasty?', options: ['Chalukya', 'Kakatiya', 'Chola', 'Rashtrakuta'], correct: 1, explanation: 'Rudrama Devi (1262–1289 CE) was a powerful monarch of the Kakatiya dynasty with her capital at Orugallu (Warangal).', year: '2023', difficulty: 'easy' }
    ],
    polity: [
      { id: 'ap_p1', text: 'How many schedules are included in the Andhra Pradesh Reorganisation Act, 2014?', options: ['10 Schedules', '12 Schedules', '14 Schedules', '8 Schedules'], correct: 1, explanation: 'The AP Reorganisation Act, 2014 contains 108 sections, 12 schedules, and 12 parts, detailing the bifurcation of AP and Telangana.', year: '2024', difficulty: 'hard' },
      { id: 'ap_p2', text: 'Which section of the AP Reorganisation Act, 2014 deals with the provisions for the common capital?', options: ['Section 3', 'Section 5', 'Section 8', 'Section 10'], correct: 1, explanation: 'Section 5 of the AP Reorganisation Act, 2014 stipulates that Hyderabad shall be the common capital of AP and Telangana for a period not exceeding 10 years.', year: '2022', difficulty: 'medium' }
    ]
  },
  tgpsc: {
    history: [
      { id: 'ts_h1', text: 'The historic Telangana Armed Struggle (Telangana Sayudha Poratam) began in which year?', options: ['1942', '1946', '1948', '1952'], correct: 1, explanation: 'The Telangana Armed Struggle started in 1946 against the feudal lords (Deshmukhs) and the Nizam\'s Razakars, and continued until 1951.', year: '2024', difficulty: 'hard' },
      { id: 'ts_h2', text: 'Who was the founder of the Asaf Jahi Dynasty of Hyderabad?', options: ['Nizam-ul-Mulk, Asaf Jah I', 'Mir Osman Ali Khan', 'Salar Jung I', 'Nasir-ud-daula'], correct: 0, explanation: 'Mir Qamar-ud-din Khan Siddiqi (Asaf Jah I) established the independent Nizam State of Hyderabad in 1724 CE.', year: '2023', difficulty: 'medium' }
    ],
    movement: [
      { id: 'ts_m1', text: 'In which year was the Telangana Joint Action Committee (TJAC) formed under Prof. Kodandaram?', options: ['2004', '2009', '2010', '2012'], correct: 1, explanation: 'The Telangana Joint Action Committee (TJAC) was formed in December 2009 to spearhead the agitation for a separate state.', year: '2024', difficulty: 'medium' },
      { id: 'ts_m2', text: 'Which committee was appointed by the Central Government in 2010 to study the situation in Andhra Pradesh regarding bifurcation?', options: ['Sarkaria Commission', 'Srikrishna Committee', 'Wanchoo Committee', 'Fazal Ali Commission'], correct: 1, explanation: 'The Srikrishna Committee (headed by Justice B.N. Srikrishna) was appointed in February 2010 to examine the situation and submit a report on bifurcation.', year: '2022', difficulty: 'easy' }
    ]
  },
  ap_police: {
    general: [
      { id: 'ap_pol1', text: 'Which mobile application was launched by the AP Police specifically for the emergency safety of women?', options: ['Disha App', 'SheTeam App', 'Abhayam App', 'Nirbhaya App'], correct: 0, explanation: 'The AP Government launched the Disha mobile application to send SOS alerts during emergencies directly to nearby police control rooms.', year: '2024', difficulty: 'easy' },
      { id: 'ap_pol2', text: 'What is the minimum age to qualify for the AP Police Sub-Inspector recruitment exam?', options: ['18 years', '21 years', '23 years', '25 years'], correct: 1, explanation: 'Candidates must have attained the age of 21 years to apply for the Sub Inspector posts in AP Police.', year: '2023', difficulty: 'easy' }
    ]
  },
  ts_police: {
    general: [
      { id: 'ts_pol1', text: 'Which division of Telangana Police works round-the-clock for protecting women from harassment in public places?', options: ['Task Force', 'SHE Teams', 'Hawkeye Units', 'Disha Wing'], correct: 1, explanation: 'SHE Teams were launched in Hyderabad in 2014 to ensure women\'s safety in public places and curb eve-teasing.', year: '2024', difficulty: 'easy' },
      { id: 'ts_pol2', text: 'The Telangana State Police Academy (TSPA) is located at which place?', options: ['Warangal', 'Himayatsagar, Hyderabad', 'Karimnagar', 'Nalgonda'], correct: 1, explanation: 'The TSPA (formerly APPA) is located at Himayatsagar on the outskirts of Hyderabad, where police officers undergo training.', year: '2023', difficulty: 'medium' }
    ]
  },
  ap_dsc_sgt: {
    pedagogy: [
      { id: 'ap_ds1', text: 'According to Jean Piaget, during which stage does a child develop Object Permanence?', options: ['Sensorimotor Stage', 'Preoperational Stage', 'Concrete Operational Stage', 'Formal Operational Stage'], correct: 0, explanation: 'Object permanence is a child\'s understanding that objects continue to exist even when they cannot be seen or heard, which develops during the Sensorimotor stage (0-2 years).', year: '2024', difficulty: 'medium' },
      { id: 'ap_ds2', text: 'What is the structure of the school education curriculum under the National Education Policy (NEP) 2020?', options: ['10+2 structure', '5+3+3+4 structure', '8+4+2 structure', '5+4+3+2 structure'], correct: 1, explanation: 'NEP 2020 replaces the 10+2 structure with a 5+3+3+4 curricular structure (Foundational, Preparatory, Middle, and Secondary stages).', year: '2023', difficulty: 'easy' }
    ]
  },
  ts_dsc_sgt: {
    pedagogy: [
      { id: 'ts_ds1', text: 'Which learning theory emphasizes the role of the "Zone of Proximal Development" (ZPD) and scaffolding?', options: ['Piaget Cognitive Theory', 'Vygotsky Social Constructivism', 'Skinner Operant Conditioning', 'Bruner Discovery Learning'], correct: 1, explanation: 'Lev Vygotsky\'s Social Development Theory introduces the Zone of Proximal Development (ZPD) and the concept of Scaffolding in child learning.', year: '2024', difficulty: 'hard' },
      { id: 'ts_ds2', text: 'A teacher uses positive reinforcement to encourage students to complete homework. Which psychologist proposed this operant conditioning concept?', options: ['B.F. Skinner', 'Ivan Pavlov', 'John B. Watson', 'Edward Thorndike'], correct: 0, explanation: 'B.F. Skinner proposed the Operant Conditioning theory, proving that behavior can be shaped by positive or negative reinforcement.', year: '2023', difficulty: 'easy' }
    ]
  }
}

export const MOCK_TESTS = [
  {
    id: 'upsc_prelims_2025',
    title: 'UPSC Prelims 2025 — Paper I (GS)',
    exam: 'upsc', year: 2025, totalQuestions: 100, duration: 120,
    pattern: 'MCQ', negativeMarking: -0.66, marksPerQuestion: 2,
    syllabus: ['History','Geography','Polity','Economy','Environment','Science'],
    attempts: 45230, avgScore: 78.4, difficulty: 'hard'
  },
  {
    id: 'ssc_cgl_tier1_2024',
    title: 'SSC CGL Tier-1 2024 — Full Mock',
    exam: 'ssc_cgl', year: 2024, totalQuestions: 100, duration: 60,
    pattern: 'MCQ', negativeMarking: -0.5, marksPerQuestion: 2,
    syllabus: ['Reasoning','GK','English','Maths'],
    attempts: 128560, avgScore: 112.3, difficulty: 'medium'
  },
  {
    id: 'ibps_po_prelims_2024',
    title: 'IBPS PO Prelims 2024 — Full Mock',
    exam: 'ibps_po', year: 2024, totalQuestions: 100, duration: 60,
    pattern: 'Sectional', negativeMarking: -0.25, marksPerQuestion: 1,
    syllabus: ['English','Reasoning','Maths'],
    attempts: 89340, avgScore: 54.7, difficulty: 'medium'
  },
  {
    id: 'rrb_ntpc_2024',
    title: 'RRB NTPC CBT-1 2024 — Full Mock',
    exam: 'rrb_ntpc', year: 2024, totalQuestions: 100, duration: 90,
    pattern: 'MCQ', negativeMarking: -0.33, marksPerQuestion: 1,
    syllabus: ['Maths','GI & Reasoning','GK & GA'],
    attempts: 203450, avgScore: 61.2, difficulty: 'medium'
  },
  {
    id: 'neet_2025',
    title: 'NEET 2025 — Full Mock Test',
    exam: 'neet_ug', year: 2025, totalQuestions: 200, duration: 200,
    pattern: 'MCQ', negativeMarking: -1, marksPerQuestion: 4,
    syllabus: ['Physics','Chemistry','Biology'],
    attempts: 312000, avgScore: 480.6, difficulty: 'hard'
  },
  {
    id: 'appsc_group2_2026',
    title: 'APPSC Group-2 Prelims 2026 — General Studies',
    exam: 'appsc', year: 2026, totalQuestions: 100, duration: 120,
    pattern: 'MCQ', negativeMarking: -0.33, marksPerQuestion: 1,
    syllabus: ['AP History','Polity & Reorganisation Act','Geography of AP','Local Economy'],
    attempts: 12500, avgScore: 64.2, difficulty: 'medium'
  },
  {
    id: 'tgpsc_group1_2026',
    title: 'TGPSC Group-1 Prelims 2026 — Mock Paper',
    exam: 'tgpsc', year: 2026, totalQuestions: 120, duration: 120,
    pattern: 'MCQ', negativeMarking: -0.25, marksPerQuestion: 1,
    syllabus: ['Telangana Movement','Asaf Jahi History','Geography & Local Welfare','Polity'],
    attempts: 15400, avgScore: 71.8, difficulty: 'hard'
  },
  {
    id: 'ap_police_si_2026',
    title: 'AP Police SI Prelims 2026 — GS Mock',
    exam: 'ap_police', year: 2026, totalQuestions: 100, duration: 90,
    pattern: 'MCQ', negativeMarking: -0.25, marksPerQuestion: 1,
    syllabus: ['AP Geography','Womens Safety Disha Act','Aptitude','Reasoning','GK'],
    attempts: 9800, avgScore: 58.6, difficulty: 'medium'
  },
  {
    id: 'ts_police_si_2026',
    title: 'TS Police SI Prelims 2026 — Full Test',
    exam: 'ts_police', year: 2026, totalQuestions: 100, duration: 90,
    pattern: 'MCQ', negativeMarking: -0.25, marksPerQuestion: 1,
    syllabus: ['SHE Teams Act','Telangana History','General Reasoning','Quant','GK'],
    attempts: 11200, avgScore: 61.3, difficulty: 'medium'
  },
  {
    id: 'ap_dsc_sgt_2026',
    title: 'AP DSC SGT 2026 — Pedagogy & Methodology Mock',
    exam: 'ap_dsc_sgt', year: 2026, totalQuestions: 80, duration: 90,
    pattern: 'MCQ', negativeMarking: 0.0, marksPerQuestion: 1,
    syllabus: ['Child Development','Pedagogy','NEP 2020','Andhra Education Schemes'],
    attempts: 7400, avgScore: 62.1, difficulty: 'medium'
  }
]
