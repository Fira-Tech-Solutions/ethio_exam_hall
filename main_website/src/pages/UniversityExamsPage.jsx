import React, { useState } from 'react';
import ExamModeModal from '../components/exam/ExamModeModal';

const ETHIOPIAN_UNIVERSITIES = [
  {
    id: 'aau',
    name: 'Addis Ababa University',
    short: 'AAU',
    amharic: 'አዲስ አበባ ዩኒቨርሲቲ',
    city: 'Addis Ababa (Sidist Kilo)',
    established: 1950,
    logo: '/images/categories/aau_gat.jpg',
    accent: 'from-blue-600 to-indigo-800',
    crestColor: 'bg-blue-900',
    badge: 'Premier Research Univ',
  },
  {
    id: 'astu',
    name: 'Adama Science & Technology University',
    short: 'ASTU',
    amharic: 'አዳማ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
    city: 'Adama, Oromia',
    established: 1993,
    logo: '/images/categories/tvet_coc.jpg',
    accent: 'from-emerald-600 to-teal-800',
    crestColor: 'bg-emerald-900',
    badge: 'Center of Excellence (CoE)',
  },
  {
    id: 'aastu',
    name: 'Addis Ababa Science & Technology University',
    short: 'AASTU',
    amharic: 'አዲስ አበባ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ',
    city: 'Addis Ababa (Kilinto)',
    established: 2011,
    logo: '/images/categories/exit_exam.jpg',
    accent: 'from-amber-600 to-yellow-800',
    crestColor: 'bg-amber-900',
    badge: 'Applied STEM Center',
  },
  {
    id: 'ju',
    name: 'Jimma University',
    short: 'JU',
    amharic: 'ጅማ ዩኒቨርሲቲ',
    city: 'Jimma, Oromia',
    established: 1999,
    logo: '/images/categories/banking_aptitude.jpg',
    accent: 'from-purple-600 to-pink-800',
    crestColor: 'bg-purple-900',
    badge: 'Community-Based Education',
  },
  {
    id: 'bdu',
    name: 'Bahir Dar University',
    short: 'BDU',
    amharic: 'ባህር ዳር ዩኒቨርሲቲ',
    city: 'Bahir Dar, Amhara',
    established: 2000,
    logo: '/images/categories/grade12_esuee.jpg',
    accent: 'from-cyan-600 to-blue-800',
    crestColor: 'bg-cyan-900',
    badge: 'Maritime & Engineering',
  },
  {
    id: 'hu',
    name: 'Hawassa University',
    short: 'HU',
    amharic: 'ሀዋሳ ዩኒቨርሲቲ',
    city: 'Hawassa, Sidama',
    established: 2000,
    logo: '/images/categories/aviation_academy.jpg',
    accent: 'from-rose-600 to-red-800',
    crestColor: 'bg-rose-900',
    badge: 'Agro-Tech & Medicine',
  },
  {
    id: 'mu',
    name: 'Mekelle University',
    short: 'MU',
    amharic: 'መቐለ ዩኒቨርሲቲ',
    city: 'Mekelle, Tigray',
    established: 2000,
    logo: '/images/categories/aau_gat.jpg',
    accent: 'from-orange-600 to-amber-800',
    crestColor: 'bg-orange-900',
    badge: 'Veterinary & Engineering',
  },
  {
    id: 'haramaya',
    name: 'Haramaya University',
    short: 'HrU',
    amharic: 'ሐረማያ ዩኒቨርሲቲ',
    city: 'Haramaya, Oromia',
    established: 1954,
    logo: '/images/categories/exit_exam.jpg',
    accent: 'from-green-600 to-emerald-800',
    crestColor: 'bg-green-900',
    badge: 'Pioneer Agricultural Institute',
  },
];

const FRESHMAN_EXAMS_DATABASE = [
  {
    id: 101,
    uniId: 'aau',
    code: 'MATH-1011',
    title: 'Applied Mathematics I: Single Variable Calculus & Analytical Geometry',
    amharic: 'የተግባራዊ ሂሳብ 1 ፈተና',
    course: 'Mathematics',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 50,
    time_limit_minutes: 120,
    credit_hours: 4,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 102,
    uniId: 'aau',
    code: 'PHYS-1011',
    title: 'General Physics: Mechanics, Fluid Dynamics & Thermodynamics',
    amharic: 'አጠቃላይ ፊዚክስ ፈተና',
    course: 'Physics',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 45,
    time_limit_minutes: 120,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 103,
    uniId: 'aau',
    code: 'CoS-1012',
    title: 'Introduction to Computer Programming: Python & Problem Solving',
    amharic: 'የኮምፒውተር ፕሮግራሚንግ መግቢያ',
    course: 'Computer Science',
    semester: 'Semester II',
    term: 'Midterm Exam',
    year_ec: 2016,
    total_questions: 40,
    time_limit_minutes: 90,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'pro',
  },
  {
    id: 104,
    uniId: 'aau',
    code: 'LOGIC-1011',
    title: 'Critical Thinking & Logic: Deductive and Inductive Arguments',
    amharic: 'ሎጂክ እና ሂሳዊ አስተሳሰብ',
    course: 'Philosophy',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2015,
    total_questions: 60,
    time_limit_minutes: 90,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 105,
    uniId: 'astu',
    code: 'ENGR-MATH-I',
    title: 'ASTU Engineering Mathematics I: Calculus & Infinite Series',
    amharic: 'አዳማ ዩኒቨርሲቲ ኢንጂነሪንግ ሂሳብ',
    course: 'Mathematics',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 50,
    time_limit_minutes: 150,
    credit_hours: 4,
    passing_score: 60.0,
    access_tier: 'pro',
  },
  {
    id: 106,
    uniId: 'astu',
    code: 'CHEM-1011',
    title: 'General Chemistry for Engineering Disciplines: Atomic Structure & Kinetics',
    amharic: 'አጠቃላይ ኬሚስትሪ ፈተና',
    course: 'Chemistry',
    semester: 'Semester I',
    term: 'Midterm Exam',
    year_ec: 2016,
    total_questions: 45,
    time_limit_minutes: 100,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 107,
    uniId: 'aastu',
    code: 'AASTU-CP-101',
    title: 'AASTU Applied Computing: C++ Fundamentals, Algorithms & Pointers',
    amharic: 'የአዲስ አበባ ሳይንስና ቴክኖሎጂ ሲ++ ፕሮግራሚንግ',
    course: 'Computer Science',
    semester: 'Semester II',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 50,
    time_limit_minutes: 120,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'pro',
  },
  {
    id: 108,
    uniId: 'ju',
    code: 'JU-ENGL-101',
    title: 'Communicative English Language Skills I: Reading & Technical Writing',
    amharic: 'የእንግሊዘኛ ቋንቋ ክህሎት 1',
    course: 'English',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 60,
    time_limit_minutes: 90,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 109,
    uniId: 'bdu',
    code: 'BDU-GEOG-101',
    title: 'Geography of Ethiopia & the Horn: Topography, Climate & Demographics',
    amharic: 'የኢትዮጵያና የቀንድ አፍሪካ ጂኦግራፊ',
    course: 'Geography',
    semester: 'Semester II',
    term: 'Final Exam',
    year_ec: 2016,
    total_questions: 50,
    time_limit_minutes: 90,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
  {
    id: 110,
    uniId: 'hu',
    code: 'HU-MCIV-101',
    title: 'Moral & Citizenship Education: Ethics, Constitutional Values & Society',
    amharic: 'ስነ-ምግባርና የዜግነት ትምህርት',
    course: 'Civics',
    semester: 'Semester I',
    term: 'Final Exam',
    year_ec: 2015,
    total_questions: 50,
    time_limit_minutes: 90,
    credit_hours: 3,
    passing_score: 50.0,
    access_tier: 'free',
  },
];

export default function UniversityExamsPage() {
  const [selectedUni, setSelectedUni] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  const filteredExams = FRESHMAN_EXAMS_DATABASE.filter(exam => {
    if (selectedUni !== 'all' && exam.uniId !== selectedUni) return false;
    if (selectedCourse !== 'all' && exam.course !== selectedCourse) return false;
    if (selectedSemester !== 'all' && exam.semester !== selectedSemester) return false;
    return true;
  });

  const activeUniObj = ETHIOPIAN_UNIVERSITIES.find(u => u.id === selectedUni);

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Freshman Program Repository
            </span>
            <span className="text-xs text-slate-400 font-mono">
              All 45+ Public Universities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian University Freshman Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Select your university crest to explore verified freshman past papers, midterms, and finals. Launch in self-paced Practice Mode with AI tutoring or Locked Exam Simulation Mode.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-amber-400 font-mono block">120+</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Freshman Papers</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-emerald-400 font-mono block">100%</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MoE Blueprint</span>
          </div>
        </div>
      </div>

      {/* University Emblems Selector Ribbon */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">account_balance</span>
            <span>Select University Crest</span>
          </h2>
          {selectedUni !== 'all' && (
            <button
              onClick={() => setSelectedUni('all')}
              className="text-xs text-amber-400 hover:underline"
            >
              Reset to All Universities
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ETHIOPIAN_UNIVERSITIES.map((uni) => {
            const isSelected = selectedUni === uni.id;
            return (
              <button
                key={uni.id}
                onClick={() => setSelectedUni(isSelected ? 'all' : uni.id)}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all text-center relative group ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Crest / Logo */}
                <div className={`w-14 h-14 rounded-2xl overflow-hidden border p-1 flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isSelected ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700 bg-slate-800'
                }`}>
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="font-black text-sm text-white block group-hover:text-amber-400 transition-colors">
                    {uni.short}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block max-w-[90px]">
                    {uni.city.split(',')[0]}
                  </span>
                </div>

                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs: Course & Semester */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1">Freshman Course:</span>
          {['all', 'Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'English', 'Philosophy'].map(course => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCourse === course
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {course === 'all' ? 'All Courses' : course}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Semester:</span>
          {['all', 'Semester I', 'Semester II'].map(sem => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedSemester === sem ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sem === 'all' ? 'All Terms' : sem}
            </button>
          ))}
        </div>
      </div>

      {/* University Exam Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Freshman Examinations</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-amber-400">
              {filteredExams.length} Available
            </span>
          </h3>
          {activeUniObj && (
            <span className="text-xs text-slate-400">
              Filtering by: <strong className="text-white">{activeUniObj.name}</strong>
            </span>
          )}
        </div>

        {filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-600">search_off</span>
            <p className="text-sm font-semibold">No freshman exams match your current filters.</p>
            <button
              onClick={() => { setSelectedUni('all'); setSelectedCourse('all'); setSelectedSemester('all'); }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam) => {
              const uni = ETHIOPIAN_UNIVERSITIES.find(u => u.id === exam.uniId);
              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {exam.code}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {exam.semester}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400">
                        {exam.term}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                        {exam.title}
                      </h4>
                      {exam.amharic && (
                        <p className="text-xs text-slate-400 mt-1">{exam.amharic}</p>
                      )}
                    </div>

                    {/* University Crest & Details */}
                    {uni && (
                      <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800">
                        <img
                          src={uni.logo}
                          alt={uni.short}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                        />
                        <div className="text-xs min-w-0">
                          <span className="font-bold text-slate-200 block truncate">{uni.name}</span>
                          <span className="text-[10px] text-slate-400">{uni.badge}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div>
                        <span>Items:</span> <strong className="text-white">{exam.total_questions}</strong>
                      </div>
                      <div>
                        <span>Time:</span> <strong className="text-white">{exam.time_limit_minutes}m</strong>
                      </div>
                      <div>
                        <span>Cr.Hr:</span> <strong className="text-amber-400">{exam.credit_hours}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedExamForModal(exam)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
                  >
                    <span>Start Exam</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mode Selector Modal */}
      <ExamModeModal
        isOpen={Boolean(selectedExamForModal)}
        onClose={() => setSelectedExamForModal(null)}
        exam={selectedExamForModal}
      />
    </div>
  );
}
