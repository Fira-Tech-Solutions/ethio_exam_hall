import React, { useState } from 'react';

const ETHIOPIAN_GRADES = [
  { grade: 'A+', points: 4.0, label: 'A+ (90-100% • 4.0 pts)' },
  { grade: 'A', points: 4.0, label: 'A (85-89% • 4.0 pts)' },
  { grade: 'A-', points: 3.75, label: 'A- (80-84% • 3.75 pts)' },
  { grade: 'B+', points: 3.5, label: 'B+ (75-79% • 3.5 pts)' },
  { grade: 'B', points: 3.0, label: 'B (70-74% • 3.0 pts)' },
  { grade: 'B-', points: 2.75, label: 'B- (65-69% • 2.75 pts)' },
  { grade: 'C+', points: 2.5, label: 'C+ (60-64% • 2.5 pts)' },
  { grade: 'C', points: 2.0, label: 'C (50-59% • 2.0 pts)' },
  { grade: 'C-', points: 1.75, label: 'C- (45-49% • 1.75 pts)' },
  { grade: 'D', points: 1.0, label: 'D (40-44% • 1.0 pt)' },
  { grade: 'Fx', points: 0.0, label: 'Fx (30-39% • 0.0 pts)' },
  { grade: 'F', points: 0.0, label: 'F (< 30% • 0.0 pts)' },
];

const PRESET_COURSES = {
  freshman_sem1: [
    { code: 'MATH-1011', name: 'Applied Mathematics I', credit: 4, grade: 'A' },
    { code: 'PHYS-1011', name: 'General Physics', credit: 3, grade: 'A-' },
    { code: 'ENGL-1011', name: 'Communicative English Skills I', credit: 3, grade: 'B+' },
    { code: 'LOGIC-1011', name: 'Critical Thinking & Logic', credit: 3, grade: 'A' },
    { code: 'MCIV-1011', name: 'Moral and Civics Education', credit: 3, grade: 'A' },
    { code: 'GEOG-1011', name: 'Geography of Ethiopia & Horn', credit: 3, grade: 'B+' },
  ],
  freshman_sem2: [
    { code: 'MATH-1012', name: 'Applied Mathematics II', credit: 4, grade: 'A' },
    { code: 'CoS-1012', name: 'Intro to Computer Programming', credit: 3, grade: 'A' },
    { code: 'CHEM-1012', name: 'General Chemistry', credit: 3, grade: 'B+' },
    { code: 'ENGL-1012', name: 'Communicative English Skills II', credit: 3, grade: 'A-' },
    { code: 'SNIE-1012', name: 'Inclusiveness & Special Needs', credit: 2, grade: 'A' },
    { code: 'HLTH-1012', name: 'Physical Fitness & Wellness', credit: 2, grade: 'A+' },
  ],
};

export default function GpaCalculatorPage() {
  const [courses, setCourses] = useState(PRESET_COURSES.freshman_sem1);
  const [prevCredits, setPrevCredits] = useState('');
  const [prevCgpa, setPrevCgpa] = useState('');

  // Course management
  const handleAddCourse = () => {
    setCourses(prev => [
      ...prev,
      { code: `COURSE-${prev.length + 1}`, name: 'New Course', credit: 3, grade: 'A' },
    ]);
  };

  const handleRemoveCourse = (idx) => {
    setCourses(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCourseChange = (idx, field, value) => {
    setCourses(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const loadPreset = (presetKey) => {
    if (PRESET_COURSES[presetKey]) {
      setCourses(PRESET_COURSES[presetKey]);
    }
  };

  // Semester GPA Calculation
  const totalSemesterCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credit) || 0), 0);
  const totalSemesterPoints = courses.reduce((sum, c) => {
    const gradeObj = ETHIOPIAN_GRADES.find(g => g.grade === c.grade) || { points: 0.0 };
    return sum + (gradeObj.points * (parseFloat(c.credit) || 0));
  }, 0);

  const semesterGpa = totalSemesterCredits > 0 ? (totalSemesterPoints / totalSemesterCredits) : 0.0;

  // Cumulative GPA (CGPA) Calculation
  const pCred = parseFloat(prevCredits) || 0;
  const pGpa = parseFloat(prevCgpa) || 0;
  const totalCumulativeCredits = pCred + totalSemesterCredits;
  const totalCumulativePoints = (pCred * pGpa) + totalSemesterPoints;
  const cumulativeGpa = totalCumulativeCredits > 0 ? (totalCumulativePoints / totalCumulativeCredits) : semesterGpa;

  // Honors & Academic Standing
  const evaluateStanding = (gpa) => {
    if (gpa >= 3.75) {
      return { title: 'Very Great Distinction', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', desc: 'Highest Academic Honors (Magna Cum Laude)' };
    }
    if (gpa >= 3.50) {
      return { title: 'Great Distinction', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'Honor Roll Standing (Cum Laude)' };
    }
    if (gpa >= 3.25) {
      return { title: 'Distinction', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30', desc: 'Superior Academic Achievement' };
    }
    if (gpa >= 2.00) {
      return { title: 'Satisfactory / First Class', color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700', desc: 'Good Standing in Higher Education Ministry Regulations' };
    }
    return { title: 'Academic Probation / Warning', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', desc: 'CGPA below 2.00 threshold requires remedial semester' };
  };

  const standing = evaluateStanding(cumulativeGpa);

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              National 4.0 Scale
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Ethiopian Higher Education Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ethiopian University GPA & CGPA Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Calculates semester and cumulative GPA configured strictly to Ethiopian public & private university academic legislation (A+ = 4.0, A- = 3.75, B+ = 3.5, etc.) with honors standing.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadPreset('freshman_sem1')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition-colors"
          >
            Freshman Sem 1 Preset
          </button>
          <button
            onClick={() => loadPreset('freshman_sem2')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-sky-300 transition-colors"
          >
            Freshman Sem 2 Preset
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator Workstation (8 cols) & Results Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Courses Table (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Semester Course List</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {courses.length} Courses • {totalSemesterCredits} Total Credit Hours
                </span>
              </div>
              <button
                onClick={handleAddCourse}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 shadow"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Course</span>
              </button>
            </div>

            {/* Courses Rows */}
            <div className="space-y-2.5">
              {courses.map((course, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-colors hover:border-slate-700"
                >
                  {/* Course Code */}
                  <div className="w-full sm:w-32">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block sm:hidden">Code</label>
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => handleCourseChange(idx, 'code', e.target.value)}
                      placeholder="MATH-101"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Course Title */}
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block sm:hidden">Title</label>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                      placeholder="Course Title"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Credit Hours (Cr.Hr.) */}
                  <div className="w-full sm:w-24">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block sm:hidden">Credit</label>
                    <select
                      value={course.credit}
                      onChange={(e) => handleCourseChange(idx, 'credit', parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6].map(cr => (
                        <option key={cr} value={cr}>{cr} Cr.Hr</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div className="w-full sm:w-28">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block sm:hidden">Grade</label>
                    <select
                      value={course.grade}
                      onChange={(e) => handleCourseChange(idx, 'grade', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-400 focus:outline-none focus:border-amber-400"
                    >
                      {ETHIOPIAN_GRADES.map(g => (
                        <option key={g.grade} value={g.grade}>{g.grade} ({g.points})</option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Action */}
                  <button
                    onClick={() => handleRemoveCourse(idx)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-end sm:self-center"
                    title="Remove course"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Optional Cumulative CGPA Inputs */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Cumulative CGPA Projection (Optional):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Previous Total Credit Hours:</label>
                  <input
                    type="number"
                    value={prevCredits}
                    onChange={(e) => setPrevCredits(e.target.value)}
                    placeholder="e.g. 34 Cr.Hr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Previous Cumulative GPA (CGPA):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prevCgpa}
                    onChange={(e) => setPrevCgpa(e.target.value)}
                    placeholder="e.g. 3.65"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Results & Honors Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-24">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Academic Performance Summary
            </h3>

            {/* Semester GPA Dial */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Semester GPA (SGPA)
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
                {semesterGpa.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">
                Calculated on {totalSemesterCredits} Credits ({totalSemesterPoints.toFixed(1)} Quality Points)
              </span>
            </div>

            {/* Cumulative GPA Projection */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Overall Cumulative GPA (CGPA)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                {cumulativeGpa.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {totalCumulativeCredits} Total Degree Credits
              </span>
            </div>

            {/* Honors Classification Banner */}
            <div className={`p-4 rounded-2xl border ${standing.bg} space-y-1 text-center`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Official MoE Degree Standing:
              </span>
              <div className={`text-base font-black ${standing.color}`}>
                {standing.title}
              </div>
              <p className="text-[11px] text-slate-300">
                {standing.desc}
              </p>
            </div>

            {/* Grading Scale Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Ethiopian Grading Legislation:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
                <div>A+ / A = 4.00</div>
                <div>A- = 3.75</div>
                <div>B+ = 3.50</div>
                <div>B = 3.00</div>
                <div>B- = 2.75</div>
                <div>C+ = 2.50</div>
                <div>C = 2.00 (Pass)</div>
                <div>F = 0.00</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
