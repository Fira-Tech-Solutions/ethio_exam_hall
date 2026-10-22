import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ExamCard from '../components/exam/ExamCard';

export default function DiscoveryLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state synced with searchParams
  const category = searchParams.get('category') || 'all';
  const subject = searchParams.get('subject') || 'all';
  const year = searchParams.get('year') || 'all';
  const accessTier = searchParams.get('access_tier') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      try {
        const queryParams = { page, limit: 9 };
        if (category !== 'all') queryParams.category = category;
        if (subject !== 'all') queryParams.subject = subject;
        if (year !== 'all') queryParams.year = year;
        if (accessTier !== 'all') queryParams.access_tier = accessTier;
        if (search) queryParams.search = search;
        if (sort) queryParams.sort = sort;

        const res = await api.getExams(queryParams);
        setExams(res.exams || []);
        setTotalItems(res.pagination?.totalItems || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, [category, subject, year, accessTier, search, sort, page]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '' || !value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleBookmarkToggle = async (examId) => {
    try {
      const res = await api.toggleBookmark(examId);
      setExams(prev => prev.map(e => e.id === examId ? { ...e, is_bookmarked: res.bookmarked } : e));
    } catch {
      alert('Please sign in to bookmark examinations.');
    }
  };

  return (
    <div className="w-full bg-slate-950 min-h-screen text-white flex flex-col">
      
      {/* 1. Sticky Archive Header & Intelligent Search Layer (z-10) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 10 }}
        className="w-full min-h-[48vh] lg:min-h-[52vh] py-10 sm:py-14 bg-gradient-to-b from-slate-950 via-[#0B1527] to-[#0B1527] text-white relative overflow-hidden border-b border-slate-800/80 flex flex-col justify-center"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col gap-6">
          
          {/* Header Title & Counters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>National Repository &amp; Archive</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                Ethiopian Examination Library
              </h1>
              <p className="text-amber-400/90 text-xs sm:text-sm font-medium mt-1">
                ብሔራዊ የፈተናዎች እና የሞዴል ጥያቄዎች ማህደር
              </p>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-xl">
                Browse, search, and practice with authentic past examinations from the Ministry of Education (MoE), Ethiopian Aviation Academy, and leading national universities.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex sm:flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-2.5 text-center shadow-lg">
                <span className="text-2xl font-black text-amber-400 font-mono block">1,200+</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Exam Papers</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-2.5 text-center shadow-lg">
                <span className="text-2xl font-black text-emerald-400 font-mono block">100%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Provenance</span>
              </div>
            </div>
          </div>

          {/* Search Input & Category Pills */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
            
            {/* Top Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by exam title, subject, or year (e.g., Grade 12 Math, Exit Exam Law)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 border border-slate-700/80"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
                >
                  Search Library
                </button>
                {(search || category !== 'all' || subject !== 'all' || year !== 'all' || accessTier !== 'all') && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-colors shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Segmented Category Filter Track */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                type="button"
                onClick={() => updateFilter('category', 'all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  category === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateFilter('category', c.code)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    category === c.code
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.is_aviation && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Secondary Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => updateFilter('subject', e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="all">All Subjects</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Law">Law</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Aviation Aptitude">Aviation Aptitude</option>
                  <option value="Aptitude">General Aptitude</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Year (E.C.)</label>
                <select
                  value={year}
                  onChange={(e) => updateFilter('year', e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="all">All Academic Years</option>
                  <option value="2016">2016 E.C. (Current)</option>
                  <option value="2015">2015 E.C.</option>
                  <option value="2014">2014 E.C.</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Access Tier</label>
                <select
                  value={accessTier}
                  onChange={(e) => updateFilter('access_tier', e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="all">All Access Tiers</option>
                  <option value="free">Free Public Papers</option>
                  <option value="pro">Pro Pass Exclusive</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="questions">Question Count</option>
                </select>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Sticky Overlapping Exam Results Layer (z-20) */}
      <section
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
        className="w-full min-h-screen py-12 md:py-20 bg-[#0B1527] text-white relative shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t border-slate-800/80 flex flex-col justify-start"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
          
          {/* Results Counter & Filter Status */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 border-b border-slate-800 pb-4">
            <span>
              Showing <strong className="text-white font-mono">{exams.length}</strong> of <strong className="text-white font-mono">{totalItems}</strong> authentic papers
            </span>
            {category !== 'all' && (
              <span className="font-bold text-amber-400 uppercase text-xs tracking-wider">
                Filter: {category.toUpperCase()}
              </span>
            )}
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto my-12 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-[36px]">search_off</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                No examination papers match your search criteria
              </h3>
              <p className="text-sm text-slate-400">
                Try adjusting your filter combination or search query to find relevant past papers.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  onBookmarkToggle={handleBookmarkToggle}
                  isBookmarked={exam.is_bookmarked}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 pb-12">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter('page', page - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-mono font-bold text-xs text-amber-300 bg-slate-900 border border-slate-800 rounded-xl">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateFilter('page', page + 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
