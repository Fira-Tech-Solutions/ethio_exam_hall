import React, { useState } from 'react';

const UNIVERSITIES_DIRECTORY = [
  {
    id: 'aau',
    name: 'Addis Ababa University',
    amharic: 'አዲስ አበባ ዩኒቨርሲቲ',
    short: 'AAU',
    generation: 'First Generation / Research',
    category: 'Research Flagship',
    established: 1950,
    president: 'Dr. Samuel Kifle (Interim)',
    mainCampus: 'Sidist Kilo, Addis Ababa',
    campuses: ['Sidist Kilo (Main)', 'Arat Kilo (Science)', 'Black Lion (Health Sciences)', 'AAiT (Technology)', 'FBE (Business)', 'Yared School of Music'],
    students: '48,000+',
    climate: 'Temperate highland (16°C - 24°C)',
    badge: 'Premier National University',
    heroImage: '/images/categories/aau_gat.jpg',
    overview: 'The oldest and most prestigious higher learning institution in Ethiopia. AAU functions as an autonomous research flagship university with world-renowned faculties in medicine, jurisprudence, engineering (AAiT), and computational sciences.',
    uniqueFeatures: [
      'Tikur Anbessa (Black Lion) Hospital — Largest tertiary specialized referral hospital and medical training center in Ethiopia.',
      'Addis Ababa Institute of Technology (AAiT) — Premier engineering campus with railway, power, and software faculties.',
      'Institute of Ethiopian Studies (IES) & National Ethnographic Museum located on main campus.',
      'Only university in Ethiopia designated as fully autonomous by the Ministry of Education.',
    ],
    faculties: [
      { name: 'College of Health Sciences', depts: ['Medicine (MD)', 'Dental Medicine', 'Pharmacy', 'Nursing', 'Public Health'] },
      { name: 'Addis Ababa Institute of Technology (AAiT)', depts: ['Software Engineering', 'Electrical & Computer Eng.', 'Mechanical Eng.', 'Civil & Environmental Eng.', 'Chemical Eng.'] },
      { name: 'College of Law & Governance', depts: ['Public Law', 'Private Law', 'International Law', 'Human Rights'] },
      { name: 'College of Natural & Computational Sciences', depts: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Biotechnology'] },
      { name: 'College of Business & Economics (FBE)', depts: ['Accounting & Finance', 'Economics', 'Management', 'Marketing'] },
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
    campuses: ['Main Technological Campus (Adama)'],
    students: '18,000+',
    climate: 'Warm semi-arid rift valley (20°C - 30°C)',
    badge: 'Center of Excellence (CoE)',
    heroImage: '/images/categories/tvet_coc.jpg',
    overview: 'Specialized national Center of Excellence directly chartered to produce elite scientists, researchers, and engineers. ASTU operates with specialized research institutes, advanced robotics laboratories, and incubation hubs.',
    uniqueFeatures: [
      'Center of Excellence in Advanced Materials Science and Engineering.',
      'Center of Excellence in Space Science, Satellite Technology & Robotics.',
      'High-speed supercomputing cluster and clean-room fabrication research facilities.',
      'Specialized entrance selection test administered in addition to national matriculation.',
    ],
    faculties: [
      { name: 'School of Electrical & Information Engineering', depts: ['Computer Science & Eng.', 'Electronics & Communications', 'Control & Instrumentation', 'Power Systems'] },
      { name: 'School of Mechanical, Chemical & Materials Eng.', depts: ['Mechanical Design', 'Aerospace Engineering', 'Materials Science', 'Chemical Process Eng.'] },
      { name: 'School of Civil Engineering & Architecture', depts: ['Structural Engineering', 'Water Resources', 'Architecture & Urban Planning'] },
      { name: 'School of Applied Natural Sciences', depts: ['Applied Physics', 'Industrial Chemistry', 'Computational Mathematics'] },
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
    campuses: ['Kilinto Tech Park Campus'],
    students: '12,000+',
    climate: 'Mild highland climate (15°C - 23°C)',
    badge: 'Tech Innovation Hub',
    heroImage: '/images/categories/exit_exam.jpg',
    overview: 'Strategically located within the Kilinto industrial innovation corridor, AASTU bridges university research with Ethiopian industrial development, pharmaceutical manufacturing, and software hubs.',
    uniqueFeatures: [
      'Center of Excellence in Artificial Intelligence, Big Data & High Performance Computing.',
      'Center of Excellence in Mineral Exploration & Mineral Processing.',
      'Biotechnology and Vaccine Research Incubation Center.',
      'Direct industry apprenticeships with Ethiopian industrial parks.',
    ],
    faculties: [
      { name: 'College of Electrical & Mechanical Engineering', depts: ['Software Engineering', 'Electromechanical Engineering', 'Automotive Eng.', 'Robotics'] },
      { name: 'College of Architecture & Civil Engineering', depts: ['Civil Engineering', 'Mining Engineering', 'Architecture'] },
      { name: 'College of Biological & Chemical Engineering', depts: ['Biotechnology', 'Environmental Engineering', 'Food Engineering'] },
      { name: 'College of Applied Sciences', depts: ['Industrial Mathematics', 'Geology', 'Nanotechnology'] },
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
    campuses: ['Main Campus', 'Jimma Institute of Technology (JiT)', 'Agricultural Campus', 'Medical Center Campus'],
    students: '38,000+',
    climate: 'Lush tropical highland (18°C - 27°C)',
    badge: 'National Innovation Award Winner',
    heroImage: '/images/categories/banking_aptitude.jpg',
    overview: 'Nationally recognized for its pioneer philosophy: "We Are in the Community!" Jimma University has been ranked repeatedly as the top comprehensive university in Ethiopia by the Ministry of Education.',
    uniqueFeatures: [
      'Pioneer of Community-Based Education (CBE) and Community-Based Training Programs (CBTP).',
      'Jimma University Medical Center (JUMC) serving over 15 million citizens in Southwestern Ethiopia.',
      'JiT specialized incubation hub for coffee processing machinery and agricultural mechanization.',
      'National Center of Excellence for Tropical and Infectious Disease Research.',
    ],
    faculties: [
      { name: 'Institute of Health', depts: ['Medicine', 'Pharmacy', 'Medical Laboratory', 'Public Health', 'Anesthesiology'] },
      { name: 'Jimma Institute of Technology (JiT)', depts: ['Biomedical Engineering', 'Computer Science', 'Civil Engineering', 'Electrical Engineering'] },
      { name: 'College of Agriculture & Veterinary Medicine', depts: ['Horticulture', 'Animal Science', 'Veterinary Medicine (DVM)', 'Post-Harvest Tech'] },
      { name: 'College of Law & Governance', depts: ['Law', 'Governance', 'Peace & Security'] },
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
    campuses: ['Poly Campus (BiT)', 'Peda Campus', 'Selam Campus', 'Maritime Academy', 'College of Medicine'],
    students: '42,000+',
    climate: 'Subtropical highland beside Lake Tana (18°C - 29°C)',
    badge: 'Maritime Institute Flagship',
    heroImage: '/images/categories/grade12_esuee.jpg',
    overview: 'Located on the scenic shores of Lake Tana, Bahir Dar University hosts Ethiopia’s only Maritime Academy along with major textile engineering, blue economy, and pedagogical institutes.',
    uniqueFeatures: [
      'Ethiopian Maritime Training Institute (EMTI) — producing certified commercial vessel officers worldwide.',
      'Ethiopian Institute of Textile and Fashion Technology (EiTEX) — premier African textile center.',
      'Bahir Dar Institute of Technology (BiT) — cutting edge hydraulic and energy research.',
      'Lake Tana Biosphere Reserve water quality research laboratory.',
    ],
    faculties: [
      { name: 'Maritime Academy', depts: ['Marine Engineering', 'Nautical Science', 'Port Management'] },
      { name: 'Bahir Dar Institute of Technology (BiT)', depts: ['Hydraulic Engineering', 'Software Engineering', 'Electrical Engineering', 'Mechanical Eng.'] },
      { name: 'EiTEX', depts: ['Textile Engineering', 'Garment Manufacturing', 'Fashion Design'] },
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine', 'Public Health', 'Nursing'] },
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
    campuses: ['Main Campus', 'College of Agriculture (Wondo Genet)', 'College of Medicine & Health', 'IoT Tech Campus'],
    students: '36,000+',
    climate: 'Rift valley lakeside pleasant climate (18°C - 28°C)',
    badge: 'Industrial Corridor Partner',
    heroImage: '/images/categories/aviation_academy.jpg',
    overview: 'A leading university in the southern rift valley adjacent to Lake Hawassa and the Hawassa Industrial Park. Known for high-impact forestry, environmental sciences, agricultural research, and modern medical centers.',
    uniqueFeatures: [
      'Wondo Genet College of Forestry and Natural Resources — premier forestry institute in East Africa.',
      'Hawassa University Comprehensive Specialized Hospital.',
      'Direct training and research collaboration with the Hawassa Industrial Eco-Park.',
    ],
    faculties: [
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine', 'Radiology', 'Pharmacy', 'Midwifery'] },
      { name: 'Institute of Technology (IoT)', depts: ['Computer Science', 'Civil Eng.', 'Textile Engineering'] },
      { name: 'Wondo Genet Forestry', depts: ['Forest Resource Management', 'Agroforestry', 'Wildlife & Ecotourism'] },
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
    campuses: ['Main Campus', 'Arba Minch Water Technology Institute (AWTI)', 'Chamo Campus', 'Nech Sar Campus'],
    students: '26,000+',
    climate: 'Warm tropical lakeside climate (22°C - 32°C)',
    badge: 'National Water Technology Center',
    heroImage: '/images/categories/exit_exam.jpg',
    overview: 'The indisputable national center for water resources engineering and hydrological technology in Ethiopia, home to the internationally recognized Arba Minch Water Technology Institute (AWTI).',
    uniqueFeatures: [
      'Arba Minch Water Technology Institute (AWTI) — trained the engineers behind major Ethiopian dam and irrigation projects.',
      'Premier meteorology and watershed management research station.',
      'Spectacular location between Lake Abaya and Lake Chamo beside Nech Sar National Park.',
    ],
    faculties: [
      { name: 'Water Technology Institute (AWTI)', depts: ['Hydraulic & Water Resources Eng.', 'Irrigation & Drainage Eng.', 'Water Supply & Sanitary Eng.', 'Meteorology'] },
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
    campuses: ['College of Medicine (Chechela)', 'Maraki Campus', 'Teda Campus', 'Atse Tewodros Campus'],
    students: '30,000+',
    climate: 'Cool mountainous highland (14°C - 24°C)',
    badge: 'Pioneer Medical College',
    heroImage: '/images/categories/aau_gat.jpg',
    overview: 'Founded in 1954 as the Public Health College and Training Center, Gondar is Ethiopia’s oldest and most revered medical training institution, famous for comprehensive clinical practice and ophthalmology.',
    uniqueFeatures: [
      'Gondar University Specialized Comprehensive Referral Hospital.',
      'National Center of Excellence in Ophthalmology and Corneal Surgery.',
      'MasterCard Foundation Scholars partner institution for inclusive education.',
    ],
    faculties: [
      { name: 'College of Medicine & Health Sciences', depts: ['Medicine (MD)', 'Anesthesia', 'Ophthalmology', 'Physiotherapy', 'Psychiatry'] },
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

  const filteredUnis = UNIVERSITIES_DIRECTORY.filter(u => {
    if (selectedCategory !== 'all' && u.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q) || u.short.toLowerCase().includes(q) || u.amharic.includes(q);
      const matchCity = u.mainCampus.toLowerCase().includes(q);
      const matchDepts = u.faculties.some(f => f.depts.some(d => d.toLowerCase().includes(q)));
      if (!matchName && !matchCity && !matchDepts) return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              National Institutional Directory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Higher Education Guide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian Universities & Department Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Explore authentic profiles of Ethiopian public universities, degree departments, campuses, unique research centers of excellence, climate, and admission cutoff standards.
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by university name, city, or department (e.g. AAU, Software, Medicine)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
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

      {/* Universities Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnis.map(uni => (
          <div
            key={uni.id}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl transition-all flex flex-col justify-between gap-5 group"
          >
            <div className="space-y-4">
              {/* Header Image & Badges */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={uni.heroImage}
                  alt={uni.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow">
                    {uni.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xl font-black text-white block">{uni.name}</span>
                  <span className="text-xs text-slate-300">{uni.amharic} • Est. {uni.established}</span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Location:</span>
                  <span className="text-slate-200 font-semibold truncate block">{uni.mainCampus}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Students:</span>
                  <span className="text-amber-400 font-bold block">{uni.students}</span>
                </div>
              </div>

              {/* Overview snippet */}
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {uni.overview}
              </p>

              {/* Highlights pills */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Top Colleges & Faculties:
                </span>
                <div className="flex flex-wrap gap-1">
                  {uni.faculties.slice(0, 3).map((f, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {f.name}
                    </span>
                  ))}
                  {uni.faculties.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-400">
                      +{uni.faculties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectingUni(uni)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <span>Explore Campus Profile & Cutoffs</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>

      {/* University Detail Inspection Modal */}
      {inspectingUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0B1527] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-white space-y-5">
            <button
              onClick={() => setInspectingUni(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {inspectingUni.category}
                </span>
                <span className="text-xs text-slate-400">Established {inspectingUni.established}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{inspectingUni.name}</h2>
              <p className="text-xs text-slate-300">{inspectingUni.amharic} • {inspectingUni.mainCampus}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Institutional Overview:</span>
              <p>{inspectingUni.overview}</p>
            </div>

            {/* Unique Excellence Features */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-amber-400 block tracking-wider">
                Unique Features & Centers of Excellence:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {inspectingUni.uniqueFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-amber-400 text-base shrink-0">verified</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Department Directory */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold text-white block tracking-wider">
                Offered Degree Faculties & Departments:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {inspectingUni.faculties.map((fac, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-amber-300 block">{fac.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {fac.depts.map((d, dIdx) => (
                        <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cutoffs & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Cutoff:</span>
                <p className="text-slate-200 mt-1">{inspectingUni.cutoffs}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Climate & Living:</span>
                <p className="text-slate-200 mt-1">{inspectingUni.climate}</p>
              </div>
            </div>

            <button
              onClick={() => setInspectingUni(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
