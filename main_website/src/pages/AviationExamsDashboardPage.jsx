import React, { useState } from "react";
import ExamModeModal from "../components/exam/ExamModeModal";

const AVIATION_ROLES = [
  { id: "pilot", name: "Commercial Pilot Cadet", code: "CPL", icon: "flight_takeoff", badge: "Cadet Track" },
  { id: "amt", name: "Aircraft Maintenance (AMT)", code: "AMT", icon: "engineering", badge: "Licensed Technician" },
  { id: "cabin", name: "Cabin Crew & Safety", code: "CC", icon: "airline_seat_recline_extra", badge: "Service & Safety" },
  { id: "marketing", name: "Commercial & Airline Marketing", code: "MKT", icon: "campaign", badge: "Sales & Cargo" },
  { id: "dispatcher", name: "Flight Operations & Dispatch", code: "FOD", icon: "navigation", badge: "Navigation & Meteorology" },
];

const AVIATION_EXAMS = [
  // Pilot Cadet
  {
    id: 7,
    roleId: "pilot",
    stage: "written",
    code: "EAA-CADET-2024",
    title: "Ethiopian Aviation Academy Pilot Cadet Entrance Examination: Aptitude & Technical Physics",
    amharic: "የፓይለት ካዴት መግቢያ ፈተና",
    total_questions: 75,
    time_limit_minutes: 90,
    passing_score: 70.0,
    domain: "Aerodynamics, Basic Flight Mechanics, Applied Physics & Vectors",
    booklet_code: "CADET-777",
    access_tier: "pro",
  },
  {
    id: 301,
    roleId: "pilot",
    stage: "aptitude",
    code: "EAA-PILOT-SPATIAL",
    title: "Pilot Spatial Orientation & Psychomotor Aptitude Benchmark",
    amharic: "የፓይለት ስፓሻል እና አቅጣጫ መለየት ፈተና",
    total_questions: 50,
    time_limit_minutes: 60,
    passing_score: 75.0,
    domain: "Artificial Horizon Interpretation, Altimeter Cross-Check & Compass Turns",
    booklet_code: "SPATIAL-M1",
    access_tier: "pro",
  },

  // AMT
  {
    id: 8,
    roleId: "amt",
    stage: "written",
    code: "EAA-AMT-TECH-2024",
    title: "Aircraft Maintenance Technician (AMT) Entrance Exam: Applied Mechanics & Electrical Systems",
    amharic: "የአውሮፕላን ጥገና ቴክኒሽያን መግቢያ ፈተና",
    total_questions: 60,
    time_limit_minutes: 90,
    passing_score: 65.0,
    domain: "Turbine Engine Principles, Hydraulics, Pneumatics & AC/DC Avionics",
    booklet_code: "AMT-101",
    access_tier: "pro",
  },
  {
    id: 302,
    roleId: "amt",
    stage: "aptitude",
    code: "EAA-AMT-MECH-APT",
    title: "AMT Mechanical Comprehension & Spatial Reasoning Suite",
    amharic: "የጥገና ቴክኒሽያን ሜካኒካል ክህሎት መፈተሻ",
    total_questions: 50,
    time_limit_minutes: 60,
    passing_score: 70.0,
    domain: "Gear Ratios, Pulley Systems, Fluid Flow & Electrical Schematic Tracing",
    booklet_code: "MECH-02",
    access_tier: "pro",
  },

  // Cabin Crew
  {
    id: 303,
    roleId: "cabin",
    stage: "written",
    code: "EAA-CC-ENGLISH",
    title: "Cabin Crew English Proficiency, Geography & First Aid Fundamentals",
    amharic: "የበረራ አስተናጋጅ የእንግሊዘኛ እና የመጀመሪያ ህክምና ፈተና",
    total_questions: 60,
    time_limit_minutes: 60,
    passing_score: 70.0,
    domain: "In-Flight English, World Time Zones, IATA Airport Codes & Emergency Response",
    booklet_code: "CC-ENG-1",
    access_tier: "free",
  },

  // Marketing
  {
    id: 304,
    roleId: "marketing",
    stage: "written",
    code: "EAA-MKT-COMM",
    title: "Commercial Aviation & Cargo Sales Trainee Aptitude Assessment",
    amharic: "የአየር መንገድ ንግድና ገበያ ስራ ቅጥር ፈተና",
    total_questions: 50,
    time_limit_minutes: 60,
    passing_score: 65.0,
    domain: "Revenue Management, Air Cargo Logistics, Passenger Tariffs & Communication",
    booklet_code: "MKT-01",
    access_tier: "free",
  },

  // Dispatcher
  {
    id: 305,
    roleId: "dispatcher",
    stage: "written",
    code: "EAA-DISPATCH-2024",
    title: "Flight Operations Officer & Dispatcher Entrance: Meteorology & Flight Planning",
    amharic: "የበረራ መቆጣጠሪያና ስምሪት መግቢያ ፈተና",
    total_questions: 60,
    time_limit_minutes: 90,
    passing_score: 75.0,
    domain: "METAR / TAF Decoding, Aircraft Weight & Balance, En-Route Nav Charts",
    booklet_code: "FOD-2024",
    access_tier: "pro",
  },
];

const INTERVIEW_RUBRICS = [
  {
    role: "Commercial Pilot Cadet",
    stage: "Panel Interview & Oral Technical Exam",
    duration: "45 Minutes",
    focus: "Decision Making Under Pressure, English Fluency, Spatial Logic",
    questions: [
      {
        q: "Why do you want to become an airline pilot for Ethiopian Airlines rather than pursue an engineering or academic career?",
        rationale: "Assesses long-term commitment, passion, resilience, and genuine loyalty to the national carrier.",
        tips: "Demonstrate knowledge of Ethiopian Airlines modern fleet (Airbus A350, Boeing 787/777X) and show high emotional stability.",
      },
      {
        q: "Describe a situation where you had to make a critical decision with incomplete information under strict time pressure.",
        rationale: "Evaluates Aeronautical Decision Making (ADM) and Crew Resource Management (CRM) mindset.",
        tips: "Use the STAR method (Situation, Task, Action, Result). Emphasize safety protocols and team communication.",
      },
      {
        q: "Explain what causes an aerodynamic stall in simple terms, and how an aviator recovers from it.",
        rationale: "Tests fundamental physics comprehension and clear explanatory capability in English.",
        tips: "Define Critical Angle of Attack (AoA) where airflow separates from the upper wing surface, reducing lift. Recovery involves reducing AoA (pitch down) and adding thrust.",
      },
    ],
  },
  {
    role: "Aircraft Maintenance Technician (AMT)",
    stage: "Technical Board & Practical Assessment",
    duration: "30 Minutes",
    focus: "Attention to Detail, Safety Regulations, Tooling Discipline",
    questions: [
      {
        q: "If you detect a hairline crack on an engine cowling that is not mentioned in the immediate work order, what is your course of action?",
        rationale: "Tests uncompromising safety culture and adherence to Aircraft Maintenance Manuals (AMM).",
        tips: "Never ignore defects. Document the observation, cross-reference the Structural Repair Manual (SRM), and notify the lead certifying engineer immediately.",
      },
      {
        q: "Explain the difference between a turbofan and a turboprop engine, and where each is optimal.",
        rationale: "Tests practical powerplant knowledge.",
        tips: "Turbofans are ideal for high-altitude, high-speed commercial transports. Turboprops excel at short-haul, regional operations with high propulsive efficiency at lower airspeeds.",
      },
    ],
  },
  {
    role: "Cabin Crew & Safety",
    stage: "Group Dynamics, Personal Grooming & Stress Interview",
    duration: "30 Minutes",
    focus: "Customer Empathy, De-escalation, Safety Mindset, Team Collaboration",
    questions: [
      {
        q: "How would you handle a passenger who refuses to fasten their seatbelt during turbulent descent into Addis Ababa Bole International Airport?",
        rationale: "Tests polite assertiveness, passenger safety compliance, and emotional composure.",
        tips: "Maintain calm professional tone, clearly state civil aviation safety requirements, explain turbulence risks, and if non-compliant, inform Senior Cabin Crew Member.",
      },
    ],
  },
];

export default function AviationExamsDashboardPage() {
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all"); // all, written, aptitude, interview
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  const filteredExams = AVIATION_EXAMS.filter(exam => {
    if (selectedRole !== "all" && exam.roleId !== selectedRole) return false;
    if (selectedStage !== "all" && exam.stage !== selectedStage) return false;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A162B] to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Ethiopian Aviation University
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Official Cadet & Technical Arena
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian Airlines Aviation Examinations & Interview Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Prepare for Ethiopian Airlines entrance competitions: Pilot Cadet, AMT, Cabin Crew, and Airline Operations. Practice written tests, psychomotor aptitudes, and official interview rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-amber-400 font-mono block">EAA</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">ICAO Certified</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-lg font-black text-emerald-400 font-mono block">3 Stages</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Written / Apt / Interview</span>
          </div>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">flight</span>
          <span>1. Select Aviation Discipline</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedRole("all")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
              selectedRole === "all"
                ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-xl">hub</span>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">All Disciplines</span>
              <span className="text-[10px] opacity-75">Full Academy</span>
            </div>
          </button>

          {AVIATION_ROLES.map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isSelected ? "text-slate-950" : "text-amber-400"}`}>
                  {role.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{role.name}</span>
                  <span className="text-[10px] opacity-75">{role.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1">Stage Assessment:</span>
          {[
            { id: "all", label: "All Stages", icon: "view_agenda" },
            { id: "written", label: "Stage 1: Written Exam", icon: "edit_document" },
            { id: "aptitude", label: "Stage 2: Spatial Aptitude", icon: "explore" },
            { id: "interview", label: "Stage 3: Interview Practice", icon: "record_voice_over" },
          ].map(stage => {
            const isSelected = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{stage.icon}</span>
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-slate-400">
          Ethiopian Airlines Standards
        </span>
      </div>

      {/* Examination Grid (Stages 1 & 2) */}
      {(selectedStage === "all" || selectedStage === "written" || selectedStage === "aptitude") && (
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Written & Aptitude Competitions</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-amber-400">
              {filteredExams.length} Exams
            </span>
          </h3>

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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 uppercase tracking-wider">
                      {exam.stage === "written" ? "Stage 1: Written" : "Stage 2: Spatial"}
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
                    <div className="text-[10px] uppercase font-bold text-slate-400">Competency Domain:</div>
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
                      <span>Cutoff:</span> <strong className="text-emerald-400">{exam.passing_score}%</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExamForModal(exam)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
                >
                  <span>Launch Aviation Test</span>
                  <span className="material-symbols-outlined text-sm">flight</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 3: Interview Practice & Panel Rubrics */}
      {(selectedStage === "all" || selectedStage === "interview") && (
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">record_voice_over</span>
                <span>Stage 3: Interview Practice & Panel Rubrics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic interview questions asked by Ethiopian Airlines senior captains, HR directors, and chief engineers.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Oral Assessment Prep
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {INTERVIEW_RUBRICS.map((rubric, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-5 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-sm">
                      {rubric.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {rubric.duration}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Assessment Focus:</span>
                    <p className="text-slate-300">{rubric.focus}</p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Sample Board Questions:
                    </span>
                    {rubric.questions.map((item, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold text-xs shrink-0">{qIdx + 1}.</span>
                          <p className="text-xs font-bold text-slate-100">{item.q}</p>
                        </div>
                        <div className="pl-4 text-[11px] text-slate-400 space-y-1 border-l-2 border-amber-500/40">
                          <p><strong className="text-slate-300">Why Asked:</strong> {item.rationale}</p>
                          <p><strong className="text-emerald-400">Winning Strategy:</strong> {item.tips}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Interactive AI Interview Simulator</span>
                  <span className="font-bold text-amber-400">Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selector Modal */}
      <ExamModeModal
        isOpen={Boolean(selectedExamForModal)}
        onClose={() => setSelectedExamForModal(null)}
        exam={selectedExamForModal}
      />
    </div>
  );
}
