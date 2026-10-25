import React, { useState, useEffect, useRef } from 'react';

const UNIVERSITIES_DIRECTORY = [
  {
    id: 'aau',
    name: 'Addis Ababa University',
    amharic: 'አዲስ አበባ ዩኒቨርሲቲ',
    short: 'AAU',
    generation: 'First Generation / Autonomous Flagship',
    category: 'Research Flagship',
    established: 1950,
    president: 'Dr. Samuel Kifle (Interim)',
    mainCampus: 'Sidist Kilo, Addis Ababa',
    city: 'Addis Ababa',
    logo: '/images/inst_logos/aau.png',
    accent: 'from-blue-600 to-indigo-800',
    crestColor: 'bg-blue-900',
    campuses: ['Sidist Kilo (Main)', 'Arat Kilo (Natural Sciences)', 'Black Lion (Health Sciences)', 'AAiT (Technology)', 'FBE (Business)', 'Yared School of Music'],
    students: '48,000+',
    climate: 'Temperate highland (16°C - 24°C)',
    badge: 'Premier National University',
    mapCoords: { lat: 9.0463, lng: 38.7618 },
    mapQuery: 'Addis+Ababa+University+Sidist+Kilo+Ethiopia',
    overview: 'The oldest and most prestigious higher learning institution in Ethiopia. AAU functions as an autonomous research flagship university with world-renowned faculties in medicine, jurisprudence, engineering (AAiT), and computational sciences.',
    uniqueFeatures: [
      'Tikur Anbessa (Black Lion) Hospital — Largest tertiary specialized referral hospital and medical training center in Ethiopia.',
      'Addis Ababa Institute of Technology (AAiT) — Premier engineering campus with railway, power, and software faculties.',
      'Institute of Ethiopian Studies (IES) & National Ethnographic Museum located on main campus.',
      'Only university in Ethiopia designated as fully autonomous by the Ministry of Education.',
    ],
    gallery: [
      { url: '/images/categories/aau-gat.jpg', caption: 'AAU Ras Makonnen Hall & Historic Campus' },
      { url: '/images/categories/exit-exam.jpg', caption: 'Kennedy Memorial Library & Study Halls' },
      { url: '/images/categories/tvet-coc.jpg', caption: 'AAiT Specialized Technology Workshops' },
    ],
    faculties: [
      { name: 'College of Health Sciences', depts: ['Medicine (MD)', 'Dental Medicine', 'Pharmacy', 'Nursing', 'Public Health', 'Medical Radiologic Technology'] },
      { name: 'Addis Ababa Institute of Technology (AAiT)', depts: ['Software Engineering', 'Electrical & Computer Eng.', 'Mechanical Eng.', 'Civil & Environmental Eng.', 'Chemical Eng.', 'Biomedical Eng.'] },
      { name: 'College of Law & Governance', depts: ['Public Law', 'Private Law', 'International Law', 'Human Rights', 'Federal Studies'] },
      { name: 'College of Natural & Computational Sciences', depts: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Biotechnology', 'Statistics'] },
      { name: 'College of Business & Economics (FBE)', depts: ['Accounting & Finance', 'Economics', 'Management', 'Marketing Management', 'Public Administration'] },
    ],
    cutoffs: 'Top national ranking; minimum 480+ in ESUEE for engineering & health science tracks.',
  },
  {
    id: 'astu',
    name: 'Adama Science & Technology University',
    amharic: 'አዳማ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
    short: 'ASTU',
    generation: 'Science & Technology University',
    category: 'STEM Excellence',
    established: 1993,
    mainCampus: 'Adama, Oromia (Near Express Way)',
    city: 'Adama',
    logo: '/images/inst_logos/astu.png',
    accent: 'from-emerald-600 to-teal-800',
    crestColor: 'bg-emerald-900',
    campuses: ['Main Technological Campus (Adama)'],
    students: '18,000+',
    climate: 'Warm semi-arid rift valley (20°C - 30°C)',
    badge: 'Center of Excellence (CoE)',
    mapCoords: { lat: 8.5614, lng: 39.2905 },
    mapQuery: 'Adama+Science+and+Technology+University+Ethiopia',
    overview: 'Specialized national Center of Excellence directly chartered to produce elite scientists, researchers, and engineers. ASTU operates with specialized research institutes, advanced robotics laboratories, and incubation hubs.',
    uniqueFeatures: [
      'Center of Excellence in Advanced Materials Science and Engineering.',
      'Center of Excellence in Space Science, Satellite Technology & Robotics.',
      'High-speed supercomputing cluster and clean-room fabrication research facilities.',
      'Specialized entrance selection test administered in addition to national matriculation.',
    ],
    gallery: [
      { url: '/images/categories/tvet-coc.jpg', caption: 'Advanced Materials & Robotics Labs' },
      { url: '/images/categories/esuee-grade12.jpg', caption: 'Central Technology Library & ICT Hub' },
    ],
    faculties: [
      { name: 'School of Electrical & Information Engineering', depts: ['Computer Science & Eng.', 'Electronics & Communications Eng.', 'Control & Instrumentation', 'Power Systems Engineering'] },
      { name: 'School of Mechanical, Chemical & Materials Eng.', depts: ['Mechanical Design & Manufacturing', 'Aerospace Engineering', 'Materials Science', 'Chemical Process Engineering'] },
      { name: 'School of Civil Engineering & Architecture', depts: ['Structural Engineering', 'Water Resources Eng.', 'Architecture & Urban Planning', 'Geotechnical Eng.'] },
      { name: 'School of Applied Natural Sciences', depts: ['Applied Physics', 'Industrial Chemistry', 'Computational Mathematics', 'Applied Geology'] },
    ],
    cutoffs: 'Special ASTU Entrance Aptitude Exam required; top 5% national STEM percentiles.',
  },
  {
    id: 'aastu',
    name: 'Addis Ababa Science & Technology University',
    amharic: 'አዲስ አበባ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
    short: 'AASTU',
    generation: 'Science & Technology University',
    category: 'Applied Innovation',
    established: 2011,
    mainCampus: 'Kilinto Industrial Zone, Addis Ababa',
    city: 'Addis Ababa',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-amber-600 to-yellow-800',
    crestColor: 'bg-amber-900',
    campuses: ['Kilinto Tech Park Campus'],
    students: '12,000+',
    climate: 'Mild highland climate (15°C - 23°C)',
    badge: 'Tech Innovation Hub',
    mapCoords: { lat: 8.8872, lng: 38.8078 },
    mapQuery: 'Addis+Ababa+Science+and+Technology+University+Kilinto',
    overview: 'Strategically located within the Kilinto industrial innovation corridor, AASTU bridges university research with Ethiopian industrial development, pharmaceutical manufacturing, and software hubs.',
    uniqueFeatures: [
      'Center of Excellence in Artificial Intelligence, Big Data & High Performance Computing.',
      'Center of Excellence in Mineral Exploration & Mineral Processing.',
      'Biotechnology and Vaccine Research Incubation Center.',
      'Direct industry apprenticeships with Ethiopian industrial parks.',
    ],
    gallery: [
      { url: '/images/categories/exit-exam.jpg', caption: 'Kilinto Innovation & Incubator Complex' },
      { url: '/images/categories/banking-aptitude.jpg', caption: 'AI & Machine Learning Innovation Center' },
    ],
    faculties: [
      { name: 'College of Electrical & Mechanical Engineering', depts: ['Software Engineering', 'Electromechanical Engineering', 'Automotive Eng.', 'Robotics & Automation'] },
      { name: 'College of Architecture & Civil Engineering', depts: ['Civil Engineering', 'Mining Engineering', 'Architecture', 'Construction Tech & Management'] },
      { name: 'College of Biological & Chemical Engineering', depts: ['Biotechnology', 'Environmental Engineering', 'Food Process Engineering'] },
      { name: 'College of Applied Sciences', depts: ['Industrial Mathematics', 'Geology', 'Nanotechnology', 'Industrial Chemistry'] },
    ],
    cutoffs: 'AASTU Institutional Entrance Exam + Grade 12 national matriculation qualification.',
  },
  {
    id: 'ju',
    name: 'Jimma University',
    amharic: 'ጅማ ዩኒቨርሲቲ',
    short: 'JU',
    generation: 'First Generation / Research',
    category: 'Community-Based Education',
    established: 1999,
    mainCampus: 'Jimma, Oromia',
    city: 'Jimma',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-purple-600 to-pink-800',
    crestColor: 'bg-purple-900',
    campuses: ['Main Campus', 'Jimma Institute of Technology (JiT)', 'Agricultural Campus', 'Medical Center Campus'],
    students: '38,000+',
    climate: 'Lush tropical highland (18°C - 27°C)',
    badge: 'National Innovation Award Winner',
    mapCoords: { lat: 7.6775, lng: 36.8322 },
    mapQuery: 'Jimma+University+Ethiopia',
    overview: 'Nationally recognized for its pioneer philosophy: "We Are in the Community!" Jimma University has been ranked repeatedly as the top comprehensive university in Ethiopia by the Ministry of Education.',
    uniqueFeatures: [
      'Pioneer of Community-Based Education (CBE) and Community-Based Training Programs (CBTP).',
      'Jimma University Medical Center (JUMC) serving over 15 million citizens in Southwestern Ethiopia.',
      'JiT specialized incubation hub for coffee processing machinery and agricultural mechanization.',
      'National Center of Excellence for Tropical and Infectious Disease Research.',
    ],
    gallery: [
      { url: '/images/categories/banking-aptitude.jpg', caption: 'Jimma University Main Plaza & Senate Hall' },
      { url: '/images/categories/aau-gat.jpg', caption: 'Comprehensive Medical Center & Research Wards' },
    ],
    faculties: [
      { name: 'Institute of Health', depts: ['Medicine (MD)', 'Pharmacy', 'Medical Laboratory Science', 'Public Health', 'Anesthesiology', 'Dentistry'] },
      { name: 'Jimma Institute of Technology (JiT)', depts: ['Biomedical Engineering', 'Computer Science', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Eng.', 'Water Resources Eng.'] },
      { name: 'College of Agriculture & Veterinary Medicine', depts: ['Horticulture', 'Animal Science', 'Veterinary Medicine (DVM)', 'Post-Harvest Technology'] },
      { name: 'College of Law & Governance', depts: ['Law', 'Governance & Development', 'Peace & Security Studies'] },
    ],
    cutoffs: 'MoE national assignment; highly competitive medical and biomedical programs.',
  },
  {
    id: 'bdu',
    name: 'Bahir Dar University',
    amharic: 'ባህር ዳር ዩኒቨርሲቲ',
    short: 'BDU',
    generation: 'First Generation / Research',
    category: 'Maritime & Engineering',
    established: 2000,
    mainCampus: 'Bahir Dar, Amhara (Lake Tana Shores)',
    city: 'Bahir Dar',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-cyan-600 to-blue-800',
    crestColor: 'bg-cyan-900',
    campuses: ['Poly Campus (BiT)', 'Peda Campus', 'Selam Campus', 'Maritime Academy', 'College of Medicine'],
    students: '42,000+',
    climate: 'Subtropical highland beside Lake Tana (18°C - 29°C)',
    badge: 'Maritime Institute Flagship',
    mapCoords: { lat: 11.5976, lng: 37.3956 },
    mapQuery: 'Bahir+Dar+University+Poly+Campus+Ethiopia',
    overview: 'Located on the scenic shores of Lake Tana, Bahir Dar University hosts Ethiopia’s only Maritime Academy along with major textile engineering, blue economy, and pedagogical institutes.',
    uniqueFeatures: [
      'Ethiopian Maritime Training Institute (EMTI) — producing certified commercial vessel officers worldwide.',
      'Ethiopian Institute of Textile and Fashion Technology (EiTEX) — premier African textile center.',
      'Bahir Dar Institute of Technology (BiT) — cutting edge hydraulic and energy research.',
      'Lake Tana Biosphere Reserve water quality research laboratory.',
    ],
    gallery: [
      { url: '/images/categories/esuee-grade12.jpg', caption: 'Poly Campus & Lake Tana Waterfront' },
      { url: '/images/categories/aviation-cadet.jpg', caption: 'Ethiopian Maritime Training Institute (EMTI)' },
    ],
    faculties: [
      { name: 'Maritime Academy', depts: ['Marine Engineering', 'Nautical Science', 'Port Management & Logistics'] },
      { name: 'Bahir Dar Institute of Technology (BiT)', depts: ['Hydraulic Engineering', 'Software Engineering', 'Electrical Engineering', 'Mechanical Eng.', 'Chemical Eng.'] },
      { name: 'EiTEX', depts: ['Textile Engineering', 'Garment Manufacturing Technology', 'Fashion Design'] },
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine (MD)', 'Public Health', 'Nursing', 'Midwifery'] },
    ],
    cutoffs: 'MoE national placement; EMTI enforces specialized international maritime physical and math screenings.',
  },
  {
    id: 'hu',
    name: 'Hawassa University',
    amharic: 'ሀዋሳ ዩኒቨርሲቲ',
    short: 'HU',
    generation: 'First Generation / Research',
    category: 'Agro-Tech & Health',
    established: 2000,
    mainCampus: 'Hawassa, Sidama',
    city: 'Hawassa',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-rose-600 to-red-800',
    crestColor: 'bg-rose-900',
    campuses: ['Main Campus', 'College of Agriculture (Wondo Genet)', 'College of Medicine & Health', 'IoT Tech Campus'],
    students: '36,000+',
    climate: 'Rift valley lakeside pleasant climate (18°C - 28°C)',
    badge: 'Industrial Corridor Partner',
    mapCoords: { lat: 7.0504, lng: 38.4842 },
    mapQuery: 'Hawassa+University+Main+Campus+Ethiopia',
    overview: 'A leading university in the southern rift valley adjacent to Lake Hawassa and the Hawassa Industrial Park. Known for high-impact forestry, environmental sciences, agricultural research, and modern medical centers.',
    uniqueFeatures: [
      'Wondo Genet College of Forestry and Natural Resources — premier forestry institute in East Africa.',
      'Hawassa University Comprehensive Specialized Hospital.',
      'Direct training and research collaboration with the Hawassa Industrial Eco-Park.',
    ],
    gallery: [
      { url: '/images/categories/aviation-cadet.jpg', caption: 'Hawassa University Main Boulevard & Auditorium' },
      { url: '/images/categories/tvet-coc.jpg', caption: 'IoT Campus Laboratory Facilities' },
    ],
    faculties: [
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine', 'Radiology', 'Pharmacy', 'Midwifery', 'Environmental Health'] },
      { name: 'Institute of Technology (IoT)', depts: ['Computer Science', 'Civil Eng.', 'Textile Engineering', 'Electrical & Computer Eng.'] },
      { name: 'Wondo Genet Forestry', depts: ['Forest Resource Management', 'Agroforestry', 'Wildlife & Ecotourism Management'] },
    ],
    cutoffs: 'MoE national university entrance assignment.',
  },
  {
    id: 'amu',
    name: 'Arba Minch University',
    amharic: 'አርባ ምንጭ ዩኒቨርሲቲ',
    short: 'AMU',
    generation: 'First Generation / Specialized',
    category: 'Water Resources Excellence',
    established: 1986,
    mainCampus: 'Arba Minch, Gamo',
    city: 'Arba Minch',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-teal-600 to-emerald-800',
    crestColor: 'bg-teal-900',
    campuses: ['Main Campus', 'Arba Minch Water Technology Institute (AWTI)', 'Chamo Campus', 'Nech Sar Campus'],
    students: '26,000+',
    climate: 'Warm tropical lakeside climate (22°C - 32°C)',
    badge: 'National Water Technology Center',
    mapCoords: { lat: 6.0354, lng: 37.5502 },
    mapQuery: 'Arba+Minch+Water+Technology+Institute+Ethiopia',
    overview: 'The indisputable national center for water resources engineering and hydrological technology in Ethiopia, home to the internationally recognized Arba Minch Water Technology Institute (AWTI).',
    uniqueFeatures: [
      'Arba Minch Water Technology Institute (AWTI) — trained the engineers behind major Ethiopian dam and irrigation projects.',
      'Premier meteorology and watershed management research station.',
      'Spectacular location between Lake Abaya and Lake Chamo beside Nech Sar National Park.',
    ],
    gallery: [
      { url: '/images/categories/exit-exam.jpg', caption: 'AWTI Hydraulic Testing Flumes & Stations' },
      { url: '/images/categories/esuee-grade12.jpg', caption: 'Chamo Campus Overlooking Rift Valley Lakes' },
    ],
    faculties: [
      { name: 'Water Technology Institute (AWTI)', depts: ['Hydraulic & Water Resources Eng.', 'Irrigation & Drainage Eng.', 'Water Supply & Sanitary Eng.', 'Meteorology & Hydrology'] },
      { name: 'Institute of Technology', depts: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Computer Science'] },
    ],
    cutoffs: 'National cutoff with priority placement for high-scoring physics and math students in AWTI.',
  },
  {
    id: 'uog',
    name: 'University of Gondar',
    amharic: 'የጎንደር ዩኒቨርሲቲ',
    short: 'UoG',
    generation: 'First Generation / Historic',
    category: 'Medical & Public Health',
    established: 1954,
    mainCampus: 'Gondar, Amhara (Near Fasil Ghebbi)',
    city: 'Gondar',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    accent: 'from-amber-600 to-rose-800',
    crestColor: 'bg-amber-900',
    campuses: ['College of Medicine (Chechela)', 'Maraki Campus', 'Teda Campus', 'Atse Tewodros Campus'],
    students: '30,000+',
    climate: 'Cool mountainous highland (14°C - 24°C)',
    badge: 'Pioneer Medical College',
    mapCoords: { lat: 12.6074, lng: 37.4589 },
    mapQuery: 'University+of+Gondar+Chechela+Ethiopia',
    overview: 'Founded in 1954 as the Public Health College and Training Center, Gondar is Ethiopia’s oldest and most revered medical training institution, famous for comprehensive clinical practice and ophthalmology.',
    uniqueFeatures: [
      'Gondar University Specialized Comprehensive Referral Hospital.',
      'National Center of Excellence in Ophthalmology and Corneal Surgery.',
      'MasterCard Foundation Scholars partner institution for inclusive education.',
    ],
    gallery: [
      { url: '/images/categories/aau-gat.jpg', caption: 'Historic Chechela Hospital & Academic Block' },
      { url: '/images/categories/banking-aptitude.jpg', caption: 'Maraki Campus Lecture Complex' },
    ],
    faculties: [
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine (MD)', 'Anesthesia', 'Ophthalmology', 'Physiotherapy', 'Psychiatry', 'Clinical Pharmacy'] },
      { name: 'Faculty of Informatics', depts: ['Computer Science', 'Information Systems', 'Software Engineering'] },
      { name: 'College of Veterinary Medicine', depts: ['Veterinary Medicine (DVM)', 'Veterinary Laboratory'] },
    ],
    cutoffs: 'MoE national matriculation cutoff; premier medical admissions quota.',
  },
];

export default function UniversityInsightsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inspectingUni, setInspectingUni] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'location' | 'departments' | 'gallery'
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [deptSearch, setDeptSearch] = useState('');

  // Local storage for user uploads per university
  const [userPhotos, setUserPhotos] = useState({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load user photos from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ethio_uni_user_photos');
      if (stored) {
        setUserPhotos(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read user photos from localStorage', e);
    }
  }, []);

  // Save user photos
  const handlePhotoUpload = (e) => {
    e.preventDefault();
    if (!newPhotoPreview || !inspectingUni) return;

    const uniId = inspectingUni.id;
    const newEntry = {
      url: newPhotoPreview,
      caption: newPhotoCaption.trim() || `${inspectingUni.short} Student Upload`,
      uploadedAt: new Date().toLocaleDateString(),
    };

    const updated = {
      ...userPhotos,
      [uniId]: [newEntry, ...(userPhotos[uniId] || [])],
    };

    setUserPhotos(updated);
    try {
      localStorage.setItem('ethio_uni_user_photos', JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage quota exceeded for photo', err);
    }

    setNewPhotoCaption('');
    setNewPhotoPreview(null);
    setUploadModalOpen(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const openUniModal = (uni) => {
    setInspectingUni(uni);
    setActiveTab('overview');
    setSelectedCollege(uni.faculties?.[0]?.name || null);
    setDeptSearch('');
  };

  const filteredUnis = UNIVERSITIES_DIRECTORY.filter(u => {
    if (selectedCategory !== 'all' && u.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q) || u.short.toLowerCase().includes(q) || u.amharic.includes(q);
      const matchCity = u.city.toLowerCase().includes(q) || u.mainCampus.toLowerCase().includes(q);
      const matchDepts = u.faculties.some(f => f.depts.some(d => d.toLowerCase().includes(q)));
      if (!matchName && !matchCity && !matchDepts) return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8 font-inter">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              National Directory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Higher Education Guide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian University Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Select any university below to explore in-depth campus profiles, live interactive maps, accredited degree departments, cutoffs, and photo galleries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-amber-400 font-mono block">45+</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Public Campuses</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-sky-400 font-mono block">100%</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Verified MoE Data</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities by name or city (e.g. AAU, ASTU, Hawassa, Gondar)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Research Flagship', 'STEM Excellence', 'Applied Innovation', 'Community-Based Education', 'Maritime & Engineering'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Institutions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clean University Grid: Logo and Name First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredUnis.map(uni => (
          <button
            key={uni.id}
            type="button"
            onClick={() => openUniModal(uni)}
            className="text-left p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-900 hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between gap-4 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {/* Top Logo & Code Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={uni.logo}
                  alt={`${uni.short} Logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full rounded-xl bg-amber-500/20 text-amber-400 items-center justify-center font-black text-sm">
                  {uni.short}
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-amber-400 group-hover:border-amber-400/40">
                {uni.short}
              </span>
            </div>

            {/* University Name & Amharic */}
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                {uni.name}
              </h2>
              <p className="text-xs text-slate-400 font-ethiopic line-clamp-1">
                {uni.amharic}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                <span className="truncate">{uni.city}</span>
              </div>
            </div>

            {/* Bottom Quick Call to Action */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors">
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-400">
                Open Campus Box
              </span>
              <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* University Modal with Background Blur */}
      {inspectingUni && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in-up"
          onClick={() => setInspectingUni(null)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#0B1527] border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Logo, University Name & Close Button */}
            <div className="p-5 sm:p-6 border-b border-slate-800/90 flex items-start justify-between gap-4 bg-slate-900/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2.5 shrink-0 shadow-md">
                  <img
                    src={inspectingUni.logo}
                    alt={`${inspectingUni.short} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {inspectingUni.category}
                    </span>
                    <span className="text-xs text-slate-400">Est. {inspectingUni.established}</span>
                    <span className="text-xs text-slate-400">• {inspectingUni.generation}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {inspectingUni.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-ethiopic">
                    {inspectingUni.amharic} • {inspectingUni.mainCampus}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingUni(null)}
                aria-label="Close University Modal"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/60 overflow-x-auto gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: 'info' },
                { id: 'location', label: 'Location (Map)', icon: 'map' },
                { id: 'departments', label: 'Departments', icon: 'school' },
                { id: 'gallery', label: 'Gallery & Photos', icon: 'photo_library' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'gallery' && (userPhotos[inspectingUni.id]?.length > 0) && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                      +{userPhotos[inspectingUni.id].length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Students</span>
                      <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{inspectingUni.students}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Campuses</span>
                      <span className="text-base font-black text-sky-400 font-mono mt-0.5 block">{inspectingUni.campuses.length} Campuses</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                      <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{inspectingUni.city}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Climate</span>
                      <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{inspectingUni.climate}</span>
                    </div>
                  </div>

                  {/* Institutional Summary */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                      Institutional Profile
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {inspectingUni.overview}
                    </p>
                  </div>

                  {/* Unique Features & Centers of Excellence */}
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block">
                      Centers of Excellence & Unique Distinctions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {inspectingUni.uniqueFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                          <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">verified</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admission Cutoffs & Campuses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Standard / Cutoff</span>
                      <p className="text-xs text-slate-200">{inspectingUni.cutoffs}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Campuses & Branches</span>
                      <p className="text-xs text-slate-200">{inspectingUni.campuses.join(' • ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOCATION (EMBEDDED MAP) */}
              {activeTab === 'location' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Campus Location</span>
                      <span className="text-xs text-slate-300">{inspectingUni.mainCampus} ({inspectingUni.city}, Ethiopia)</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inspectingUni.mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>

                  {/* Embedded Interactive Map */}
                  <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative bg-slate-950">
                    <iframe
                      title={`${inspectingUni.name} Campus Map`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(inspectingUni.mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full filter contrast-125"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: DEPARTMENTS */}
              {activeTab === 'departments' && (
                <div className="space-y-5">
                  {/* Department Search Filter */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                      search
                    </span>
                    <input
                      type="text"
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      placeholder="Filter departments or search programs (e.g. Software, Medicine, Law, Civil)..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Horizontal College Sub-Navigation Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Select Faculty / College:
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {inspectingUni.faculties.length} Academic Divisions
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                      {inspectingUni.faculties.map((fac) => {
                        const isSelected = (selectedCollege || inspectingUni.faculties[0]?.name) === fac.name;
                        return (
                          <button
                            key={fac.name}
                            type="button"
                            onClick={() => setSelectedCollege(fac.name)}
                            className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isSelected ? 'check_circle' : 'school'}
                            </span>
                            <span>{fac.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              {fac.depts.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active College Header & Vertical Departments List */}
                  {(() => {
                    const currentFac =
                      inspectingUni.faculties.find(
                        (f) => f.name === (selectedCollege || inspectingUni.faculties[0]?.name)
                      ) || inspectingUni.faculties[0];

                    if (!currentFac) return null;

                    const matchingDepts = currentFac.depts.filter((d) =>
                      deptSearch ? d.toLowerCase().includes(deptSearch.toLowerCase()) : true
                    );

                    return (
                      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                        {/* College Info Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-base">domain</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {currentFac.name}
                              </h3>
                              <span className="text-[11px] text-slate-400">
                                Accredited Ministry of Education Degree Programs
                              </span>
                            </div>
                          </div>

                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono self-start sm:self-auto">
                            Showing <strong className="text-amber-400">{matchingDepts.length}</strong> of {currentFac.depts.length} departments
                          </span>
                        </div>

                        {/* Vertical List of Departments */}
                        {matchingDepts.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No departments in "{currentFac.name}" match "{deptSearch}".
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-[46vh] overflow-y-auto pr-1">
                            {matchingDepts.map((dept, idx) => (
                              <div
                                key={dept}
                                className="p-3 sm:p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-400/40 hover:bg-slate-950 transition-all flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center shrink-0 group-hover:text-amber-400 group-hover:border-amber-400/30">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                                    {dept}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold hidden sm:inline-block">
                                    Exit Exam Verified
                                  </span>
                                  <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                                    verified
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: GALLERY & USER PHOTO UPLOAD */}
              {activeTab === 'gallery' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Campus Gallery</span>
                      <span className="text-xs text-slate-400">Official photos and community contributions</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">add_a_photo</span>
                      <span>Add / Upload Photo</span>
                    </button>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* User Uploaded Photos */}
                    {(userPhotos[inspectingUni.id] || []).map((photo, pIdx) => (
                      <div
                        key={`user-${pIdx}`}
                        className="rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/40 relative group shadow-lg"
                      >
                        <div className="h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-3 bg-slate-900/95 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white truncate block">
                              {photo.caption}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                              Student Upload
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Added {photo.uploadedAt}</span>
                        </div>
                      </div>
                    ))}

                    {/* Official Curated Photos */}
                    {inspectingUni.gallery.map((item, idx) => (
                      <div
                        key={`official-${idx}`}
                        className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative group shadow-lg"
                      >
                        <div className="h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-3 bg-slate-900/95 border-t border-slate-800">
                          <span className="text-xs font-medium text-slate-300 block truncate">
                            {item.caption}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Verified Campus View</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Modal Drawer */}
                  {uploadModalOpen && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Upload Photo of {inspectingUni.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadModalOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>

                      <form onSubmit={handlePhotoUpload} className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Image preview or click to select */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-36 h-28 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors shrink-0 bg-slate-900/50"
                          >
                            {newPhotoPreview ? (
                              <img
                                src={newPhotoPreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-2xl text-slate-400">upload_file</span>
                                <span className="text-[10px] text-slate-400 mt-1">Select Image</span>
                              </>
                            )}
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />

                          <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block">
                              Photo Title or Description
                            </label>
                            <input
                              type="text"
                              value={newPhotoCaption}
                              onChange={(e) => setNewPhotoCaption(e.target.value)}
                              placeholder="e.g. Science Library, Campus Gate, Graduation Amphitheater..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <p className="text-[10px] text-slate-400">
                              Upload photos of campuses, lecture halls, or events to help incoming candidates.
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadModalOpen(false);
                              setNewPhotoPreview(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!newPhotoPreview}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Publish Photo
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ethio Exam Hall Institutional Intelligence System
              </span>
              <button
                type="button"
                onClick={() => setInspectingUni(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

