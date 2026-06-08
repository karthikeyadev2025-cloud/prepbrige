export const EXAM_CATEGORIES = [
  {
    id: 'upsc', label: 'UPSC Civil Services', icon: '🏛️', color: '#7c3aed', type: 'govt',
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
    id: 'ssc', label: 'SSC Exams', icon: '📋', color: '#0080ff', type: 'govt',
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
    id: 'banking', label: 'Banking', icon: '🏦', color: '#059669', type: 'govt',
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
    id: 'railway', label: 'Railways', icon: '🚂', color: '#dc2626', type: 'govt',
    exams: [
      { id: 'rrb_ntpc', name: 'RRB NTPC', fullName: 'Non-Technical Popular Categories', vacancies: 11558, nextDate: '2026-05-01', level: 'central' },
      { id: 'rrb_group_d', name: 'RRB Group D', fullName: 'Level 1 Posts', vacancies: 32438, nextDate: '2026-09-01', level: 'central' },
      { id: 'rrb_alp', name: 'RRB ALP', fullName: 'Assistant Loco Pilot', vacancies: 18799, nextDate: '2026-11-01', level: 'central' },
      { id: 'rrb_je', name: 'RRB JE', fullName: 'Junior Engineer', vacancies: 7951, nextDate: '2026-07-01', level: 'central' },
    ]
  },
  {
    id: 'teaching', label: 'Teaching', icon: '📖', color: '#d97706', type: 'govt',
    exams: [
      { id: 'ctet', name: 'CTET', fullName: 'Central Teacher Eligibility Test', vacancies: 35000, nextDate: '2026-07-01', level: 'central' },
      { id: 'kvs', name: 'KVS TGT/PGT', fullName: 'Kendriya Vidyalaya Sangathan', vacancies: 6414, nextDate: '2026-08-01', level: 'central' },
      { id: 'nvs', name: 'NVS TGT/PGT', fullName: 'Navodaya Vidyalaya Samiti', vacancies: 1377, nextDate: '2026-10-01', level: 'central' },
      { id: 'dsssb', name: 'DSSSB TGT/PGT', fullName: 'Delhi Sub Ord Services Selection Board', vacancies: 7236, nextDate: '2026-06-01', level: 'state' },
      { id: 'ap_dsc_sgt', name: 'AP DSC SGT', fullName: 'Andhra Pradesh DSC Secondary Grade Teacher', vacancies: 3820, nextDate: '2026-09-10', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ap_dsc_sa', name: 'AP DSC SA', fullName: 'Andhra Pradesh DSC School Assistant', vacancies: 2200, nextDate: '2026-09-12', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_dsc_sgt', name: 'TS DSC SGT', fullName: 'Telangana DSC Secondary Grade Teacher', vacancies: 4100, nextDate: '2026-08-25', level: 'state', state: 'Telangana' },
      { id: 'ts_dsc_sa', name: 'TS DSC SA', fullName: 'Telangana DSC School Assistant', vacancies: 2800, nextDate: '2026-08-27', level: 'state', state: 'Telangana' },
    ]
  },
  {
    id: 'defence', label: 'Defence', icon: '⚔️', color: '#7c3aed', type: 'govt',
    exams: [
      { id: 'afcat', name: 'AFCAT', fullName: 'Air Force Common Admission Test', vacancies: 304, nextDate: '2026-08-01', level: 'central' },
      { id: 'coast_guard', name: 'Coast Guard', fullName: 'Indian Coast Guard', vacancies: 350, nextDate: '2026-06-01', level: 'central' },
      { id: 'territorial_army', name: 'Territorial Army', fullName: 'Territorial Army Officer', vacancies: 180, nextDate: '2026-07-01', level: 'central' },
    ]
  },
  {
    id: 'state_psc', label: 'State PSC', icon: '🗺️', color: '#0891b2', type: 'govt',
    exams: [
      { id: 'appsc', name: 'APPSC', fullName: 'Andhra Pradesh Public Service Commission', vacancies: 950, nextDate: '2026-10-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'tgpsc', name: 'TGPSC', fullName: 'Telangana Public Service Commission', vacancies: 1200, nextDate: '2026-09-20', level: 'state', state: 'Telangana' },
      { id: 'keralapsc', name: 'Kerala PSC', fullName: 'Kerala Public Service Commission', vacancies: 850, nextDate: '2026-11-05', level: 'state', state: 'Kerala' },
      { id: 'hppsc', name: 'HPPSC', fullName: 'Himachal Pradesh Public Service Commission', vacancies: 180, nextDate: '2026-10-08', level: 'state', state: 'Himachal Pradesh' },
      { id: 'bpsc', name: 'BPSC', fullName: 'Bihar Public Service Commission', vacancies: 1929, nextDate: '2026-07-01', level: 'state', state: 'Bihar' },
      { id: 'uppsc', name: 'UPPSC', fullName: 'UP Public Service Commission', vacancies: 220, nextDate: '2026-06-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'mppsc', name: 'MPPSC', fullName: 'MP Public Service Commission', vacancies: 202, nextDate: '2026-05-01', level: 'state', state: 'Madhya Pradesh' },
      { id: 'rpsc', name: 'RPSC RAS', fullName: 'Rajasthan Admin Service', vacancies: 905, nextDate: '2026-08-01', level: 'state', state: 'Rajasthan' },
      { id: 'tnpsc', name: 'TNPSC Group 2', fullName: 'Tamil Nadu PSC', vacancies: 1071, nextDate: '2026-05-01', level: 'state', state: 'Tamil Nadu' },
      { id: 'kpsc', name: 'KPSC KAS', fullName: 'Karnataka Admin Service', vacancies: 92, nextDate: '2026-09-01', level: 'state', state: 'Karnataka' },
      { id: 'wbpsc', name: 'WBPSC WBCS', fullName: 'West Bengal Civil Service', vacancies: 429, nextDate: '2026-07-01', level: 'state', state: 'West Bengal' },
    ]
  },
  {
    id: 'police', label: 'State Police', icon: '👮', color: '#1d4ed8', type: 'govt',
    exams: [
      { id: 'ap_police', name: 'AP Police SI/Constable', fullName: 'Andhra Pradesh Police SI & Constable', vacancies: 6500, nextDate: '2026-07-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_police', name: 'TS Police SI/Constable', fullName: 'Telangana Police SI & Constable', vacancies: 8000, nextDate: '2026-08-10', level: 'state', state: 'Telangana' },
      { id: 'up_police', name: 'UP Police SI', fullName: 'UP Police Sub Inspector', vacancies: 3638, nextDate: '2026-06-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'rajasthan_police', name: 'Rajasthan Police', fullName: 'Rajasthan Police Constable', vacancies: 3578, nextDate: '2026-07-01', level: 'state', state: 'Rajasthan' },
      { id: 'bihar_police', name: 'Bihar Police', fullName: 'Bihar Police Constable', vacancies: 21391, nextDate: '2026-05-01', level: 'state', state: 'Bihar' },
    ]
  },
  {
    id: 'state_psc_group2', label: 'AP/TS Group Exams', icon: '🏢', color: '#0284c7', type: 'govt',
    exams: [
      { id: 'appsc_group1', name: 'APPSC Group 1', fullName: 'APPSC Group 1 DSP/RTO/Dy Collector', vacancies: 503, nextDate: '2026-11-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'appsc_group2', name: 'APPSC Group 2', fullName: 'APPSC Group 2 Junior Assistant/Steno', vacancies: 830, nextDate: '2026-09-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'tgpsc_group1', name: 'TGPSC Group 1', fullName: 'TGPSC Group 1 Deputy Collector', vacancies: 563, nextDate: '2026-10-01', level: 'state', state: 'Telangana' },
      { id: 'tgpsc_group2', name: 'TGPSC Group 2', fullName: 'TGPSC Group 2 Junior Assistant', vacancies: 900, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
    ]
  },
  {
    id: 'mbbs_entrance', label: 'MBBS/Medical Entrance', icon: '⚕️', color: '#dc2626', type: 'entrance',
    exams: [
      { id: 'neet_ug', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test UG (MBBS Seats)', vacancies: 108940, nextDate: '2026-05-04', level: 'central' },
      { id: 'neet_pg', name: 'NEET PG', fullName: 'NEET Postgraduate (MD/MS Seats)', vacancies: 45000, nextDate: '2026-06-15', level: 'central' },
      { id: 'aiims_pgi', name: 'AIIMS PG', fullName: 'All India Institute of Medical Sciences PG', vacancies: 1200, nextDate: '2026-05-01', level: 'central' },
      { id: 'jipmer', name: 'JIPMER Entrance', fullName: 'Jawaharlal Institute of Postgraduate Medical Education', vacancies: 200, nextDate: '2026-06-05', level: 'central' }
    ]
  },
  {
    id: 'law_entrance', label: 'Law Entrance', icon: '⚖️', color: '#7c3aed', type: 'entrance',
    exams: [
      { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', vacancies: 4500, nextDate: '2026-12-01', level: 'central' },
      { id: 'ailet', name: 'AILET', fullName: 'All India Law Entrance Test', vacancies: 180, nextDate: '2026-12-15', level: 'central' },
      { id: 'lsat_india', name: 'LSAT India', fullName: 'Law School Admission Test India', vacancies: 999, nextDate: '2026-05-20', level: 'central' },
      { id: 'ap_lawcet', name: 'AP LAWCET', fullName: 'Andhra Pradesh Law Common Entrance Test', vacancies: 2500, nextDate: '2026-06-10', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_lawcet', name: 'TS LAWCET', fullName: 'Telangana Law Common Entrance Test', vacancies: 2200, nextDate: '2026-06-12', level: 'state', state: 'Telangana' },
    ]
  },
  {
    id: 'engineering', label: 'Engineering Entrance', icon: '⚙️', color: '#0080ff', type: 'entrance',
    exams: [
      { id: 'jee_main', name: 'JEE Mains', fullName: 'Joint Entrance Exam Mains (NIT/IIIT Seats)', vacancies: 57152, nextDate: '2027-01-01', level: 'central' },
      { id: 'jee_adv', name: 'JEE Advanced', fullName: 'Joint Entrance Exam Advanced (IIT Seats)', vacancies: 17385, nextDate: '2026-05-18', level: 'central' },
      { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', vacancies: 55000, nextDate: '2027-02-01', level: 'central' },
    ]
  },
  {
    id: 'state_entrance', label: 'State Entrance Tests', icon: '🎓', color: '#0891b2', type: 'entrance',
    exams: [
      { id: 'ap_eapcet', name: 'AP EAPCET', fullName: 'AP Engineering Agriculture Pharmacy Common Entrance Test', vacancies: 120000, nextDate: '2026-05-18', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_eamcet', name: 'TS EAMCET', fullName: 'TS Engineering Agricultural and Medical Common Entrance Test', vacancies: 95000, nextDate: '2026-05-12', level: 'state', state: 'Telangana' },
      { id: 'kcet', name: 'KCET', fullName: 'Karnataka Common Entrance Test', vacancies: 85000, nextDate: '2026-04-18', level: 'state', state: 'Karnataka' },
      { id: 'wbjee', name: 'WBJEE', fullName: 'West Bengal Joint Entrance Examination', vacancies: 40000, nextDate: '2026-04-28', level: 'state', state: 'West Bengal' },
      { id: 'mht_cet', name: 'MHT CET', fullName: 'Maharashtra Common Entrance Test', vacancies: 150000, nextDate: '2026-05-22', level: 'state', state: 'Maharashtra' },
      { id: 'tnea', name: 'TNEA Counseling', fullName: 'Tamil Nadu Engineering Admissions', vacancies: 200000, nextDate: '2026-06-20', level: 'state', state: 'Tamil Nadu' },
    ]
  },
  {
    id: 'board_exams', label: 'Board Exams', icon: '📚', color: '#16a34a', type: 'entrance',
    exams: [
      { id: 'cbse_10', name: 'CBSE Class 10', fullName: 'Central Board Secondary Education Class X', vacancies: 2200000, nextDate: '2027-03-01', level: 'central' },
      { id: 'cbse_12', name: 'CBSE Class 12', fullName: 'Central Board Secondary Education Class XII', vacancies: 1600000, nextDate: '2027-02-15', level: 'central' },
      { id: 'ap_ssc', name: 'AP SSC (Class 10)', fullName: 'Andhra Pradesh Board Class 10', vacancies: 600000, nextDate: '2027-03-20', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_ssc', name: 'TS SSC (Class 10)', fullName: 'Telangana Board Class 10', vacancies: 520000, nextDate: '2027-03-22', level: 'state', state: 'Telangana' },
    ]
  }
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
  { code: 'ml', name: 'Malayalam', native: 'മലയാളం', flag: '🌴' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🐚' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🌿' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', flag: '🥭' },
  { code: 'sat', name: 'Santali', native: 'संताली', flag: '🏹' },
  { code: 'ks', name: 'Kashmiri', native: 'कश्मीरी', flag: '🏔️' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🕉️' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', flag: '🏔️' },
  { code: 'sd', name: 'Sindhi', native: 'सिंधी', flag: '🕌' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', flag: '🏖️' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', flag: '🦌' },
  { code: 'mni', name: 'Manipuri', native: 'मइतैलोन', flag: '🛶' }
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
  ],
  state_psc: [
    { id: 'ap_history', name: 'AP History & Culture', icon: '🏛️' },
    { id: 'ts_history', name: 'Telangana History & Movement', icon: '✊' },
    { id: 'ap_geography', name: 'AP Geography', icon: '🗺️' },
    { id: 'ts_geography', name: 'Telangana Geography', icon: '🏔️' },
    { id: 'bifurcation', name: 'AP Reorganisation Act 2014', icon: '📜' },
  ],
  police: [
    { id: 'crpc_ipc', name: 'Basic Laws & Women Safety', icon: '⚖️' },
    { id: 'aptitude', name: 'Arithmetic & Numerical Ability', icon: '🔢' },
    { id: 'reasoning', name: 'Reasoning & Mental Ability', icon: '🧠' },
    { id: 'general_gk', name: 'GK & General Sciences', icon: '🌍' }
  ],
  teaching: [
    { id: 'child_psychology', name: 'Educational Psychology', icon: '👶' },
    { id: 'pedagogy', name: 'Methods & Pedagogy', icon: '📖' },
    { id: 'school_content', name: 'School Content (Class 1-10)', icon: '🏫' },
  ]
}
