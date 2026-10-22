import React, { useState } from "react";
import ExamModeModal from "../components/exam/ExamModeModal";

const DEPARTMENTS = [
  { id: "cs", name: "Software Engineering & CS", icon: "terminal", badge: "100 Competencies" },
  { id: "law", name: "Law & Jurisprudence", icon: "gavel", badge: "Federal Law" },
  { id: "med", name: "Medicine & Health Sciences", icon: "medical_services", badge: "Clinical Licensing" },
  { id: "ece", name: "Electrical & Computer Eng.", icon: "memory", badge: "Power & Telecom" },
  { id: "acc", name: "Accounting & Finance", icon: "account_balance_wallet", badge: "IFRS Standards" },
  { id: "civil", name: "Civil Engineering", icon: "foundation", badge: "Structures & Hydraulics" },
  { id: "econ", name: "Economics & Management", icon: "trending_up", badge: "Macro & Policy" },
  { id: "pharm", name: "Pharmacy & Nursing", icon: "prescriptions", badge: "Pharmacology" },
];

const EXIT_EXAMS_DATABASE = [
  {
    id: 1,
    deptId: "cs",
    code: "MOE-EXIT-CS-2016",
    title: "2016 E.C. Ethiopian University Exit Examination: Computer Science & Software Engineering",
    amharic: "የ2016 ዓ.ም የኮምፒውተር ሳይንስ መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Software Engineering, Systems, Networks & Databases",
    booklet_code: "01-CS",
    access_tier: "free",
  },
  {
    id: 2,
    deptId: "law",
    code: "MOE-EXIT-LAW-2016",
    title: "2016 E.C. Ethiopian University Exit Examination: Law & Jurisprudence",
    amharic: "የ2016 ዓ.ም የህግ መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 150,
    passing_score: 50.0,
    domain: "Constitutional Law, Criminal Law, Civil Code & International Law",
    booklet_code: "03-LAW",
    access_tier: "pro",
  },
  {
    id: 3,
    deptId: "med",
    code: "MOE-EXIT-MED-2016",
    title: "2016 E.C. Medical Doctor Licensing & Exit Examination: Medicine & Surgery",
    amharic: "የህክምና ዶክትሬት እና ፈቃድ ፈተና",
    institution: "Ministry of Health & MoE",
    year_ec: 2016,
    total_questions: 120,
    time_limit_minutes: 180,
    passing_score: 60.0,
    domain: "Internal Medicine, Surgery, Pediatrics & Obstetrics",
    booklet_code: "MED-01",
    access_tier: "pro",
  },
  {
    id: 4,
    deptId: "ece",
    code: "MOE-EXIT-ECE-2016",
    title: "2016 E.C. Electrical & Computer Engineering Exit Examination: Power, Control & Communications",
    amharic: "የኤሌክትሪካልና ኮምፒውተር ምህንድስና መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 150,
    passing_score: 50.0,
    domain: "Signals & Systems, Microprocessors, Electromagnetics & Digital Design",
    booklet_code: "ECE-02",
    access_tier: "free",
  },
  {
    id: 5,
    deptId: "acc",
    code: "MOE-EXIT-ACC-2016",
    title: "2016 E.C. Accounting & Finance Exit Examination: Financial Accounting, Cost Accounting & Audit",
    amharic: "የአካውንቲንግና ፋይናንስ መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "IFRS Accounting, Financial Management, Tax Systems & Auditing",
    booklet_code: "ACC-01",
    access_tier: "free",
  },
  {
    id: 6,
    deptId: "civil",
    code: "MOE-EXIT-CIVIL-2016",
    title: "2016 E.C. Civil Engineering Exit Examination: Structural Analysis, Geotechnical & Hydraulics",
    amharic: "የሲቪል ምህንድስና መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 150,
    passing_score: 50.0,
    domain: "Structural Mechanics, Reinforced Concrete, Highway Design & Water Resources",
    booklet_code: "CIVIL-04",
    access_tier: "pro",
  },
  {
    id: 7,
    deptId: "econ",
    code: "MOE-EXIT-ECON-2016",
    title: "2016 E.C. Economics Exit Examination: Microeconomics, Macroeconomics & Econometrics",
    amharic: "የኢኮኖሚክስ መውጫ ፈተና",
    institution: "Ministry of Education (MoE)",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 120,
    passing_score: 50.0,
    domain: "Macro Policy, Development Economics, Mathematical Economics & Statistics",
    booklet_code: "ECON-01",
    access_tier: "free",
  },
  {
    id: 8,
    deptId: "pharm",
    code: "MOE-EXIT-PHARM-2016",
    title: "2016 E.C. Pharmacy Exit Examination: Pharmacotherapy, Pharmaceutics & Clinical Chemistry",
    amharic: "የፋርማሲ መውጫ ፈተና",
    institution: "Ministry of Health & MoE",
    year_ec: 2016,
    total_questions: 100,
    time_limit_minutes: 150,
    passing_score: 50.0,
    domain: "Clinical Pharmacotherapy, Drug Delivery, Toxicology & Pharmacy Law",
    booklet_code: "PHARM-01",
    access_tier: "pro",
  },
];

export default function ExitExamsPage() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  const filteredExams = EXIT_EXAMS_DATABASE.filter(exam => {
    if (selectedDept !== "all" && exam.deptId !== selectedDept) return false;
    if (selectedYear !== "all" && exam.year_ec !== parseInt(selectedYear, 10)) return false;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              MoE National Assessment
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Graduate Exit Exam Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian University Exit Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Ministry of Education official standardized exit examinations for undergraduate graduating classes across all accredited programs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-amber-400 font-mono block">50%</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">National Cutoff</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-sky-400 font-mono block">100</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Items</span>
          </div>
        </div>
      </div>

      {/* Department Selection Pills */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">school</span>
          <span>Categorized by Academic Department</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedDept("all")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 ${
              selectedDept === "all"
                ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-xl">dataset</span>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">All Departments</span>
              <span className="text-[10px] opacity-80">Full National Repository</span>
            </div>
          </button>

          {DEPARTMENTS.map(dept => {
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isSelected ? "text-slate-950" : "text-amber-400"}`}>
                  {dept.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{dept.name}</span>
                  <span className="text-[10px] opacity-75">{dept.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Academic Year:</span>
          {["all", "2016", "2015"].map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedYear === year ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {year === "all" ? "All Years" : `${year} E.C.`}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredExams.length} Papers
        </span>
      </div>

      {/* Exit Exams Grid */}
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
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {exam.year_ec} E.C.
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
                <div className="text-[10px] uppercase font-bold text-slate-400">Tested Blueprint Domain:</div>
                <p className="line-clamp-2 text-slate-300">{exam.domain}</p>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div>
                  <span>Items:</span> <strong className="text-white">{exam.total_questions}</strong>
                </div>
                <div>
                  <span>Time:</span> <strong className="text-white">{exam.time_limit_minutes}m</strong>
                </div>
                <div>
                  <span>Pass:</span> <strong className="text-emerald-400">{exam.passing_score}%</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedExamForModal(exam)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
            >
              <span>Take Exit Exam</span>
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </div>
        ))}
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
