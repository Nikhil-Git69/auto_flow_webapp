import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  BrainCircuit,
  Camera,
  Loader2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { userApi } from '../services/api';

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
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

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: user.name || '',
    collegeName: user.collegeName || '',
    department: user.department || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setEditValues({
      name: initialUser.name || '',
      collegeName: initialUser.collegeName || '',
      department: initialUser.department || ''
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
      collegeName: user.collegeName || '',
      department: user.department || ''
    });
    setEditingField(null);
  };

  const getAvatarUrl = () => {
    if (!user.logoUrl) return null;
    if (user.logoUrl.startsWith('http')) return user.logoUrl;
    // Serve from backend if it's a relative path starting with /uploads
    return `http://localhost:5000${user.logoUrl}`;
  };

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
        <header className="mb-12 relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/10 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
            {/* Avatar Section */}
            <div className="relative group/avatar cursor-pointer w-32 h-32 md:w-36 md:h-36 shrink-0" onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />

              <div className="w-full h-full rounded-full overflow-hidden shadow-2xl shadow-teal-900/10 border-[4px] border-white relative bg-[#159e8a] flex items-center justify-center">
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white w-8 h-8" />
                  </div>
                ) : (avatarUrl && !imageError) ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white text-5xl font-bold tracking-tight select-none">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                  <Camera className="text-white w-8 h-8 drop-shadow-md" />
                  <span className="text-white text-xs font-bold tracking-wider uppercase drop-shadow">Change</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-2">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="text-3xl font-bold tracking-tight text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-4 py-1 focus:ring-2 focus:ring-[#159e8a] focus:outline-none"
                      disabled={isSaving}
                      autoFocus
                    />
                    <button onClick={() => handleSaveProfile('name')} disabled={isSaving} className="p-2 bg-[#159e8a] text-white rounded-lg hover:bg-teal-600 transition">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button onClick={cancelEdit} disabled={isSaving} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-3 group/edit">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">{user.name}</h1>
                    <button onClick={() => setEditingField('name')} className="opacity-0 group-hover/edit:opacity-100 p-1.5 text-slate-400 hover:text-[#159e8a] hover:bg-teal-50 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Badges / Roles */}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-200 shadow-sm flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" /> Exclusive Pro
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200 shadow-sm">
                  {user.role}
                </span>
              </div>

              {/* College Info */}
              {editingField === 'collegeName' ? (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                  <input
                    type="text"
                    value={editValues.collegeName}
                    onChange={(e) => setEditValues({ ...editValues, collegeName: e.target.value })}
                    className="text-lg text-slate-600 bg-slate-50 border border-slate-300 rounded-xl px-4 py-1.5 focus:ring-2 focus:ring-[#159e8a] focus:outline-none w-full max-w-xs"
                    disabled={isSaving}
                    placeholder="University or College Name"
                    autoFocus
                  />
                  <button onClick={() => handleSaveProfile('collegeName')} disabled={isSaving} className="p-2 bg-[#159e8a] text-white rounded-lg hover:bg-teal-600 transition">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={cancelEdit} disabled={isSaving} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="group/edit inline-flex items-center gap-2 mt-1">
                  <p className="text-lg text-slate-500 font-medium">{user.collegeName || "Add your institution"}</p>
                  <button onClick={() => setEditingField('collegeName')} className="opacity-0 group-hover/edit:opacity-100 p-1.5 text-slate-400 hover:text-[#159e8a] hover:bg-teal-50 rounded-lg transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<FileText className="text-blue-500" />} bgColor="bg-blue-50" label="Total Analyzed" value="128" unit="files" />
          <StatCard icon={<BrainCircuit className="text-purple-500" />} bgColor="bg-purple-50" label="AI Accuracy Score" value="98.4" unit="%" />
          <StatCard icon={<Zap className="text-[#159e8a]" />} bgColor="bg-teal-50" label="Time Saved" value="42" unit="hours" />
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Details & Activity) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Account Settings Display */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10" />
              <h2 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
                <ShieldCheck className="text-slate-400" /> Account Details
              </h2>

              <div className="space-y-2">
                <ConfigItem label="Email Address" value={user.email} verified={true} />

                {/* Department Inline Edit */}
                <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 group/edit transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 mb-1">Department</p>
                    {editingField === 'department' ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={editValues.department}
                          onChange={(e) => setEditValues({ ...editValues, department: e.target.value })}
                          className="text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#159e8a] focus:outline-none w-full max-w-[200px]"
                          placeholder="e.g. Computer Science"
                          disabled={isSaving}
                          autoFocus
                        />
                        <button onClick={() => handleSaveProfile('department')} disabled={isSaving} className="text-[#159e8a] p-1.5 hover:bg-teal-50 rounded">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={cancelEdit} disabled={isSaving} className="text-slate-400 p-1.5 hover:bg-slate-100 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{user.department || "Not specified"}</p>
                    )}
                  </div>
                  {editingField !== 'department' && (
                    <button onClick={() => setEditingField('department')} className="opacity-0 group-hover/edit:opacity-100 text-xs font-bold text-[#159e8a] hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-teal-100">
                      Edit
                    </button>
                  )}
                </div>

                <ConfigItem label="Analysis Preference" value="Deep Academic Feedback" isActionable />
                <ConfigItem label="Subscription Plan" value="Exclusive Pro Yearly" isActionable />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <h2 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
                <Clock className="text-slate-400" /> Recent Activity
              </h2>
              <div className="space-y-3">
                <ActivityItem file="Thesis_Final_Draft.pdf" date="2 hours ago" status="Completed" />
                <ActivityItem file="Lab_Report_V2.docx" date="Yesterday" status="Completed" />
                <ActivityItem file="Project_Proposal.pdf" date="Oct 12, 2024" status="Reviewed" />
              </div>
            </div>

          </div>

          {/* Right Column (Pro Perks) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white h-fit shadow-2xl relative overflow-hidden group">
              {/* Animated Gradients inside Dark Card */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full group-hover:bg-teal-400/30 transition-colors duration-700" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-400/30 transition-colors duration-700" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <Award className="text-amber-400 w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-2xl tracking-tight">Pro License</h3>
                </div>

                <ul className="space-y-4 mb-10">
                  {[
                    "Priority AI Processing Queue",
                    "Unlimited File Upload Sizes",
                    "Advanced Plagiarism Scanning",
                    "Custom Institutional Formats",
                    "Export to Native Formats"
                  ].map((perk, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="p-1 bg-[#159e8a]/20 rounded-full border border-[#159e8a]/30">
                        <ShieldCheck size={14} className="text-[#159e8a]" />
                      </div>
                      <span className="font-medium tracking-wide">{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-inner">
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#159e8a]">Monthly Allowance</p>
                    <p className="text-xs font-bold text-slate-300">65% Used</p>
                  </div>
                  <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden shadow-inner border border-slate-800">
                    <div className="bg-gradient-to-r from-teal-500 to-[#159e8a] h-full w-[65%] shadow-[0_0_12px_rgba(21,158,138,0.6)] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 font-medium">Resets in 12 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon, label, value, unit, bgColor }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 ${bgColor} rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 ease-out`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</h3>
      <div className="flex items-baseline gap-1">
        <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">{value}</p>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>
    </div>
  </div>
);

const ConfigItem = ({ label, value, isActionable, verified }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 group transition-all">
    <div>
      <p className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
        {label}
        {verified && <Check className="w-3.5 h-3.5 text-white bg-green-500 rounded-full p-0.5" />}
      </p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
    {isActionable && (
      <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-[#159e8a] hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-teal-100">
        Update
      </button>
    )}
  </div>
);

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