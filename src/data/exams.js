export const EXAM_CATEGORIES = [
  {
    id: 'upsc', label: 'UPSC Civil Services', icon: '🏛️', color: '#7c3aed',
    exams: [
      { id: 'ias', name: 'IAS (Civil Services)', fullName: 'Indian Administrative Service', vacancies: 1105, nextDate: '2026-06-01', level: 'central' },
      { id: 'ips', name: 'IPS', fullName: 'Indian Police Service', vacancies: 200, nextDate: '2026-06-01', level: 'central' },
      { id: 'ifs_forest', name: 'IFS (Forest)', fullName: 'Indian Forest Service', vacancies: 150, nextDate: '2026-07-15', level: 'central' },
      { id: 'capf', name: 'CAPF AC', fullName: 'Central Armed Police Forces', vacancies: 322, nextDate: '2026-08-10', level: 'central' },
      { id: 'cds', name: 'CDS', fullName: 'Combined Defence Services', vacancies: 459, nextDate: '2026-04-13', level: 'central' },
      { id: 'nda', name: 'NDA/NA', fullName: 'National Defence Academy', vacancies: 395, nextDate: '2026-04-13', level: 'central' },
    ]
  },
  {
    id: 'ssc', label: 'SSC Exams', icon: '📋', color: '#0080ff',
    exams: [
      { id: 'ssc_cgl', name: 'SSC CGL', fullName: 'Combined Graduate Level', vacancies: 17727, nextDate: '2026-09-01', level: 'central' },
      { id: 'ssc_chsl', name: 'SSC CHSL', fullName: 'Combined Higher Secondary Level', vacancies: 3712, nextDate: '2026-07-01', level: 'central' },
      { id: 'ssc_mts', name: 'SSC MTS', fullName: 'Multi Tasking Staff', vacancies: 8326, nextDate: '2026-10-01', level: 'central' },
      { id: 'ssc_cpo', name: 'SSC CPO', fullName: 'Central Police Organisation', vacancies: 4187, nextDate: '2026-06-15', level: 'central' },
      { id: 'ssc_gd', name: 'SSC GD Constable', fullName: 'General Duty Constable', vacancies: 26146, nextDate: '2026-02-04', level: 'central' },
      { id: 'ssc_je', name: 'SSC JE', fullName: 'Junior Engineer', vacancies: 968, nextDate: '2026-11-01', level: 'central' },
    ]
  },
  {
    id: 'banking', label: 'Banking', icon: '🏦', color: '#059669',
    exams: [
      { id: 'ibps_po', name: 'IBPS PO', fullName: 'Probationary Officer', vacancies: 4455, nextDate: '2026-10-01', level: 'central' },
      { id: 'ibps_clerk', name: 'IBPS Clerk', fullName: 'Clerical Cadre', vacancies: 6128, nextDate: '2026-08-01', level: 'central' },
      { id: 'sbi_po', name: 'SBI PO', fullName: 'SBI Probationary Officer', vacancies: 2000, nextDate: '2026-12-01', level: 'central' },
      { id: 'sbi_clerk', name: 'SBI Clerk', fullName: 'SBI Junior Associates', vacancies: 8283, nextDate: '2026-11-01', level: 'central' },
      { id: 'rbi_grade_b', name: 'RBI Grade B', fullName: 'Reserve Bank of India Officer', vacancies: 291, nextDate: '2026-05-31', level: 'central' },
      { id: 'nabard', name: 'NABARD Grade A', fullName: 'National Bank Agriculture', vacancies: 150, nextDate: '2026-09-01', level: 'central' },
      { id: 'ibps_so', name: 'IBPS SO', fullName: 'Specialist Officer', vacancies: 1027, nextDate: '2026-11-01', level: 'central' },
      { id: 'rrb_po', name: 'RRB PO', fullName: 'Regional Rural Banks PO', vacancies: 8000, nextDate: '2026-08-01', level: 'central' },
    ]
  },
  {
    id: 'railway', label: 'Railways', icon: '🚂', color: '#dc2626',
    exams: [
      { id: 'rrb_ntpc', name: 'RRB NTPC', fullName: 'Non-Technical Popular Categories', vacancies: 11558, nextDate: '2026-05-01', level: 'central' },
      { id: 'rrb_group_d', name: 'RRB Group D', fullName: 'Level 1 Posts', vacancies: 32438, nextDate: '2026-09-01', level: 'central' },
      { id: 'rrb_alp', name: 'RRB ALP', fullName: 'Assistant Loco Pilot', vacancies: 18799, nextDate: '2026-11-01', level: 'central' },
      { id: 'rrb_je', name: 'RRB JE', fullName: 'Junior Engineer', vacancies: 7951, nextDate: '2026-07-01', level: 'central' },
    ]
  },
  {
    id: 'teaching', label: 'Teaching', icon: '📖', color: '#d97706',
    exams: [
      { id: 'ctet', name: 'CTET', fullName: 'Central Teacher Eligibility Test', vacancies: null, nextDate: '2026-07-01', level: 'central' },
      { id: 'kvs', name: 'KVS TGT/PGT', fullName: 'Kendriya Vidyalaya Sangathan', vacancies: 6414, nextDate: '2026-08-01', level: 'central' },
      { id: 'nvs', name: 'NVS TGT/PGT', fullName: 'Navodaya Vidyalaya Samiti', vacancies: 1377, nextDate: '2026-10-01', level: 'central' },
      { id: 'dsssb', name: 'DSSSB TGT/PGT', fullName: 'Delhi Sub Ord Services Selection Board', vacancies: 7236, nextDate: '2026-06-01', level: 'state' },
    ]
  },
  {
    id: 'defence', label: 'Defence', icon: '⚔️', color: '#7c3aed',
    exams: [
      { id: 'afcat', name: 'AFCAT', fullName: 'Air Force Common Admission Test', vacancies: 304, nextDate: '2026-08-01', level: 'central' },
      { id: 'coast_guard', name: 'Coast Guard', fullName: 'Indian Coast Guard', vacancies: 350, nextDate: '2026-06-01', level: 'central' },
      { id: 'territorial_army', name: 'Territorial Army', fullName: 'Territorial Army Officer', vacancies: null, nextDate: '2026-07-01', level: 'central' },
    ]
  },
  {
    id: 'state_psc', label: 'State PSC', icon: '🗺️', color: '#0891b2',
    exams: [
      { id: 'bpsc', name: 'BPSC', fullName: 'Bihar Public Service Commission', vacancies: 1929, nextDate: '2026-07-01', level: 'state', state: 'Bihar' },
      { id: 'uppsc', name: 'UPPSC', fullName: 'UP Public Service Commission', vacancies: 220, nextDate: '2026-06-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'mppsc', name: 'MPPSC', fullName: 'MP Public Service Commission', vacancies: 202, nextDate: '2026-05-01', level: 'state', state: 'Madhya Pradesh' },
      { id: 'rpsc', name: 'RPSC RAS', fullName: 'Rajasthan Admin Service', vacancies: 905, nextDate: '2026-08-01', level: 'state', state: 'Rajasthan' },
      { id: 'tnpsc', name: 'TNPSC Group 2', fullName: 'Tamil Nadu PSC', vacancies: 1071, nextDate: '2026-05-01', level: 'state', state: 'Tamil Nadu' },
      { id: 'kpsc', name: 'KPSC KAS', fullName: 'Karnataka Admin Service', vacancies: 92, nextDate: '2026-09-01', level: 'state', state: 'Karnataka' },
      { id: 'wbpsc', name: 'WBPSC WBCS', fullName: 'West Bengal Civil Service', vacancies: 429, nextDate: '2026-07-01', level: 'state', state: 'West Bengal' },
      { id: 'apsc', name: 'APSC', fullName: 'Assam Public Service Commission', vacancies: 138, nextDate: '2026-08-01', level: 'state', state: 'Assam' },
      { id: 'gpsc', name: 'GPSC', fullName: 'Gujarat Public Service Commission', vacancies: 320, nextDate: '2026-06-01', level: 'state', state: 'Gujarat' },
      { id: 'mpsc', name: 'MPSC Rajyaseva', fullName: 'Maharashtra PSC', vacancies: 800, nextDate: '2026-08-01', level: 'state', state: 'Maharashtra' },
      { id: 'hpsc', name: 'HPSC HCS', fullName: 'Haryana Civil Service', vacancies: 156, nextDate: '2026-09-01', level: 'state', state: 'Haryana' },
      { id: 'ppsc', name: 'PPSC PCS', fullName: 'Punjab PSC', vacancies: 235, nextDate: '2026-10-01', level: 'state', state: 'Punjab' },
      { id: 'opsc', name: 'OPSC OAS', fullName: 'Odisha Admin Service', vacancies: 218, nextDate: '2026-06-01', level: 'state', state: 'Odisha' },
      { id: 'cgpsc', name: 'CGPSC', fullName: 'Chhattisgarh PSC', vacancies: 170, nextDate: '2026-07-01', level: 'state', state: 'Chhattisgarh' },
    ]
  },
  {
    id: 'insurance', label: 'Insurance', icon: '🛡️', color: '#7c3aed',
    exams: [
      { id: 'lic_aao', name: 'LIC AAO', fullName: 'LIC Assistant Administrative Officer', vacancies: 300, nextDate: '2026-05-01', level: 'central' },
      { id: 'niacl_ao', name: 'NIACL AO', fullName: 'New India Assurance', vacancies: 300, nextDate: '2026-09-01', level: 'central' },
      { id: 'uiic_ao', name: 'UIIC AO', fullName: 'United India Insurance', vacancies: 250, nextDate: '2026-08-01', level: 'central' },
    ]
  },
  {
    id: 'medical', label: 'Medical', icon: '⚕️', color: '#dc2626',
    exams: [
      { id: 'neet_ug', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test UG', vacancies: null, nextDate: '2026-05-04', level: 'central' },
      { id: 'neet_pg', name: 'NEET PG', fullName: 'NEET Postgraduate', vacancies: null, nextDate: '2026-06-15', level: 'central' },
      { id: 'aiims_pgi', name: 'AIIMS PG', fullName: 'All India Institute of Medical Sciences PG', vacancies: null, nextDate: '2026-05-01', level: 'central' },
    ]
  },
  {
    id: 'engineering', label: 'Engineering', icon: '⚙️', color: '#0080ff',
    exams: [
      { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', vacancies: null, nextDate: '2027-02-01', level: 'central' },
      { id: 'jee_main', name: 'JEE Mains', fullName: 'Joint Entrance Exam Mains', vacancies: null, nextDate: '2027-01-01', level: 'central' },
      { id: 'jee_adv', name: 'JEE Advanced', fullName: 'Joint Entrance Exam Advanced', vacancies: null, nextDate: '2026-05-18', level: 'central' },
      { id: 'ese', name: 'ESE/IES', fullName: 'Engineering Services Exam', vacancies: 247, nextDate: '2026-06-08', level: 'central' },
    ]
  },
  {
    id: 'police', label: 'State Police', icon: '👮', color: '#1d4ed8',
    exams: [
      { id: 'up_police', name: 'UP Police SI', fullName: 'UP Police Sub Inspector', vacancies: 3638, nextDate: '2026-06-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'rajasthan_police', name: 'Rajasthan Police', fullName: 'Rajasthan Police Constable', vacancies: 3578, nextDate: '2026-07-01', level: 'state', state: 'Rajasthan' },
      { id: 'mp_police', name: 'MP Police Constable', fullName: 'MP Police', vacancies: 7090, nextDate: '2026-08-01', level: 'state', state: 'Madhya Pradesh' },
      { id: 'bihar_police', name: 'Bihar Police', fullName: 'Bihar Police Constable', vacancies: 21391, nextDate: '2026-05-01', level: 'state', state: 'Bihar' },
    ]
  },
]

export const ALL_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi (UT)','Chandigarh (UT)','Puducherry (UT)','Jammu & Kashmir (UT)',
  'Ladakh (UT)','Lakshadweep (UT)','Dadra & Nagar Haveli (UT)','Andaman & Nicobar (UT)'
]

export const ALL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🪷' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🌺' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🌸' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🌼' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '☽' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🦁' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🐘' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🌴' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🎭' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🦏' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', flag: '🪷' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', flag: '🌊' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '⛰️' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', flag: '🏜️' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर', flag: '❄️' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', flag: '🏔️' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', flag: '💐' },
  { code: 'bo', name: 'Bodo', native: 'बड़ो', flag: '🌿' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🌲' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '📿' },
]

export const SUBJECTS = {
  general: [
    { id: 'gk', name: 'General Knowledge', icon: '🌍' },
    { id: 'ga', name: 'General Awareness', icon: '📰' },
    { id: 'current_affairs', name: 'Current Affairs', icon: '📡' },
    { id: 'reasoning', name: 'Reasoning', icon: '🧠' },
    { id: 'english', name: 'English', icon: '📝' },
    { id: 'hindi', name: 'Hindi', icon: '🔤' },
    { id: 'maths', name: 'Quantitative Aptitude', icon: '🔢' },
    { id: 'computer', name: 'Computer Knowledge', icon: '💻' },
  ],
  upsc: [
    { id: 'history', name: 'History', icon: '📜' },
    { id: 'geography', name: 'Geography', icon: '🗺️' },
    { id: 'polity', name: 'Indian Polity', icon: '⚖️' },
    { id: 'economy', name: 'Indian Economy', icon: '📊' },
    { id: 'environment', name: 'Environment & Ecology', icon: '🌿' },
    { id: 'science_tech', name: 'Science & Technology', icon: '🔬' },
    { id: 'ethics', name: 'Ethics & Integrity', icon: '🕊️' },
    { id: 'essay', name: 'Essay Writing', icon: '✍️' },
  ]
}
