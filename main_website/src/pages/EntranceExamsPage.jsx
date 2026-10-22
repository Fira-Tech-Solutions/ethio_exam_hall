import React, { useState } from "react";
import ExamModeModal from "../components/exam/ExamModeModal";

const STREAMS = [
  {
    id: "natural",
    name: "Natural Science Stream",
    amharic: "የተፈጥሮ ሳይንስ ዘርፍ",
    icon: "biotech",
    badge: "STEM & Engineering",
    subjects: ["All Subjects", "Mathematics (Natural)", "Physics", "Chemistry", "Biology", "English", "Scholastic Aptitude", "Civics"],
  },
  {
    id: "social",
    name: "Social Science Stream",
    amharic: "የማህበራዊ ሳይንስ ዘርፍ",
    icon: "menu_book",
    badge: "Humanities & Law",
    subjects: ["All Subjects", "Mathematics (Social)", "Geography", "History", "Economics", "English", "Scholastic Aptitude", "Civics"],
  },
];

const ENTRANCE_EXAMS_DATABASE = [
  // Natural Science
  {
    id: 201,
    stream: "natural",
    subject: "Mathematics (Natural)",
    code: "ESUEE-MATH-NAT-2016",
    title: "2016 E.C. Grade 12 National Examination: Mathematics (Natural Science)",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ሂሳብ ፈተና (ተፈጥሮ)",
    year_ec: 2016,
    booklet_code: "BOOKLET-A",
    total_questions: 65,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Calculus, Coordinate Geometry, Vectors & Probability",
    access_tier: "free",
  },
  {
    id: 202,
    stream: "natural",
    subject: "Physics",
    code: "ESUEE-PHYS-2016",
    title: "2016 E.C. Grade 12 National Examination: Physics",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ፊዚክስ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-B",
    total_questions: 60,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Kinematics, Electromagnetism, Wave Optics & Modern Physics",
    access_tier: "free",
  },
  {
    id: 203,
    stream: "natural",
    subject: "Chemistry",
    code: "ESUEE-CHEM-2016",
    title: "2016 E.C. Grade 12 National Examination: Chemistry",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ኬሚስትሪ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-A",
    total_questions: 65,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Equilibrium, Electrochemistry, Organic Polymers & Industrial Chemistry",
    access_tier: "free",
  },
  {
    id: 204,
    stream: "natural",
    subject: "Biology",
    code: "ESUEE-BIO-2016",
    title: "2016 E.C. Grade 12 National Examination: Biology",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ባዮሎጂ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-C",
    total_questions: 70,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Genetics, Physiology, Taxonomy, Ecology & Evolution",
    access_tier: "free",
  },
  {
    id: 205,
    stream: "natural",
    subject: "Scholastic Aptitude",
    code: "ESUEE-APT-NAT-2016",
    title: "2016 E.C. General Scholastic Aptitude Test (Natural Stream)",
    amharic: "የ2016 ዓ.ም የትምህርት አቅም ፈተና (አፕቲቲዩድ)",
    year_ec: 2016,
    booklet_code: "BOOKLET-01",
    total_questions: 60,
    time_limit_minutes: 90,
    passing_score: 50.0,
    domain: "Verbal Reasoning, Quantitative Comparison & Spatial Logic",
    access_tier: "free",
  },
  {
    id: 206,
    stream: "natural",
    subject: "English",
    code: "ESUEE-ENG-2016",
    title: "2016 E.C. Grade 12 National Examination: English Language",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል የእንግሊዘኛ ቋንቋ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-A",
    total_questions: 80,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Reading Comprehension, Vocabulary, Grammar, Structure & Paragraph Organization",
    access_tier: "free",
  },

  // Social Science
  {
    id: 207,
    stream: "social",
    subject: "History",
    code: "ESUEE-HIST-2016",
    title: "2016 E.C. Grade 12 National Examination: History",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ታሪክ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-A",
    total_questions: 65,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Ethiopian History, African Liberation, World Wars & Modern Diplomacy",
    access_tier: "free",
  },
  {
    id: 208,
    stream: "social",
    subject: "Geography",
    code: "ESUEE-GEOG-2016",
    title: "2016 E.C. Grade 12 National Examination: Geography",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ጂኦግራፊ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-B",
    total_questions: 65,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Map Reading, Climatology, Economic Geography of Ethiopia & Horn",
    access_tier: "free",
  },
  {
    id: 209,
    stream: "social",
    subject: "Economics",
    code: "ESUEE-ECON-2016",
    title: "2016 E.C. Grade 12 National Examination: Economics",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ኢኮኖሚክስ ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-A",
    total_questions: 65,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Supply & Demand, Micro Markets, National Income & International Trade",
    access_tier: "free",
  },
  {
    id: 210,
    stream: "social",
    subject: "Mathematics (Social)",
    code: "ESUEE-MATH-SOC-2016",
    title: "2016 E.C. Grade 12 National Examination: Mathematics (Social Stream)",
    amharic: "የ2016 ዓ.ም የ12ኛ ክፍል ሂሳብ ፈተና (ማህበራዊ)",
    year_ec: 2016,
    booklet_code: "BOOKLET-S",
    total_questions: 60,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Business Math, Matrices, Statistics, Probability & Commercial Arithmetic",
    access_tier: "free",
  },
  {
    id: 211,
    stream: "social",
    subject: "Civics",
    code: "ESUEE-CIV-2016",
    title: "2016 E.C. Grade 12 National Examination: Civics & Ethical Education",
    amharic: "የ2016 ዓ.ም የስነ-ምግባርና ዜግነት ትምህርት ፈተና",
    year_ec: 2016,
    booklet_code: "BOOKLET-1",
    total_questions: 70,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Democratic Principles, Federal Constitution, Human Rights & Rule of Law",
    access_tier: "free",
  },
];

export default function EntranceExamsPage() {
  const [selectedStream, setSelectedStream] = useState("natural");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  const activeStreamObj = STREAMS.find(s => s.id === selectedStream);

  const filteredExams = ENTRANCE_EXAMS_DATABASE.filter(exam => {
    if (exam.stream !== selectedStream) return false;
    if (selectedSubject !== "All Subjects" && exam.subject !== selectedSubject) return false;
    if (selectedYear !== "all" && exam.year_ec !== parseInt(selectedYear, 10)) return false;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              EAES National Matriculation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grade 12 ESUEE Past Exam Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Grade 12 University Entrance Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Educational Assessment and Examination Service (EAES) national matriculation papers. Categorized first by academic stream (Natural vs. Social Science), then by individual subject.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-amber-400 font-mono block">600+</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Score</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-emerald-400 font-mono block">Booklets</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">A / B / C / D</span>
          </div>
        </div>
      </div>

      {/* Stream Tabs: Natural Science vs Social Science */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">merge_type</span>
          <span>1. Select Stream</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STREAMS.map(s => {
            const isSelected = selectedStream === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStream(s.id);
                  setSelectedSubject("All Subjects");
                }}
                className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-400 ring-2 ring-amber-400/30 shadow-lg"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isSelected ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.amharic} • {s.badge}</p>
                  </div>
                </div>

                <span className={`material-symbols-outlined text-xl ${isSelected ? "text-amber-400" : "text-slate-600"}`}>
                  {isSelected ? "check_circle" : "chevron_right"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">subject</span>
          <span>2. Select Subject ({activeStreamObj?.name})</span>
        </h2>

        <div className="flex items-center gap-2 flex-wrap p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          {activeStreamObj?.subjects.map(subj => {
            const isSelected = selectedSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exams Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Matriculation Examination Papers</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-amber-400">
              {filteredExams.length} Papers
            </span>
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Year:</span>
            {["all", "2016", "2015"].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-0.5 rounded-md ${
                  selectedYear === yr ? "bg-amber-400 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                }`}
              >
                {yr === "all" ? "All" : `${yr} E.C.`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map(exam => (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {exam.code}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono">
                    {exam.booklet_code}
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

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tested Syllabus Domains:</div>
                  <p className="line-clamp-2 text-slate-300">{exam.domain}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>
                    <span>Questions:</span> <strong className="text-white">{exam.total_questions}</strong>
                  </div>
                  <div>
                    <span>Time:</span> <strong className="text-white">{exam.time_limit_minutes}m</strong>
                  </div>
                  <div>
                    <span>Year:</span> <strong className="text-amber-400">{exam.year_ec} E.C.</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedExamForModal(exam)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
              >
                <span>Launch Exam</span>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          ))}
        </div>
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
