import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [amharicName, setAmharicName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [category, setCategory] = useState('Research Flagship');
  const [generation, setGeneration] = useState('First Generation');
  const [established, setEstablished] = useState(1950);
  const [president, setPresident] = useState('');
  const [mainCampus, setMainCampus] = useState('');
  const [city, setCity] = useState('');
  const [students, setStudents] = useState('40,000+');
  const [climate, setClimate] = useState('');
  const [badge, setBadge] = useState('');
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  const [mapQuery, setMapQuery] = useState('');
  const [overview, setOverview] = useState('');
  const [cutoffs, setCutoffs] = useState('');
  const [facultiesJson, setFacultiesJson] = useState('[]');
  const [galleryJson, setGalleryJson] = useState('[]');
  const [uniqueFeaturesJson, setUniqueFeaturesJson] = useState('[]');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadUniversities();
  }, []);

  async function loadUniversities() {
    setLoading(true);
    try {
      const data = await adminApi.getUniversities();
      setUniversities(data || []);
    } catch (err) {
      console.error('Error fetching universities:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setCode('');
    setName('');
    setAmharicName('');
    setShortCode('');
    setCategory('Research Flagship');
    setGeneration('First Generation');
    setEstablished(2000);
    setPresident('');
    setMainCampus('');
    setCity('');
    setStudents('25,000+');
    setClimate('Highland Temperate');
    setBadge('National University');
    setLogoUrl('/images/logo.png');
    setMapQuery('');
    setOverview('');
    setCutoffs('National matriculation standard quota.');
    setFacultiesJson(JSON.stringify([
      { name: 'College of Natural Sciences', depts: ['Computer Science', 'Mathematics', 'Physics'] },
      { name: 'College of Health Sciences', depts: ['Medicine', 'Pharmacy', 'Nursing'] }
    ], null, 2));
    setGalleryJson(JSON.stringify([
      { url: '/images/categories/exit-exam.jpg', caption: 'Main Campus Gate' }
    ], null, 2));
    setUniqueFeaturesJson(JSON.stringify([
      'Center of Excellence in Scientific Research'
    ], null, 2));
    setIsActive(true);
  };

  const openEditModal = (u) => {
    setModalMode('edit');
    setEditingId(u.id);
    setCode(u.code || '');
    setName(u.name || '');
    setAmharicName(u.amharic_name || '');
    setShortCode(u.short_code || '');
    setCategory(u.category || 'Comprehensive');
    setGeneration(u.generation || 'General');
    setEstablished(u.established || 2000);
    setPresident(u.president || '');
    setMainCampus(u.main_campus || '');
    setCity(u.city || '');
    setStudents(u.students || '');
    setClimate(u.climate || '');
    setBadge(u.badge || '');
    setLogoUrl(u.logo_url || '/images/logo.png');
    setMapQuery(u.map_query || '');
    setOverview(u.overview || '');
    setCutoffs(u.cutoffs || '');
    setFacultiesJson(JSON.stringify(u.faculties || [], null, 2));
    setGalleryJson(JSON.stringify(u.gallery || [], null, 2));
    setUniqueFeaturesJson(JSON.stringify(u.unique_features || [], null, 2));
    setIsActive(u.is_active !== undefined ? u.is_active : true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Code and Name are required.');
      return;
    }

    let parsedFaculties = [];
    let parsedGallery = [];
    let parsedFeatures = [];

    try {
      parsedFaculties = JSON.parse(facultiesJson || '[]');
      parsedGallery = JSON.parse(galleryJson || '[]');
      parsedFeatures = JSON.parse(uniqueFeaturesJson || '[]');
    } catch (err) {
      alert('Invalid JSON in Faculties, Gallery, or Features. Please check formatting.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: code.trim().toLowerCase(),
        name: name.trim(),
        amharic_name: amharicName.trim(),
        short_code: shortCode.trim().toUpperCase(),
        category,
        generation,
        established: parseInt(established, 10),
        president: president.trim(),
        main_campus: mainCampus.trim(),
        city: city.trim(),
        students: students.trim(),
        climate: climate.trim(),
        badge: badge.trim(),
        logo_url: logoUrl.trim(),
        map_query: mapQuery.trim() || name.trim(),
        overview: overview.trim(),
        cutoffs: cutoffs.trim(),
        faculties: parsedFaculties,
        gallery: parsedGallery,
        unique_features: parsedFeatures,
        is_active: isActive,
      };

      if (modalMode === 'create') {
        await adminApi.createUniversity(payload);
      } else {
        await adminApi.updateUniversity(editingId, payload);
      }

      setModalMode(null);
      await loadUniversities();
    } catch (err) {
      alert(err.message || 'Failed to save university.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete ${u.name}? This cannot be undone.`)) {
      return;
    }
    try {
      await adminApi.deleteUniversity(u.id);
      await loadUniversities();
    } catch (err) {
      alert(err.message || 'Failed to delete university.');
    }
  };

  const filtered = universities.filter(u => {
    if (categoryFilter !== 'ALL' && u.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q) || (u.short_code || '').toLowerCase().includes(q);
      const matchCity = (u.city || '').toLowerCase().includes(q);
      if (!matchName && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              Institutional Intelligence
            </span>
            <span className="text-xs text-on-surface-variant">Live Public Site Sync</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mt-1">
            Universities Directory Control
          </h1>
          <p className="text-sm text-on-surface-variant">
            Manage Ethiopian universities, affiliated colleges, degree departments, cutoff metrics, and campus galleries.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm self-start transition-colors"
        >
          <span className="material-symbols-outlined text-base">add_business</span>
          <span>Add New University</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
        <div className="relative flex-1 max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by university name, short code, or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Research Flagship', 'STEM Excellence', 'Applied Innovation', 'Community-Based Education'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Universities Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading Ethiopian universities directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">account_balance</span>
            <p className="text-sm font-bold">No universities found.</p>
            <p className="text-xs">Try adjusting your search criteria or add a new university.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-high/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4">University</th>
                <th className="py-3 px-4">Category & Gen</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Colleges & Depts</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filtered.map(u => {
                const facultiesList = Array.isArray(u.faculties) ? u.faculties : [];
                const totalDepts = facultiesList.reduce((acc, f) => acc + (f.depts?.length || 0), 0);
                return (
                  <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/30 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={u.logo_url || '/images/logo.png'}
                            alt={u.short_code}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-on-surface">{u.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-primary/10 text-primary font-mono font-bold">
                              {u.short_code || u.code?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant font-ethiopic block">
                            {u.amharic_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-on-surface block">{u.category}</span>
                      <span className="text-[11px] text-on-surface-variant block">{u.generation}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-on-surface block">{u.city}</span>
                      <span className="text-[10px] text-on-surface-variant block truncate max-w-[140px]">{u.main_campus}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                        {facultiesList.length} Faculties • {totalDepts} Depts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {u.is_active ? 'Live on Site' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface transition-colors"
                          title="Edit University"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete University"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT UNIVERSITY MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-outline-variant/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container">
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  {modalMode === 'create' ? 'Register New University' : `Edit: ${name}`}
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Changes sync immediately with the national university insights explorer.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    University Code (Unique Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. aau, astu, ju"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Short Acronym Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    placeholder="e.g. AAU, ASTU, JU"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Addis Ababa University"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Amharic Name (የአማርኛ መጠሪያ)
                  </label>
                  <input
                    type="text"
                    value={amharicName}
                    onChange={(e) => setAmharicName(e.target.value)}
                    placeholder="e.g. አዲስ አበባ ዩኒቨርሲቲ"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-ethiopic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Category Classification
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Research Flagship, STEM Excellence"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Generation Rank
                  </label>
                  <input
                    type="text"
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    placeholder="e.g. First Generation"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={established}
                    onChange={(e) => setEstablished(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Addis Ababa, Adama"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Main Campus Location
                  </label>
                  <input
                    type="text"
                    value={mainCampus}
                    onChange={(e) => setMainCampus(e.target.value)}
                    placeholder="e.g. Sidist Kilo"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Total Enrolled Students
                  </label>
                  <input
                    type="text"
                    value={students}
                    onChange={(e) => setStudents(e.target.value)}
                    placeholder="e.g. 48,000+"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                  Logo Asset URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/images/inst_logos/aau.png"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                  Institutional Profile / Overview
                </label>
                <textarea
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Comprehensive summary of the university..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* JSON Editor for Colleges and Departments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-on-surface-variant uppercase text-[10px]">
                    Colleges & Departments (JSON Schema)
                  </label>
                  <span className="text-[10px] text-primary font-mono">
                    [&#123; name: "College Name", depts: ["Dept 1", "Dept 2"] &#125;]
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={facultiesJson}
                  onChange={(e) => setFacultiesJson(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>

              {/* JSON Editor for Gallery Photos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-on-surface-variant uppercase text-[10px]">
                    Campus Gallery Photos (JSON Schema)
                  </label>
                  <span className="text-[10px] text-primary font-mono">
                    [&#123; url: "/path.jpg", caption: "Caption" &#125;]
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={galleryJson}
                  onChange={(e) => setGalleryJson(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>

              {/* Cutoffs & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">
                    Admissions Cutoff Criteria
                  </label>
                  <input
                    type="text"
                    value={cutoffs}
                    onChange={(e) => setCutoffs(e.target.value)}
                    placeholder="e.g. Top 5% ESUEE score; minimum 480+"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-on-surface cursor-pointer">
                    Visible & Active in Public Explorer
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save University'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
