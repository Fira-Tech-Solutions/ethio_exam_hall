import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedTrack, setSelectedTrack] = useState('ALL');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState(null);
  const [role, setRole] = useState('student');
  const [isVerified, setIsVerified] = useState(true);
  const [institution, setInstitution] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [targetTrack, setTargetTrack] = useState('exit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  const openEditModal = (u) => {
    setEditingUser(u);
    setRole(u.role || 'student');
    setIsVerified(Boolean(u.is_verified));
    setInstitution(u.institution || '');
    setCandidateId(u.candidate_id || '');
    setTargetTrack(u.target_track || 'exit');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        role,
        isVerified,
        institution: institution.trim() || null,
        candidateId: candidateId.trim() || null,
        targetTrack,
      });
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.candidate_id && u.candidate_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.institution && u.institution.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole =
      selectedRole === 'ALL' ||
      u.role === selectedRole;

    const matchTrack =
      selectedTrack === 'ALL' ||
      u.target_track === selectedTrack;

    return matchSearch && matchRole && matchTrack;
  });

  return (
    <div className="flex flex-col gap-space-lg p-gutter">
      
      {/* Title & Stats */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[26px]">group</span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Registered Users Directory
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            View registered users, candidate IDs, academic tracks, institutions, and manage role privileges and verification status.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Total Registered Users</span>
            <span className="font-mono text-headline-sm font-black text-primary">
              {users.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, candidate ID, or university..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="student">Student / Candidate</option>
            <option value="tutor">Tutor / Faculty</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Administrator</option>
          </select>

          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl text-[12px] font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Tracks</option>
            <option value="exit">University Exit Exam</option>
            <option value="esuee">Grade 12 ESUEE</option>
            <option value="aviation">Airline & Aviation</option>
            <option value="gat">AAU GAT</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/40 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Candidate ID</th>
                <th className="py-3 px-4">Scholar Name & Email</th>
                <th className="py-3 px-4">Institution & University</th>
                <th className="py-3 px-4">Academic Track</th>
                <th className="py-3 px-4">Exam Attempts</th>
                <th className="py-3 px-4">Role Privileges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-on-surface-variant">
                    Loading registered candidates...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-on-surface-variant">
                    No users found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-secondary">
                      {u.candidate_id || `CAND-${u.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-primary block leading-tight">{u.name}</span>
                          <span className="text-[11px] text-on-surface-variant">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-on-surface">
                      {u.institution || 'Addis Ababa University'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] uppercase font-bold text-secondary">
                      {u.target_track || 'exit'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {u.total_attempts || 0} mocks
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'superadmin' 
                          ? 'bg-primary-container text-tertiary-fixed-dim' 
                          : u.role === 'admin'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container text-on-surface'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        u.is_verified ? 'text-emerald-700' : 'text-outline'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.is_verified ? 'bg-emerald-500' : 'bg-outline'
                        }`}></span>
                        {u.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-bold text-[11px] hover:bg-surface-container-high transition-colors"
                        type="button"
                      >
                        Edit Rights
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rights Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <h3 className="font-headline-sm font-bold text-primary">
                  Edit Scholar Privileges
                </h3>
                <span className="text-[12px] text-on-surface-variant font-mono">
                  {editingUser.email}
                </span>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="flex flex-col gap-3 text-[13px]">
              <div>
                <label className="font-bold text-on-surface block mb-1">Scholar Full Name</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.name}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface opacity-70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Candidate ID</label>
                  <input
                    type="text"
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    placeholder="e.g. ETH-88492"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Role Privilege</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="student">Student / Candidate</option>
                    <option value="tutor">Tutor / Faculty</option>
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Academic Track</label>
                  <select
                    value={targetTrack}
                    onChange={(e) => setTargetTrack(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    <option value="exit">University Exit Exam</option>
                    <option value="esuee">Grade 12 ESUEE</option>
                    <option value="aviation">Airline & Aviation</option>
                    <option value="gat">AAU GAT</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Account Verified</label>
                  <select
                    value={isVerified ? 'true' : 'false'}
                    onChange={(e) => setIsVerified(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                  >
                    <option value="true">Verified (Active)</option>
                    <option value="false">Unverified (Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">University / Academic Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Addis Ababa University"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
