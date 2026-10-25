import React from 'react';

/**
 * Shimmer element utility
 */
export function Shimmer({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent ${className}`}
    />
  );
}

/**
 * 1. App-level Skeleton Loader (replaces the App.jsx spinner)
 */
export function AppSkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#070e1c] text-white flex flex-col font-inter">
      {/* Top Header Shimmer */}
      <div className="h-16 md:h-20 bg-[#0B1527] border-b border-slate-800/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5 hidden sm:block">
            <Shimmer className="w-32 h-4 rounded-md" />
            <Shimmer className="w-20 h-2.5 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Shimmer className="w-16 h-8 rounded-xl hidden md:block" />
          <Shimmer className="w-24 h-8 rounded-xl hidden md:block" />
          <Shimmer className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Main Content Shimmer */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Shimmer className="w-48 h-6 rounded-full" />
          <Shimmer className="w-3/4 max-w-md h-8 rounded-xl" />
          <Shimmer className="w-full max-w-xl h-4 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <Shimmer className="w-full h-36 rounded-2xl" />
              <div className="space-y-2">
                <Shimmer className="w-3/4 h-5 rounded-md" />
                <Shimmer className="w-1/2 h-3 rounded-md" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <Shimmer className="w-20 h-6 rounded-lg" />
                <Shimmer className="w-24 h-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Dashboard Workspace Skeleton Loader
 */
export function DashboardSkeletonLoader() {
  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8 font-inter">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3 flex-1">
          <Shimmer className="w-36 h-6 rounded-full" />
          <Shimmer className="w-2/3 max-w-lg h-8 rounded-xl" />
          <Shimmer className="w-4/5 max-w-md h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Shimmer className="w-24 h-20 rounded-2xl" />
          <Shimmer className="w-24 h-20 rounded-2xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <Shimmer className="w-20 h-3 rounded-md" />
              <Shimmer className="w-8 h-8 rounded-xl" />
            </div>
            <Shimmer className="w-24 h-7 rounded-lg" />
            <Shimmer className="w-full h-2 rounded-full" />
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Shimmer className="w-48 h-6 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <Shimmer className="w-full h-28 rounded-xl" />
                <Shimmer className="w-3/4 h-5 rounded-md" />
                <Shimmer className="w-1/2 h-3 rounded-md" />
                <Shimmer className="w-full h-8 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Shimmer className="w-36 h-6 rounded-lg" />
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <Shimmer className="w-full h-32 rounded-2xl" />
            <Shimmer className="w-full h-4 rounded-md" />
            <Shimmer className="w-4/5 h-4 rounded-md" />
            <Shimmer className="w-full h-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Exam Detail Skeleton Loader
 */
export function ExamDetailSkeletonLoader() {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-inter">
      {/* Top Hero Banner */}
      <div className="bg-[#0B1527] border-b border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Shimmer className="w-28 h-6 rounded-full" />
            <Shimmer className="w-20 h-6 rounded-full" />
          </div>
          <Shimmer className="w-3/4 max-w-2xl h-10 rounded-xl" />
          <Shimmer className="w-1/2 max-w-md h-4 rounded-md" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Document Preview Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-8 rounded-3xl bg-[#070e1c] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <Shimmer className="w-40 h-6 rounded-md" />
              <Shimmer className="w-24 h-8 rounded-xl" />
            </div>
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <Shimmer className="w-full h-4 rounded-md" />
                  <Shimmer className="w-3/4 h-4 rounded-md" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Shimmer className="w-full h-8 rounded-lg" />
                    <Shimmer className="w-full h-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Specifications Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <Shimmer className="w-36 h-6 rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/60">
                  <Shimmer className="w-24 h-4 rounded-md" />
                  <Shimmer className="w-20 h-4 rounded-md" />
                </div>
              ))}
            </div>
            <Shimmer className="w-full h-12 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Score Report / Analytics Skeleton Loader
 */
export function ScoreReportSkeletonLoader() {
  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8 font-inter">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Shimmer className="w-32 h-6 rounded-full" />
          <Shimmer className="w-72 h-8 rounded-xl" />
          <Shimmer className="w-48 h-4 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Shimmer className="w-28 h-10 rounded-xl" />
          <Shimmer className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Score Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Shimmer className="w-20 h-3 rounded-md" />
            <Shimmer className="w-28 h-8 rounded-lg" />
            <Shimmer className="w-16 h-3 rounded-md" />
          </div>
        ))}
      </div>

      {/* Competency Breakdown & Question Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Shimmer className="w-44 h-6 rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Shimmer className="w-full h-4 rounded-md" />
              <Shimmer className="w-2/3 h-4 rounded-md" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Shimmer className="w-full h-9 rounded-xl" />
                <Shimmer className="w-full h-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Shimmer className="w-40 h-6 rounded-md" />
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Shimmer className="w-28 h-3 rounded-md" />
                  <Shimmer className="w-10 h-3 rounded-md" />
                </div>
                <Shimmer className="w-full h-2 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Exam Simulator Skeleton Loader
 */
export function ExamSimulatorSkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-inter">
      {/* Top Locked Proctored Header */}
      <div className="h-16 bg-[#0B1527] border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer className="w-8 h-8 rounded-xl" />
          <Shimmer className="w-64 h-5 rounded-md" />
        </div>
        <div className="flex items-center gap-4">
          <Shimmer className="w-28 h-9 rounded-xl" />
          <Shimmer className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      {/* Main Examination Canvas */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#070e1c] border border-slate-800 space-y-5">
            <div className="flex justify-between items-center">
              <Shimmer className="w-32 h-6 rounded-full" />
              <Shimmer className="w-20 h-6 rounded-full" />
            </div>
            <div className="space-y-3 py-2">
              <Shimmer className="w-full h-5 rounded-md" />
              <Shimmer className="w-4/5 h-5 rounded-md" />
              <Shimmer className="w-3/5 h-5 rounded-md" />
            </div>
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="w-full h-14 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <Shimmer className="w-36 h-5 rounded-md" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <Shimmer key={i} className="w-full aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
