import React, { useState } from 'react';
import {
  ChevronRight, Key, Mail, Bell, Moon, Globe,
  HelpCircle, Shield, FileText, Trash2, ArrowLeft, LogOut, Search, Info
} from 'lucide-react';

import { deleteAccount } from '../services/authService';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: (message?: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onLogout }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // State for toggles to make the UI interactive (Visual only)
  const [toggles, setToggles] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    analysisComplete: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const confirmed = window.confirm(
      "⚠️ ARE YOU SURE? \n\nThis will permanently delete your account and all your documents. This action CANNOT be undone."
    );

    if (confirmed) {
      // Second confirmation for safety
      const doubleCheck = window.confirm(
        "🔴 LAST WARNING\n\nAll your data will be wiped immediately. Click OK to confirm account deletion."
      );

      if (doubleCheck) {
        setIsDeleting(true);
        try {
          await deleteAccount();
          // alert("Account deleted successfully."); // Removed alert
          onLogout("Account deleted successfully"); // Pass custom toast message
        } catch (error: any) {
          alert(`Failed to delete account: ${error.message}`);
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <div className="h-full bg-[#fcfcfd] font-sans antialiased text-slate-800 overflow-y-auto">
      {/* HEADER */}
      <header className="max-w-3xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Customize your experience and manage your account</p>
          </div>
        </div>
        {/* Mock Zoom Control from Image */}
        <div className="flex bg-slate-800 text-white rounded-lg p-1 items-center gap-3 px-3 shadow-lg">
          <button className="text-lg opacity-60 hover:opacity-100">−</button>
          <Search size={14} />
          <button className="text-lg opacity-60 hover:opacity-100">+</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20 space-y-6">

        {/* APPEARANCE SECTION */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-sm font-bold text-slate-800">Appearance</h2>
          </div>
          <div className="p-2">
            <ToggleItem
              icon={<Moon size={18} />}
              label="Dark Mode"
              description="Toggle between light and dark theme"
              active={toggles.darkMode}
              onToggle={() => handleToggle('darkMode')}
            />
          </div>
        </section>

        {/* NOTIFICATIONS SECTION */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-sm font-bold text-slate-800">Notifications</h2>
          </div>
          <div className="p-2 divide-y divide-slate-50">
            <ToggleItem
              icon={<Bell size={18} />}
              label="Email Notifications"
              description="Receive updates via email"
              active={toggles.emailNotifications}
              onToggle={() => handleToggle('emailNotifications')}
            />
            <ToggleItem
              icon={<Bell size={18} />}
              label="Push Notifications"
              description="Receive push notifications"
              active={toggles.pushNotifications}
              onToggle={() => handleToggle('pushNotifications')}
            />
            <ToggleItem
              icon={<CheckCircle size={18} />}
              label="Analysis Complete"
              description="Notify when document analysis is done"
              active={toggles.analysisComplete}
              onToggle={() => handleToggle('analysisComplete')}
            />
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-sm font-bold text-slate-800">Preferences</h2>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-4 px-6 group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl"><Globe size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Language</p>
                  <p className="text-xs text-slate-400 font-medium">Choose your preferred language</p>
                </div>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-sm font-bold text-slate-800">Account</h2>
          </div>
          <div className="p-2 divide-y divide-slate-50">
            <NavigationItem
              icon={<Shield size={18} />}
              label="Change Password"
              description="Update your account password"
            />
            <NavigationItem
              icon={<Trash2 size={18} />}
              label={isDeleting ? "Deleting..." : "Delete Account"}
              description="Permanently delete your account and data"
              danger
              onClick={handleDeleteAccount}
            />
          </div>
        </section>

        {/* LOGOUT BUTTON - Full Width Red */}
        <button
          onClick={onLogout}
          className="w-full bg-[#ff3b30] hover:bg-[#e6352b] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Log Out
        </button>

      </main>
    </div>
  );
};

// Toggle Switch Component
const ToggleItem = ({ icon, label, description, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 px-6 group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-medium">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-all relative ${active ? 'bg-[#5856d6]' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

// Navigation Item Component
const NavigationItem = ({ icon, label, description, danger, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 px-6 group hover:bg-slate-50/50 transition-all"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${danger ? 'bg-slate-50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-sm font-bold ${danger ? 'text-slate-800' : 'text-slate-800'}`}>{label}</p>
        <p className="text-xs text-slate-400 font-medium">{description}</p>
      </div>
    </div>
    {danger ? (
      <span className="text-xs font-bold text-red-500 hover:underline">Delete</span>
    ) : (
      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-all" />
    )}
  </button>
);

const CheckCircle = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default SettingsView;