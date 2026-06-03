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
    id: 'defence', label: 'Defence', icon: '⚔️', color: '#7c3aed',
    exams: [
      { id: 'afcat', name: 'AFCAT', fullName: 'Air Force Common Admission Test', vacancies: 304, nextDate: '2026-08-01', level: 'central' },
      { id: 'coast_guard', name: 'Coast Guard', fullName: 'Indian Coast Guard', vacancies: 350, nextDate: '2026-06-01', level: 'central' },
      { id: 'territorial_army', name: 'Territorial Army', fullName: 'Territorial Army Officer', vacancies: 180, nextDate: '2026-07-01', level: 'central' },
    ]
  },
  {
    id: 'state_psc', label: 'State PSC', icon: '🗺️', color: '#0891b2',
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
      { id: 'neet_ug', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test UG (MBBS Seats)', vacancies: 108940, nextDate: '2026-05-04', level: 'central' },
      { id: 'neet_pg', name: 'NEET PG', fullName: 'NEET Postgraduate (MD/MS Seats)', vacancies: 45000, nextDate: '2026-06-15', level: 'central' },
      { id: 'aiims_pgi', name: 'AIIMS PG', fullName: 'All India Institute of Medical Sciences PG', vacancies: 1200, nextDate: '2026-05-01', level: 'central' },
    ]
  },
  {
    id: 'engineering', label: 'Engineering', icon: '⚙️', color: '#0080ff',
    exams: [
      { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering (M.Tech/PSUs)', vacancies: 55000, nextDate: '2027-02-01', level: 'central' },
      { id: 'jee_main', name: 'JEE Mains', fullName: 'Joint Entrance Exam Mains (NIT/IIIT Seats)', vacancies: 57152, nextDate: '2027-01-01', level: 'central' },
      { id: 'jee_adv', name: 'JEE Advanced', fullName: 'Joint Entrance Exam Advanced (IIT Seats)', vacancies: 17385, nextDate: '2026-05-18', level: 'central' },
      { id: 'ese', name: 'ESE/IES', fullName: 'Engineering Services Exam', vacancies: 247, nextDate: '2026-06-08', level: 'central' },
    ]
  },
  {
    id: 'police', label: 'State Police', icon: '👮', color: '#1d4ed8',
    exams: [
      { id: 'ap_police', name: 'AP Police SI/Constable', fullName: 'Andhra Pradesh Police SI & Constable', vacancies: 6500, nextDate: '2026-07-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_police', name: 'TS Police SI/Constable', fullName: 'Telangana Police SI & Constable', vacancies: 8000, nextDate: '2026-08-10', level: 'state', state: 'Telangana' },
      { id: 'up_police', name: 'UP Police SI', fullName: 'UP Police Sub Inspector', vacancies: 3638, nextDate: '2026-06-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'rajasthan_police', name: 'Rajasthan Police', fullName: 'Rajasthan Police Constable', vacancies: 3578, nextDate: '2026-07-01', level: 'state', state: 'Rajasthan' },
      { id: 'mp_police', name: 'MP Police Constable', fullName: 'MP Police', vacancies: 7090, nextDate: '2026-08-01', level: 'state', state: 'Madhya Pradesh' },
      { id: 'bihar_police', name: 'Bihar Police', fullName: 'Bihar Police Constable', vacancies: 21391, nextDate: '2026-05-01', level: 'state', state: 'Bihar' },
      { id: 'ts_si', name: 'TS Police SI', fullName: 'Telangana Sub-Inspector of Police', vacancies: 1400, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
      { id: 'karnataka_police', name: 'Karnataka PSI', fullName: 'Karnataka Police Sub-Inspector', vacancies: 545, nextDate: '2026-07-01', level: 'state', state: 'Karnataka' },
      { id: 'tn_police', name: 'TN Police Constable', fullName: 'Tamil Nadu Uniformed Services Recruitment', vacancies: 10906, nextDate: '2026-08-01', level: 'state', state: 'Tamil Nadu' },
      { id: 'gujarat_police', name: 'Gujarat Police Constable', fullName: 'Gujarat Police Constable', vacancies: 10459, nextDate: '2026-06-01', level: 'state', state: 'Gujarat' },
      { id: 'maharashtra_police', name: 'Maharashtra Police Constable', fullName: 'Maharashtra Police', vacancies: 18331, nextDate: '2026-07-01', level: 'state', state: 'Maharashtra' },
    ]
  },
  {
    id: 'state_psc_ext', label: 'State PSC (More)', icon: '📌', color: '#0891b2',
    exams: [
      { id: 'jpsc', name: 'JPSC', fullName: 'Jharkhand Public Service Commission', vacancies: 342, nextDate: '2026-08-01', level: 'state', state: 'Jharkhand' },
      { id: 'ukpsc', name: 'UKPSC', fullName: 'Uttarakhand Public Service Commission', vacancies: 229, nextDate: '2026-09-01', level: 'state', state: 'Uttarakhand' },
      { id: 'goapsc', name: 'Goa PSC', fullName: 'Goa Public Service Commission', vacancies: 85, nextDate: '2026-10-01', level: 'state', state: 'Goa' },
      { id: 'manipurpsc', name: 'Manipur PSC', fullName: 'Manipur Public Service Commission', vacancies: 75, nextDate: '2026-08-01', level: 'state', state: 'Manipur' },
      { id: 'megpsc', name: 'Meghalaya PSC', fullName: 'Meghalaya Public Service Commission', vacancies: 60, nextDate: '2026-09-01', level: 'state', state: 'Meghalaya' },
      { id: 'nagpsc', name: 'Nagaland PSC', fullName: 'Nagaland Public Service Commission', vacancies: 45, nextDate: '2026-10-01', level: 'state', state: 'Nagaland' },
      { id: 'tripsc', name: 'Tripura PSC', fullName: 'Tripura Public Service Commission', vacancies: 98, nextDate: '2026-07-01', level: 'state', state: 'Tripura' },
      { id: 'sikkim_psc', name: 'Sikkim PSC', fullName: 'Sikkim Public Service Commission', vacancies: 42, nextDate: '2026-11-01', level: 'state', state: 'Sikkim' },
      { id: 'mizoram_psc', name: 'Mizoram PSC', fullName: 'Mizoram Public Service Commission', vacancies: 55, nextDate: '2026-09-01', level: 'state', state: 'Mizoram' },
      { id: 'arunachal_psc', name: 'Arunachal PSC', fullName: 'Arunachal Pradesh Public Service Commission', vacancies: 62, nextDate: '2026-10-01', level: 'state', state: 'Arunachal Pradesh' },
      { id: 'jkpsc', name: 'JKPSC', fullName: 'Jammu & Kashmir Public Service Commission', vacancies: 258, nextDate: '2026-07-01', level: 'state', state: 'Jammu & Kashmir (UT)' },
      { id: 'delhisc', name: 'DSSSB Group C', fullName: 'Delhi Subordinate Services Selection Board Group C', vacancies: 4382, nextDate: '2026-06-01', level: 'state', state: 'Delhi (UT)' },
      { id: 'chandigarh_psc', name: 'Chandigarh Recruitment', fullName: 'Chandigarh Administration Recruitment', vacancies: 120, nextDate: '2026-08-01', level: 'state', state: 'Chandigarh (UT)' },
      { id: 'pondy_psc', name: 'Puducherry PSC', fullName: 'Puducherry Public Service Commission', vacancies: 68, nextDate: '2026-09-01', level: 'state', state: 'Puducherry (UT)' },
    ]
  },
  {
    id: 'state_revenue', label: 'State Revenue & Revenue', icon: '📁', color: '#b45309',
    exams: [
      { id: 'ap_revenue', name: 'AP Revenue SI', fullName: 'AP Revenue Sub-Inspector', vacancies: 2820, nextDate: '2026-10-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_revenue', name: 'TS Revenue SI', fullName: 'Telangana Revenue Sub-Inspector', vacancies: 1560, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
      { id: 'ap_sachivalayam', name: 'AP Sachivalayam', fullName: 'AP Village Sachivalayam', vacancies: 9000, nextDate: '2026-11-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_vro', name: 'TS VRO/VRA', fullName: 'Telangana Village Revenue Officer/Assistant', vacancies: 3600, nextDate: '2026-08-01', level: 'state', state: 'Telangana' },
      { id: 'ap_meeseva', name: 'AP MeeSeva', fullName: 'AP MeeSeva Digital Services Operator', vacancies: 1400, nextDate: '2026-07-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_ghmc', name: 'GHMC Jobs', fullName: 'Greater Hyderabad Municipal Corporation', vacancies: 850, nextDate: '2026-10-01', level: 'state', state: 'Telangana' },
    ]
  },
  {
    id: 'state_psc_group2', label: 'AP/TS Group Exams', icon: '🏢', color: '#0284c7',
    exams: [
      { id: 'appsc_group1', name: 'APPSC Group 1', fullName: 'APPSC Group 1 DSP/RTO/Dy Collector', vacancies: 503, nextDate: '2026-11-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'appsc_group2', name: 'APPSC Group 2', fullName: 'APPSC Group 2 Junior Assistant/Steno', vacancies: 830, nextDate: '2026-09-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'appsc_group3', name: 'APPSC Group 3', fullName: 'APPSC Group 3 Jr Asst/Office Subordinate', vacancies: 1050, nextDate: '2026-10-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'appsc_group4', name: 'APPSC Group 4', fullName: 'APPSC Group 4 Junior Steno/Typist', vacancies: 780, nextDate: '2026-10-15', level: 'state', state: 'Andhra Pradesh' },
      { id: 'tgpsc_group1', name: 'TGPSC Group 1', fullName: 'TGPSC Group 1 Deputy Collector', vacancies: 563, nextDate: '2026-10-01', level: 'state', state: 'Telangana' },
      { id: 'tgpsc_group2', name: 'TGPSC Group 2', fullName: 'TGPSC Group 2 Junior Assistant', vacancies: 900, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
      { id: 'tgpsc_group3', name: 'TGPSC Group 3', fullName: 'TGPSC Group 3 Steno/Typist', vacancies: 650, nextDate: '2026-08-15', level: 'state', state: 'Telangana' },
      { id: 'tgpsc_group4', name: 'TGPSC Group 4', fullName: 'TGPSC Group 4 Jr Steno/Record Asst', vacancies: 720, nextDate: '2026-09-15', level: 'state', state: 'Telangana' },
    ]
  },
  {
    id: 'board_exams', label: 'Board Exams', icon: '📚', color: '#16a34a',
    exams: [
      { id: 'cbse_10', name: 'CBSE Class 10', fullName: 'Central Board Secondary Education Class X Board Exam', vacancies: 2200000, nextDate: '2027-03-01', level: 'central' },
      { id: 'cbse_12', name: 'CBSE Class 12', fullName: 'Central Board Secondary Education Class XII Board Exam', vacancies: 1600000, nextDate: '2027-02-15', level: 'central' },
      { id: 'icse_10', name: 'ICSE Class 10', fullName: 'Indian Certificate of Secondary Education', vacancies: 280000, nextDate: '2027-02-22', level: 'central' },
      { id: 'isce_12', name: 'ISC Class 12', fullName: 'Indian School Certificate', vacancies: 210000, nextDate: '2027-02-10', level: 'central' },
      { id: 'ap_ssc', name: 'AP SSC (Class 10)', fullName: 'Andhra Pradesh Board Class 10', vacancies: 600000, nextDate: '2027-03-20', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ap_inter', name: 'AP Intermediate', fullName: 'Andhra Pradesh Board of Intermediate Education', vacancies: 550000, nextDate: '2027-03-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_ssc', name: 'TS SSC (Class 10)', fullName: 'Telangana Board Class 10', vacancies: 520000, nextDate: '2027-03-22', level: 'state', state: 'Telangana' },
      { id: 'ts_inter', name: 'TS Intermediate', fullName: 'Telangana Board of Intermediate Education', vacancies: 490000, nextDate: '2027-03-04', level: 'state', state: 'Telangana' },
      { id: 'tn_sslc', name: 'TN SSLC', fullName: 'Tamil Nadu SSLC Board Exam', vacancies: 900000, nextDate: '2027-04-07', level: 'state', state: 'Tamil Nadu' },
      { id: 'maharashtra_ssc', name: 'Maharashtra SSC', fullName: 'Maharashtra State Board Class 10', vacancies: 1700000, nextDate: '2027-03-01', level: 'state', state: 'Maharashtra' },
      { id: 'kerala_sslc', name: 'Kerala SSLC', fullName: 'Kerala Board Class 10', vacancies: 450000, nextDate: '2027-03-15', level: 'state', state: 'Kerala' },
      { id: 'karnataka_sslc', name: 'Karnataka SSLC', fullName: 'Karnataka Board Class 10', vacancies: 880000, nextDate: '2027-03-20', level: 'state', state: 'Karnataka' },
      { id: 'wb_madhyamik', name: 'WB Madhyamik', fullName: 'West Bengal Board Class 10', vacancies: 1000000, nextDate: '2027-02-24', level: 'state', state: 'West Bengal' },
      { id: 'up_board_10', name: 'UP Board Class 10', fullName: 'Uttar Pradesh Madhyamik Shiksha Parishad', vacancies: 2900000, nextDate: '2027-02-22', level: 'state', state: 'Uttar Pradesh' },
      { id: 'bihar_board_10', name: 'Bihar Board Class 10', fullName: 'Bihar School Examination Board Class 10', vacancies: 1600000, nextDate: '2027-02-17', level: 'state', state: 'Bihar' },
      { id: 'rajasthan_board_10', name: 'Rajasthan RBSE 10', fullName: 'Rajasthan Board of Secondary Education Class 10', vacancies: 1100000, nextDate: '2027-03-06', level: 'state', state: 'Rajasthan' },
    ]
  },
  {
    id: 'entrance_pg', label: 'PG Entrance', icon: '🎓', color: '#7c2d12',
    exams: [
      { id: 'cat', name: 'CAT', fullName: 'Common Admission Test (MBA IIMs)', vacancies: 4500, nextDate: '2026-11-24', level: 'central' },
      { id: 'mat', name: 'MAT', fullName: 'Management Aptitude Test', vacancies: 50000, nextDate: '2026-09-01', level: 'central' },
      { id: 'xat', name: 'XAT', fullName: 'Xavier Aptitude Test', vacancies: 2000, nextDate: '2027-01-05', level: 'central' },
      { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', vacancies: 4500, nextDate: '2026-12-01', level: 'central' },
      { id: 'cuet_ug', name: 'CUET UG', fullName: 'Common University Entrance Test UG', vacancies: 700000, nextDate: '2026-05-15', level: 'central' },
      { id: 'cuet_pg', name: 'CUET PG', fullName: 'Common University Entrance Test PG', vacancies: 200000, nextDate: '2026-07-01', level: 'central' },
      { id: 'ugc_net', name: 'UGC NET', fullName: 'University Grants Commission National Eligibility Test', vacancies: 120000, nextDate: '2026-06-18', level: 'central' },
      { id: 'csir_net', name: 'CSIR NET', fullName: 'CSIR-UGC National Eligibility Test (JRF/LS)', vacancies: 1800, nextDate: '2026-06-29', level: 'central' },
    ]
  },
  {
    id: 'scholarship', label: 'Scholarship Exams', icon: '🏅', color: '#ca8a04',
    exams: [
      { id: 'ntse', name: 'NTSE', fullName: 'National Talent Search Examination', vacancies: 2000, nextDate: '2026-11-01', level: 'central' },
      { id: 'kvpy', name: 'INSPIRE SHE', fullName: 'INSPIRE Scholarship for Higher Education (Science)', vacancies: 10000, nextDate: '2026-09-01', level: 'central' },
      { id: 'nmms', name: 'NMMS', fullName: 'National Means-cum-Merit Scholarship', vacancies: 100000, nextDate: '2026-11-01', level: 'central' },
      { id: 'jnvst', name: 'JNVST', fullName: 'Jawahar Navodaya Vidyalaya Selection Test', vacancies: 55000, nextDate: '2027-01-18', level: 'central' },
      { id: 'ap_ntss', name: 'AP NTSS', fullName: 'Andhra Pradesh National Talent Search Scheme', vacancies: 500, nextDate: '2026-10-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_ntss', name: 'TS NTSS', fullName: 'Telangana National Talent Search Scheme', vacancies: 480, nextDate: '2026-10-01', level: 'state', state: 'Telangana' },
      { id: 'rmo', name: 'RMO/INMO', fullName: 'Regional/National Mathematics Olympiad', vacancies: 35, nextDate: '2026-10-01', level: 'central' },
      { id: 'nso', name: 'NSO', fullName: 'National Science Olympiad', vacancies: 9999, nextDate: '2026-11-01', level: 'central' },
    ]
  },
  {
    id: 'state_teaching_ext', label: 'State TET / TGT', icon: '✏️', color: '#0369a1',
    exams: [
      { id: 'ap_tet', name: 'AP TET', fullName: 'Andhra Pradesh Teacher Eligibility Test', vacancies: 20000, nextDate: '2026-08-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_tet', name: 'TS TET', fullName: 'Telangana Teacher Eligibility Test', vacancies: 18000, nextDate: '2026-07-01', level: 'state', state: 'Telangana' },
      { id: 'tn_tet', name: 'TN TET', fullName: 'Tamil Nadu Teacher Eligibility Test', vacancies: 35000, nextDate: '2026-09-01', level: 'state', state: 'Tamil Nadu' },
      { id: 'up_tet', name: 'UP TET', fullName: 'Uttar Pradesh Teacher Eligibility Test', vacancies: 150000, nextDate: '2026-11-01', level: 'state', state: 'Uttar Pradesh' },
      { id: 'reet', name: 'REET', fullName: 'Rajasthan Eligibility Examination for Teachers', vacancies: 46500, nextDate: '2026-09-01', level: 'state', state: 'Rajasthan' },
      { id: 'mp_tet', name: 'MP TET', fullName: 'Madhya Pradesh Teacher Eligibility Test', vacancies: 30000, nextDate: '2026-10-01', level: 'state', state: 'Madhya Pradesh' },
      { id: 'bihar_tet', name: 'Bihar STET', fullName: 'Bihar State Teacher Eligibility Test', vacancies: 94000, nextDate: '2026-08-01', level: 'state', state: 'Bihar' },
      { id: 'maha_tet', name: 'Maharashtra TET', fullName: 'Maharashtra Teacher Eligibility Test', vacancies: 45000, nextDate: '2026-07-01', level: 'state', state: 'Maharashtra' },
      { id: 'karnataka_tet', name: 'Karnataka TET', fullName: 'Karnataka Teacher Eligibility Test', vacancies: 22000, nextDate: '2026-08-01', level: 'state', state: 'Karnataka' },
      { id: 'gujarat_tet', name: 'Gujarat TET', fullName: 'Gujarat Teacher Eligibility Test', vacancies: 25000, nextDate: '2026-09-01', level: 'state', state: 'Gujarat' },
    ]
  },
  {
    id: 'central_misc', label: 'Central Govt (Other)', icon: '🏛️', color: '#374151',
    exams: [
      { id: 'fci_agt', name: 'FCI AGT', fullName: 'Food Corporation of India Assistant Grade III', vacancies: 5043, nextDate: '2026-09-01', level: 'central' },
      { id: 'irdai', name: 'IRDAI Assistant', fullName: 'Insurance Regulatory Development Authority', vacancies: 45, nextDate: '2026-10-01', level: 'central' },
      { id: 'iob_po', name: 'IOB PO', fullName: 'Indian Overseas Bank Probationary Officer', vacancies: 500, nextDate: '2026-07-01', level: 'central' },
      { id: 'sebi_grade_a', name: 'SEBI Grade A', fullName: 'Securities Exchange Board of India Officer', vacancies: 97, nextDate: '2026-09-01', level: 'central' },
      { id: 'npcil', name: 'NPCIL Executive', fullName: 'Nuclear Power Corporation of India', vacancies: 395, nextDate: '2026-10-01', level: 'central' },
      { id: 'drdo_ceptam', name: 'DRDO CEPTAM', fullName: 'DRDO Technical & Admin Staff', vacancies: 1901, nextDate: '2026-11-01', level: 'central' },
      { id: 'isro_sc', name: 'ISRO SC', fullName: 'ISRO Scientist/Engineer', vacancies: 320, nextDate: '2026-08-01', level: 'central' },
      { id: 'bsnl_tta', name: 'BSNL TTA/JE', fullName: 'BSNL Telecom Technical Asst / Junior Engineer', vacancies: 2700, nextDate: '2026-07-01', level: 'central' },
      { id: 'ecil_je', name: 'ECIL JTO/JE', fullName: 'Electronics Corp of India Junior Tech Officer', vacancies: 1200, nextDate: '2026-09-01', level: 'central' },
      { id: 'cseb', name: 'CSEB', fullName: 'Central Silk Board Examinations', vacancies: 450, nextDate: '2026-10-01', level: 'central' },
      { id: 'coal_india', name: 'Coal India MT', fullName: 'Coal India Management Trainee', vacancies: 640, nextDate: '2026-08-01', level: 'central' },
      { id: 'ongc', name: 'ONGC GT', fullName: 'Oil and Natural Gas Corporation Graduate Trainee', vacancies: 924, nextDate: '2026-07-01', level: 'central' },
      { id: 'hpcl_officer', name: 'HPCL Officer', fullName: 'Hindustan Petroleum Corporation Officer', vacancies: 244, nextDate: '2026-09-01', level: 'central' },
      { id: 'sail_octt', name: 'SAIL Operator/Technician', fullName: 'Steel Authority of India Octt', vacancies: 747, nextDate: '2026-11-01', level: 'central' },
      { id: 'ntpc_diploma', name: 'NTPC Diploma Trainee', fullName: 'NTPC Diploma Trainee Engineering', vacancies: 1038, nextDate: '2026-09-01', level: 'central' },
      { id: 'gail_exe', name: 'GAIL Executive Trainee', fullName: 'Gas Authority India Ltd Executive Trainee', vacancies: 282, nextDate: '2026-08-01', level: 'central' },
      { id: 'iocl_officer', name: 'IOCL Officer/Engineer', fullName: 'Indian Oil Corporation Officer', vacancies: 476, nextDate: '2026-10-01', level: 'central' },
      { id: 'bel_probationary', name: 'BEL PE', fullName: 'Bharat Electronics Ltd Probationary Engineer', vacancies: 350, nextDate: '2026-07-01', level: 'central' },
      { id: 'nalco', name: 'NALCO GET', fullName: 'National Aluminium Co Graduate Engineer Trainee', vacancies: 140, nextDate: '2026-11-01', level: 'central' },
      { id: 'powergrid_exe', name: 'PGCIL ET', fullName: 'Power Grid Corporation Executive Trainee', vacancies: 100, nextDate: '2026-09-01', level: 'central' },
      { id: 'nimhans', name: 'NIMHANS', fullName: 'NIMHANS Nursing/Paramedical Recruitment', vacancies: 200, nextDate: '2026-10-01', level: 'central' },
      { id: 'esic_udc', name: 'ESIC UDC/MTS', fullName: 'Employees State Insurance UDC & MTS', vacancies: 3030, nextDate: '2026-08-01', level: 'central' },
      { id: 'epfo_ssa', name: 'EPFO SSA', fullName: 'Employees Provident Fund Social Security Asst', vacancies: 2674, nextDate: '2026-07-01', level: 'central' },
      { id: 'tspsc_aee', name: 'TSPSC AEE', fullName: 'Telangana Assistant Executive Engineer', vacancies: 1540, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
      { id: 'appsc_aee', name: 'APPSC AEE', fullName: 'Andhra Pradesh Assistant Executive Engineer', vacancies: 1220, nextDate: '2026-10-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ap_constable', name: 'AP Constable', fullName: 'Andhra Pradesh Police Constable Civil & AR', vacancies: 6100, nextDate: '2026-08-01', level: 'state', state: 'Andhra Pradesh' },
      { id: 'ts_constable', name: 'TS Constable', fullName: 'Telangana Police Constable Civil & AR', vacancies: 7200, nextDate: '2026-09-01', level: 'state', state: 'Telangana' },
      { id: 'ib_acio', name: 'IB ACIO', fullName: 'Intelligence Bureau ACIO Grade II/Executive', vacancies: 2000, nextDate: '2026-08-01', level: 'central' },
      { id: 'nra_cet', name: 'NRA CET', fullName: 'National Recruitment Agency Common Eligibility Test', vacancies: 999999, nextDate: '2026-10-01', level: 'central' },
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
  { code: 'mr', name: 'Marathi', native: 'మరాठी', flag: '🌸' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🌼' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '☽' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🦁' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🐘' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളం', flag: '🌴' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ిଆ', flag: '🎭' },
  { code: 'pa', name: 'Punjabi', native: 'पंजाब', flag: '🌾' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🦏' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', flag: '🪷' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', flag: '🌊' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '⛰️' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌい', flag: '🏜️' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर', flag: '❄️' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', flag: '🏔️' },
  { code: 'mni', name: 'Manipuri', native: 'మౌతైలాన్', flag: '💐' },
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
  ],
  state_psc: [
    { id: 'ap_history', name: 'AP History & Culture', icon: '🏛️' },
    { id: 'ts_history', name: 'Telangana History & Movement', icon: '✊' },
    { id: 'ap_geography', name: 'AP Geography', icon: '🗺️' },
    { id: 'ts_geography', name: 'Telangana Geography', icon: '🏔️' },
    { id: 'bifurcation', name: 'AP Reorganisation Act 2014', icon: '📜' },
    { id: 'local_economy', name: 'State Welfare Schemes', icon: '💰' }
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
    { id: 'nep_policy', name: 'NEP 2020 & Policies', icon: '📝' }
  ]
}
