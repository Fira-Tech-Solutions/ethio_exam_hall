import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Rich contextual metadata, institutional logos, and visual assets for each Ethiopian curriculum category
const CATEGORY_META = {
  esuee: {
    image: '/images/categories/esuee-grade12.jpg',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    institution: 'Ministry of Education (MoE)',
    badge: 'National Matriculation',
    accentGradient: 'from-emerald-500 to-teal-600',
    accentBorder: 'hover:border-emerald-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)]',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    tagStyle: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20',
    curriculumTags: ['Natural Science', 'Social Science', '2010–2016 E.C.', 'Model Papers'],
    statsText: '140+ Past Papers & Models',
  },
  exit: {
    image: '/images/categories/exit-exam.jpg',
    logo: '/images/inst_logos/Ministry_of_Education_(Ethiopia).png',
    institution: 'MoE Higher Education Directorate',
    badge: 'MoE Mandatory Competency',
    accentGradient: 'from-blue-600 to-indigo-700',
    accentBorder: 'hover:border-blue-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(59,130,246,0.22)]',
    badgeStyle: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    tagStyle: 'bg-blue-500/10 text-blue-200 border-blue-400/20',
    curriculumTags: ['Law (LL.B)', 'Computer Science', 'Medicine', 'Civil Eng.', 'Economics'],
    statsText: '68 Degree Disciplines',
  },
  gat: {
    image: '/images/categories/aau-gat.jpg',
    logo: '/images/inst_logos/aau.png',
    institution: 'Addis Ababa University (AAU)',
    badge: 'Postgraduate Hub',
    accentGradient: 'from-purple-600 to-violet-700',
    accentBorder: 'hover:border-purple-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(147,51,234,0.22)]',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    tagStyle: 'bg-purple-500/10 text-purple-200 border-purple-400/20',
    curriculumTags: ['Verbal Reasoning', 'Quantitative Aptitude', 'Analytical Logic', 'Masters & PhD'],
    statsText: 'Realistic Timed Simulation',
  },
  aviation: {
    image: '/images/categories/aviation-cadet.jpg',
    logo: '/images/inst_logos/Ethiopian_Airlines_Logo.svg.webp',
    institution: 'Ethiopian Aviation University',
    badge: 'Strategic Aviation Portal',
    accentGradient: 'from-amber-500 via-rose-600 to-red-700',
    accentBorder: 'hover:border-amber-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(245,158,11,0.25)]',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    tagStyle: 'bg-amber-500/10 text-amber-200 border-amber-400/20',
    curriculumTags: ['Cadet Pilot', 'Aircraft Tech (AMT)', 'Cabin Crew', 'ICAO English'],
    statsText: 'Ethiopian Airlines Cadet Track',
    isAviation: true,
  },
  banking: {
    image: '/images/categories/banking-aptitude.jpg',
    logo: '/images/inst_logos/cbe.svg',
    institution: 'Commercial Bank of Ethiopia (CBE) & FinTech',
    badge: 'Banking & Financial Sector',
    accentGradient: 'from-amber-600 to-yellow-600',
    accentBorder: 'hover:border-amber-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(217,119,6,0.22)]',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    tagStyle: 'bg-amber-500/10 text-amber-200 border-amber-400/20',
    curriculumTags: ['CBE Graduate Trainee', 'Quantitative Logic', 'Financial Aptitude', 'General Knowledge'],
    statsText: 'Graduate Trainee Banks',
  },
  coc: {
    image: '/images/categories/tvet-coc.jpg',
    logo: '/images/inst_logos/coc.svg',
    institution: 'Federal TVET & CoC Agency',
    badge: 'Occupational Standard',
    accentGradient: 'from-cyan-600 to-blue-700',
    accentBorder: 'hover:border-cyan-500/60',
    accentGlow: 'hover:shadow-[0_16px_40px_rgba(6,182,212,0.22)]',
    badgeStyle: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    tagStyle: 'bg-cyan-500/10 text-cyan-200 border-cyan-400/20',
    curriculumTags: ['Level 1 – Level 4', 'Automotive', 'ICT & Software', 'Practical Prep'],
    statsText: 'CoC Theory & Practical',
  },
};

export default function PopularCategoriesSection({ categories = [], style = {}, className = '' }) {
  const scrollContainerRef = useRef(null);
  const sectionRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeLayout, setActiveLayout] = useState('carousel'); // 'carousel' | 'grid'
  const [isVisible, setIsVisible] = useState(false);

  // Fallback category items if database is loading or empty
  const defaultCategories = [
    { code: 'esuee', name: 'Grade 12 (ESUEE)', amharic_name: 'የ12ኛ ክፍል ብሔራዊ ፈተና', description: 'Ethiopian Secondary University Entrance Examination past papers and model questions.', exam_count: 2 },
    { code: 'exit', name: 'University Exit Exam', amharic_name: 'የከፍተኛ ትምህርት መውጫ ፈተና', description: 'Ministry of Education undergraduate exit examinations across all accredited degree programs.', exam_count: 3 },
    { code: 'gat', name: 'AAU GAT (Postgraduate)', amharic_name: 'አ.አ.ዩ ጂ.ኤ.ቲ ፈተና', description: 'Addis Ababa University Graduate Admission Test for Masters and PhD candidates.', exam_count: 1 },
    { code: 'aviation', name: 'Airline & Aviation Prep', amharic_name: 'የአቪዬሽን እና ካዴት አካዳሚ', description: 'Ethiopian Airlines Aviation University Cadet Pilot, AMT, and Cabin Crew exams.', exam_count: 2, is_aviation: true },
    { code: 'banking', name: 'Bank Trainee Aptitude', amharic_name: 'የባንክ ቅጥር ፈተና', description: 'Commercial Bank of Ethiopia (CBE) and private banking graduate trainee assessments.', exam_count: 1 },
    { code: 'coc', name: 'TVET & CoC Certification', amharic_name: 'የሙያ ብቃት ማረጋገጫ (CoC)', description: 'Center of Competence vocational skill and theory testing resources.', exam_count: 0 },
  ];

  const items = categories && categories.length > 0 ? categories : defaultCategories;

  // Track scroll position for carousel controls
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [items, activeLayout]);

  // Modern IntersectionObserver scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.category-card')?.offsetWidth || 380;
    const scrollAmount = direction === 'left' ? -(cardWidth + 24) : cardWidth + 24;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Popular Academic and Career Categories"
      style={{ position: 'sticky', top: 0, zIndex: 20, ...style }}
      className={`w-full min-h-screen py-16 md:py-24 bg-gradient-to-b from-slate-950 via-[#0B1527] to-slate-950 text-white relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-slate-800/80 flex flex-col justify-center ${className}`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-slate-900/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with bilingual titles, category count & carousel navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            {/* Overline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Curriculum Tracks &amp; Career Pathways</span>
            </div>

            {/* Main Section Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Popular Academic &amp; Career Categories
            </h2>

            {/* Amharic Subtitle */}
            <p className="text-amber-400/90 text-sm md:text-base font-medium mt-1">
              ብሔራዊ የፈተና፣ የከፍተኛ ትምህርት እና የሙያ መስኮች
            </p>

            <p className="text-slate-300 text-sm sm:text-base mt-2.5 leading-relaxed max-w-xl">
              Authentic past examinations, official syllabi, and realistic timed simulators tailored for Ethiopian secondary candidates, university scholars, and professional recruits.
            </p>
          </div>

          {/* Right Navigation & View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            {/* View Mode Toggle: Carousel vs Grid */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveLayout('carousel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayout === 'carousel'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-label="Carousel View"
              >
                <span className="material-symbols-outlined text-[16px]">view_carousel</span>
                <span>Slide Showcase</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLayout('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLayout === 'grid'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-label="Grid View"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span>All Grid</span>
              </button>
            </div>

            {/* Carousel Arrow Buttons (only visible in Carousel mode) */}
            {activeLayout === 'carousel' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    canScrollLeft
                      ? 'bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  }`}
                  aria-label="Scroll Left"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    canScrollRight
                      ? 'bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  }`}
                  aria-label="Scroll Right"
                >
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Container: Carousel or Grid */}
        <div
          ref={scrollContainerRef}
          className={`${
            activeLayout === 'carousel'
              ? 'flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth hide-scrollbar'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((cat, index) => {
            const meta = CATEGORY_META[cat.code] || CATEGORY_META.esuee;
            const targetUrl = cat.code === 'aviation' ? '/aviation-portal' : `/explore-exams?category=${cat.code}`;

            return (
              <div
                key={cat.id || cat.code}
                className={`category-card group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2.5 ${
                  meta.accentBorder
                } ${meta.accentGlow} ${
                  activeLayout === 'carousel'
                    ? 'w-[320px] sm:w-[360px] md:w-[390px] shrink-0 snap-start'
                    : 'w-full'
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 90}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 90}ms`,
                }}
              >
                {/* Top Ambient Glow Line */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.accentGradient}`} />

                {/* Card Contextual Photo Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={meta.image}
                    alt={`${cat.name} Contextual Preview`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 brightness-95 group-hover:brightness-105"
                    loading="lazy"
                  />
                  
                  {/* Multi-stage dark gradient overlays for maximum contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/50 pointer-events-none" />

                  {/* Floating Top Left: Official Institutional Emblem */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg border border-white/50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <img
                        src={meta.logo}
                        alt={`${meta.institution} Logo`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90 drop-shadow-md max-w-[170px] truncate leading-tight hidden sm:inline-block">
                      {meta.institution}
                    </span>
                  </div>

                  {/* Floating Top Right: Status Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-md ${meta.badgeStyle}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      <span>{cat.badge_text || meta.badge}</span>
                    </span>
                  </div>

                  {/* Floating Bottom Left: Amharic Title Pill */}
                  {cat.amharic_name && (
                    <div className="absolute bottom-3 left-3.5 z-10">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
                        {cat.amharic_name}
                      </span>
                    </div>
                  )}

                  {/* Exam Count Pill */}
                  <div className="absolute bottom-3 right-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-bold tracking-tight">
                      {cat.exam_count ? `${cat.exam_count} Available Papers` : meta.statsText}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Title & Icon */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.accentGradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <span className="material-symbols-outlined text-[19px]">
                          {cat.icon || 'school'}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 font-normal">
                      {cat.description}
                    </p>

                    {/* Authentic Curriculum Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {meta.curriculumTags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${meta.tagStyle}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Card Action Link */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      to={targetUrl}
                      className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:text-amber-300 transition-colors"
                    >
                      <span>{cat.code === 'aviation' ? 'Enter Aviation Portal' : 'Explore Curriculum'}</span>
                      <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1.5">
                        arrow_forward
                      </span>
                    </Link>

                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Scroll Progress Bar (visible in carousel mode) */}
        {activeLayout === 'carousel' && (
          <div className="mt-8 flex items-center justify-between gap-4 max-w-md mx-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scroll Showcase
            </span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-200 rounded-full"
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>
            <Link
              to="/explore-exams"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
