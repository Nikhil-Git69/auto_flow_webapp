import React, { useState } from 'react';
import {
  ChevronRight, Key, Mail, Bell, Moon, Globe,
  HelpCircle, Shield, FileText, Trash2, ArrowLeft, Search, Info, Crown,
  AlertTriangle, X, User as UserIcon, Zap, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { userApi } from '../services/api';

interface SettingsViewProps {
  user: any;
  onLogout: (message?: string, type?: 'success' | 'info' | 'error') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security'>('general');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password change form state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock states for toggles
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.id && !user?._id) return;

    setIsDeleting(true);
    setError(null);
    try {
      await userApi.deleteAccount(user.id || user._id);
      onLogout('Account deleted successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (passwords.current === passwords.new) {
      setError("New password cannot be the same as your current password");
      return;
    }

    setIsChangingPassword(true);
    setError(null);
    try {
      await userApi.changePassword(user.id || user._id, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      setSuccessMessage("Password changed successfully! Logging you out...");
      // Wait a bit so they can see the message
      setTimeout(() => {
        onLogout('Password changed successfully. Please login again.', 'success');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <UserIcon size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Moon size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security & Data', icon: <Shield size={18} /> },
  ];

  return (
    <div className="h-full bg-[#fcfcfd] font-sans antialiased text-slate-800 overflow-y-auto w-full relative">
      <div className="max-w-6xl mx-auto p-8 md:p-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#159e8a] mb-2">Settings</h1>
            <p className="text-slate-500 font-medium">Customize your workspace and account experience.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* NAVIGATION SIDEBAR */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-[32px] border border-slate-100 p-4 shadow-sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                      ? 'bg-teal-50 text-[#159e8a]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-6 text-white overflow-hidden relative group shadow-xl">
              <Crown className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-1">Pro Member</h3>
                <p className="text-slate-400 text-xs font-medium mb-4 leading-relaxed">You're currently on the free plan.</p>
                <button className="w-full bg-[#159e8a] py-2.5 rounded-xl text-sm font-black hover:bg-[#0f8a77] transition-all shadow-lg shadow-[#159e8a33]">
                  Upgrade Now
                </button>
              </div>
            </div>
          </aside>

          {/* SETTINGS CONTENT */}
          <div className="lg:col-span-9 space-y-8 min-h-[500px]">
            {activeTab === 'general' && (
              <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-[#159e8a]">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">General Account</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Profile & Details</p>
                  </div>
                </div>

                <div className="p-8">
                  {/* Profile Card */}
                  <div className="bg-slate-50/50 rounded-3xl p-6 flex items-center gap-6 mb-8 border border-slate-100/50">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{user?.name}</h3>
                      <p className="text-slate-500 font-medium mb-2">{user?.email}</p>

                    </div>
                  </div>

                  <div className="space-y-2">
                    <NavigationItem
                      icon={<FileText size={18} />}
                      label="Public Profile"
                      description="View and manage how others see your profile."
                    />
                    <NavigationItem
                      icon={<Globe size={18} />}
                      label="Institution"
                      description={user?.collegeName || 'Add your university or organization.'}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'appearance' && (
              <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                    <Moon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">Appearance</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Interface Theme</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <ToggleItem
                    icon={<Moon size={18} />}
                    label="Dark Mode"
                    description="Switch to a darker interface for better night viewing."
                    enabled={darkMode}
                    onChange={setDarkMode}
                  />
                  <NavigationItem
                    icon={<Globe size={18} />}
                    label="Language"
                    description="English (United States)"
                  />
                  <NavigationItem
                    icon={<Info size={18} />}
                    label="Display Density"
                    description="Comfortable"
                  />
                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">Notifications</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Alerts & Messaging</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <ToggleItem
                    icon={<Mail size={18} />}
                    label="Email Notifications"
                    description="Receive weekly summaries and workspace alerts."
                    enabled={emailNotifs}
                    onChange={setEmailNotifs}
                  />
                  <ToggleItem
                    icon={<Bell size={18} />}
                    label="Push Notifications"
                    description="Get real-time updates directly on your device."
                    enabled={pushNotifs}
                    onChange={setPushNotifs}
                  />
                </div>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">Security & Data</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Protection & Management</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <NavigationItem
                    icon={<Key size={18} />}
                    label="Change Password"
                    description=""
                    onClick={() => {
                      setError(null);
                      setPasswords({ current: '', new: '', confirm: '' });
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setIsPasswordModalOpen(true);
                    }}
                  />
                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <NavigationItem
                      icon={<Trash2 size={18} />}
                      label="Delete Account"
                      description="Permanently delete your account and all associated data."
                      danger
                      onClick={() => setIsDeleteModalOpen(true)}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isChangingPassword && setIsPasswordModalOpen(false)}
          />
          <div className="relative bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
              disabled={isChangingPassword}
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-teal-50 rounded-[20px] flex items-center justify-center text-[#159e8a] mb-6">
              <Key size={32} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3">Change Password</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Enter your current password and your new password below.
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#159e8a22] focus:border-[#159e8a] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#159e8a22] focus:border-[#159e8a] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#159e8a22] focus:border-[#159e8a] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <Info size={16} /> {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl text-[#159e8a] text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <CheckCircle size={16} /> {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isChangingPassword || successMessage !== null}
                  className="w-full bg-[#159e8a] text-white font-black py-4 rounded-[20px] hover:bg-[#0f8a77] transition-all shadow-lg shadow-teal-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isChangingPassword}
                  className="w-full bg-slate-50 text-slate-600 font-black py-4 rounded-[20px] hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-red-50 rounded-[20px] flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3">Delete Account?</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              This action is <span className="text-red-500 font-bold">permanent</span> and cannot be undone. All your workspaces, documents, and data will be permanently removed.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <Info size={16} /> {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-red-500 text-white font-black py-4 rounded-[20px] hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="w-full bg-slate-50 text-slate-600 font-black py-4 rounded-[20px] hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Navigation Item Component
const NavigationItem = ({ icon, label, description, danger, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 px-6 group hover:bg-slate-50/50 transition-all rounded-2xl"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl transition-all ${danger ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-sm font-black ${danger ? 'text-red-600' : 'text-slate-800'}`}>{label}</p>
        <p className="text-xs text-slate-400 font-medium tracking-tight">{description}</p>
      </div>
    </div>
    {danger ? (
      <span className="text-xs font-black text-red-400 group-hover:text-red-500 transition-colors bg-red-50/50 px-3 py-1 rounded-full">DELETE</span>
    ) : (
      <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
    )}
  </button>
);

const ToggleItem = ({ icon, label, description, enabled, onChange }: any) => (
  <div className="flex items-center justify-between p-4 px-6 rounded-2xl hover:bg-slate-50/50 transition-all">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-black text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-medium tracking-tight">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-all relative ${enabled ? 'bg-[#159e8a]' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

export default SettingsView;