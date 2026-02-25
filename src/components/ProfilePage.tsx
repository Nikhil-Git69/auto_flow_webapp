import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Award,
  Zap,
  Camera,
  Loader2,
  Edit2,
  Check,
  X,
  Crown
} from 'lucide-react';
import { userApi } from '../services/api';
import TeamWorkBro from '../assets/Team work-bro.svg';


interface ProfilePageProps {
  user: any;
  onLogout: (message?: string, type?: 'success' | 'info' | 'error') => void;
  onBackToDashboard: () => void;
  onNavigateSettings: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  user: initialUser,
  onLogout,
  onBackToDashboard,
  onNavigateSettings
}) => {
  const [user, setUser] = useState(initialUser);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banner background state
  const [bannerBg, setBannerBg] = useState<string | null>(user.bannerUrl || null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Banner image too large. Max 8MB.'); return; }

    try {
      setIsSaving(true);
      const userId = user._id || user.id;
      const response = await userApi.uploadBanner(userId, file);

      if (response.success && response.data?.bannerUrl) {
        const updatedUser = { ...user, bannerUrl: response.data.bannerUrl };
        setUser(updatedUser);
        setBannerBg(response.data.bannerUrl);
        localStorage.setItem('autoflow_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to upload banner:", error);
      alert("Failed to upload banner. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveBanner = async () => {
    try {
      setIsSaving(true);
      const userId = user._id || user.id;
      // We can just update the profile to remove the bannerUrl
      const response = await userApi.updateProfile(userId, { bannerUrl: null });

      if (response.success) {
        const updatedUser = { ...user, bannerUrl: undefined };
        setUser(updatedUser);
        setBannerBg(null);
        localStorage.setItem('autoflow_user', JSON.stringify(updatedUser));
        if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to remove banner:", error);
      alert("Failed to remove banner. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: user.name || '',
    collegeName: user.collegeName || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setBannerBg(initialUser.bannerUrl || null);
    setEditValues({
      name: initialUser.name || '',
      collegeName: initialUser.collegeName || ''
    });
  }, [initialUser]);

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      const userId = user._id || user.id;
      const response = await userApi.uploadAvatar(userId, file);

      if (response.success && response.data?.logoUrl) {
        const updatedUser = { ...user, logoUrl: response.data.logoUrl };
        setUser(updatedUser);
        localStorage.setItem('autoflow_user', JSON.stringify(updatedUser));
        setImageError(false);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload your profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile updates
  const handleSaveProfile = async (field: keyof typeof editValues) => {
    try {
      setIsSaving(true);
      const userId = user._id || user.id;
      const response = await userApi.updateProfile(userId, { [field]: editValues[field] });

      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('autoflow_user', JSON.stringify(updatedUser));
        setEditingField(null);
      }
    } catch (error) {
      console.error(`Failed to update ${String(field)}:`, error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditValues({
      name: user.name || '',
      collegeName: user.collegeName || ''
    });
    setEditingField(null);
  };

  const getAvatarUrl = () => {
    if (!user.logoUrl) return null;
    if (user.logoUrl.startsWith('http')) return user.logoUrl;
    // Serve from backend if it's a relative path starting with /uploads
    return `http://localhost:5000${user.logoUrl}`;
  };

  const getBannerUrl = () => {
    if (!bannerBg) return null;
    if (bannerBg.startsWith('http') || bannerBg.startsWith('data:')) return bannerBg;
    return `http://localhost:5000${bannerBg}`;
  };

  const bannerUrl = getBannerUrl();
  const avatarUrl = getAvatarUrl();

  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto relative isolate">
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#159e8a]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-32 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto p-4 md:p-12 pb-24">

        {/* HEADER / HERO PROFILE */}
        <header className="mb-12 bg-white rounded-3xl shadow-sm border border-slate-200/60">

          {/* Banner + Avatar straddle zone — relative container */}
          <input
            type="file"
            ref={bannerFileInputRef}
            onChange={handleBannerChange}
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
          />
          <div className="relative group/banner">

            {/* Teal Banner */}
            <div
              className="h-36 rounded-t-3xl overflow-hidden relative"
              style={{
                background: bannerUrl
                  ? `url(${bannerUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #159e8a 0%, #0d7a6a 100%)'
              }}
            >
              {bannerUrl && <div className="absolute inset-0 bg-black/20" />}

              {/* Profile / Joined labels */}
              <div className="absolute top-5 inset-x-0 flex justify-between px-7">
                <span className="text-white/90 text-sm font-semibold tracking-wide drop-shadow">Profile</span>
                <span className="text-white/80 text-sm font-medium drop-shadow">
                  Joined in {new Date(user.createdAt || Date.now()).getFullYear()}
                </span>
              </div>

              {/* Banner action buttons — appear on hover */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover/banner:opacity-100 transition z-10">
                {bannerBg && (
                  <button
                    onClick={handleRemoveBanner}
                    className="flex items-center gap-1.5 bg-black/50 hover:bg-red-600/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
                <button
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Edit cover
                </button>
              </div>
            </div>

            {/* Avatar — absolutely at bottom of banner, translate-y-1/2 = exactly half in banner, half below */}
            <div className="absolute bottom-0 left-7 translate-y-1/2 z-10">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-[#159e8a] flex items-center justify-center cursor-pointer group/avatar relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white w-6 h-6" />
                    </div>
                  ) : (avatarUrl && !imageError) ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                  ) : (
                    <span className="text-white text-4xl font-bold select-none">{user.name?.charAt(0) || 'U'}</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>
                {/* Pencil icon — bottom-right of avatar */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0.5 right-0.5 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm hover:bg-slate-50 transition"
                  title="Change profile photo"
                >
                  <Edit2 className="w-3 h-3 text-[#159e8a]" />
                </button>
              </div>
            </div>
          </div>

          {/* White Content Area — pt-16 clears the bottom half of the 112px avatar */}
          <div className="px-7 pb-7 pt-16 bg-white rounded-b-3xl">

            {/* Name Row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex-1">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 focus:ring-2 focus:ring-[#159e8a] focus:outline-none"
                      disabled={isSaving}
                      autoFocus
                    />
                    <button onClick={() => handleSaveProfile('name')} disabled={isSaving} className="p-2 bg-[#159e8a] text-white rounded-lg hover:bg-teal-600 transition">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={cancelEdit} disabled={isSaving} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                )}
              </div>
              {editingField !== 'name' && (
                <button
                  onClick={() => setEditingField('name')}
                  className="text-sm font-semibold text-[#159e8a] hover:underline ml-4 shrink-0"
                >
                  Change Name
                </button>
              )}
            </div>

            {/* Email Row */}
            <div className="flex items-center border-b border-slate-100 pb-3 mb-3">
              <p className="text-sm text-slate-500 font-medium">{user.email}</p>
            </div>

            {/* Institution Row */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingField === 'collegeName' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.collegeName}
                      onChange={(e) => setEditValues({ ...editValues, collegeName: e.target.value })}
                      className="text-sm text-slate-600 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#159e8a] focus:outline-none w-full max-w-xs"
                      disabled={isSaving}
                      placeholder="University or College Name"
                      autoFocus
                    />
                    <button onClick={() => handleSaveProfile('collegeName')} disabled={isSaving} className="p-2 bg-[#159e8a] text-white rounded-lg hover:bg-teal-600 transition">
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={cancelEdit} disabled={isSaving} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 font-medium">{user.collegeName || 'No institution specified'}</p>
                )}
              </div>
              {editingField !== 'collegeName' && (
                <button
                  onClick={() => setEditingField('collegeName')}
                  className="text-sm font-semibold text-[#159e8a] hover:underline ml-4 shrink-0"
                >
                  Manage
                </button>
              )}
            </div>

          </div>
        </header>



        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Illustration) */}
          <div className="lg:col-span-2">
            <div className="h-full bg-white rounded-[2rem] border border-slate-200/60 p-2 shadow-sm flex items-center justify-center overflow-hidden">
              <img src={TeamWorkBro} className="w-full max-w-xl h-auto" alt="Team Work" />
            </div>
          </div>

          {/* Right Column — Upgrade to Pro card */}
          <div className="lg:col-span-1">
            <div className="h-full bg-white border border-slate-100 rounded-3xl shadow-sm p-8 text-center relative flex flex-col justify-between">
              <div>
                {/* Crown icon */}
                <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                  <Crown size={36} className="text-amber-500" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2">Go Pro</h2>
                <p className="text-slate-500 font-medium mb-1">Unlock Your Full Potential</p>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Upgrade to <span className="font-bold text-slate-600">Auto-Flow Pro</span> and get the full academic edge — faster AI, unlimited workspaces, and deeper insights.
                </p>

                {/* Perks */}
                <div className="bg-gradient-to-br from-[#159e8a10] to-teal-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                  {[
                    'Unlimited workspaces',
                    'Admin direct uploads',
                    'Priority AI analysis',
                    'Advanced analytics'
                  ].map(perk => (
                    <div key={perk} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Zap size={14} className="text-[#159e8a] shrink-0" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-[#159e8a] to-teal-400 text-white rounded-2xl font-black text-lg shadow-lg shadow-[#159e8a33] hover:opacity-90 transition-all mt-auto">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components






const ActivityItem = ({ file, date, status }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-50/50 rounded-xl text-blue-600 border border-blue-100/50 shadow-sm shadow-blue-100/20">
        <FileText size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 mb-0.5">{file}</p>
        <p className="text-xs text-slate-400 font-medium">{date}</p>
      </div>
    </div>
    <span className="text-xs font-bold text-[#159e8a] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
      {status}
    </span>
  </div>
);

export default ProfilePage;