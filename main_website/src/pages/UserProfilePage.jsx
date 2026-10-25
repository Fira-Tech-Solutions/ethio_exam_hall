import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
];

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Profile Information Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetTrack, setTargetTrack] = useState('exit');
  const [institution, setInstitution] = useState('Addis Ababa University');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customAvatarPreview, setCustomAvatarPreview] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Set/Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setTargetTrack(user.target_track || 'exit');
    setInstitution(user.institution || 'Addis Ababa University');
    setAvatarUrl(user.avatar_url || user.photo_url || user.telegram?.avatarUrl || '');
  }, [user]);

  // Handle local image file upload & convert to Data URL
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Avatar image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCustomAvatarPreview(dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Information
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.updateProfile({
        name: name.trim(),
        email: email.trim(),
        target_track: targetTrack,
        institution: institution.trim(),
        avatar_url: avatarUrl,
      });

      setProfileSuccess(res.message || 'Profile configuration updated successfully.');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Submit Password Set / Reset
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await api.changePassword({
        currentPassword: user?.has_password ? currentPassword : '',
        newPassword,
      });

      setPasswordSuccess(res.message || 'Password saved successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const isTelegramPlaceholder = user?.email && user.email.startsWith('tg_') && user.email.endsWith('@users.ethioexamhall.local');
  const hasNoPassword = !user?.has_password;

  const currentDisplayAvatar = customAvatarPreview || avatarUrl || user?.avatar_url || user?.photo_url || user?.telegram?.avatarUrl;

  return (
    <div className="w-full min-h-screen bg-[#070e1c] text-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8 font-inter">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1527] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Account Management
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {user?.candidate_id || 'ETH-CANDIDATE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Candidate Profile & Security Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Configure your personal information, set up a permanent email and password for seamless multi-device sign-in, customize your avatar, and manage your academic institution.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 self-start transition-colors"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Prompts for Telegram Users */}
      {(isTelegramPlaceholder || hasNoPassword) && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-2xl">vpn_key_alert</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-300">
              Telegram Account Setup: Configure Email & Password
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTelegramPlaceholder && hasNoPassword ? (
                <>You signed in using Telegram! Set your real <strong>Email</strong> and create a <strong>Password</strong> below so you can sign in anytime via either Telegram or standard email & password.</>
              ) : isTelegramPlaceholder ? (
                <>Please replace your temporary Telegram ID with your real email address so you can receive examination updates and score reports.</>
              ) : (
                <>You haven't set a password yet. Create a password below so you can log in directly without requiring Telegram authentication.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Profile Info & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Account Badges */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center space-y-4">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-amber-400/80 shadow-2xl bg-slate-950 flex items-center justify-center">
                {currentDisplayAvatar ? (
                  <img
                    src={currentDisplayAvatar}
                    alt={user?.name || 'Candidate'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-4xl items-center justify-center ${currentDisplayAvatar ? 'hidden' : 'flex'}`}>
                  {name?.charAt(0) || user?.name?.charAt(0) || 'C'}
                </div>
              </div>

              {/* Upload trigger button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                <span>Change Photo</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            <div>
              <h2 className="text-lg font-bold text-white">{name || user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[220px]">
                {isTelegramPlaceholder ? 'Temporary Telegram Account' : email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {user?.has_pro_access ? 'Pro Pass Active' : 'National Candidate'}
              </span>
            </div>

            {/* Quick Upload Action */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Upload Custom Photo</span>
            </button>

            {/* Preset Avatars Grid */}
            <div className="w-full pt-3 border-t border-slate-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Or Select Preset Character Avatar:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(pUrl);
                      setCustomAvatarPreview(pUrl);
                    }}
                    className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      avatarUrl === pUrl ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={pUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Telegram Link Status */}
            {user?.telegram?.linked && (
              <div className="w-full p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-xl">send</span>
                  <div>
                    <span className="text-[11px] font-bold text-sky-300 block">Telegram Linked</span>
                    <span className="text-[10px] text-slate-400 font-mono">@{user.telegram.username || 'user'}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Profile Form & Password Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROFILE DATA CONFIGURATION CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <span className="material-symbols-outlined text-amber-400 text-2xl">person_outline</span>
              <div>
                <h3 className="text-base font-bold text-white">Personal Profile Data</h3>
                <p className="text-xs text-slate-400">Configure your candidate credentials and official registration details.</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abebe Bekele"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Candidate Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={isTelegramPlaceholder && email.startsWith('tg_') ? '' : email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isTelegramPlaceholder ? "Enter your actual email address" : "e.g. candidate@gmail.com"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                  {isTelegramPlaceholder && (
                    <span className="text-[10px] text-amber-400 block mt-1">
                      ⚠️ Please provide a real email to replace temporary Telegram handle.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Academic Target Track
                  </label>
                  <select
                    value={targetTrack}
                    onChange={(e) => setTargetTrack(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="exit">University Exit Examination (MoE)</option>
                    <option value="esuee">Grade 12 Entrance Matriculation (ESUEE)</option>
                    <option value="gat">AAU Graduate Admission Test (GAT)</option>
                    <option value="aviation">Aviation Cadet Pilot / AMT Academy</option>
                    <option value="banking">Bank Graduate Trainee Aptitude</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    University / High School Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Addis Ababa University, ASTU, Jimma University"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Avatar / Profile Picture URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setCustomAvatarPreview(e.target.value);
                  }}
                  placeholder="https://... or click Upload Photo on the left"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* PASSWORD SET / RESET CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400 text-2xl">lock</span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {hasNoPassword ? 'Set Up Account Password' : 'Change / Reset Password'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {hasNoPassword
                      ? 'Create a secure password to unlock direct email/password login.'
                      : 'Ensure your account stays protected by updating your credentials.'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hasNoPassword ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {hasNoPassword ? 'No Password Configured' : 'Password Configured'}
              </span>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              {!hasNoPassword && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Current Password *
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {hasNoPassword ? 'New Password *' : 'New Password *'}
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPasswordFields ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{showPasswordFields ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>

                <button
                  type="submit"
                  disabled={passwordSaving || !newPassword}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-base">key</span>
                  <span>{passwordSaving ? 'Updating...' : hasNoPassword ? 'Set Password' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
