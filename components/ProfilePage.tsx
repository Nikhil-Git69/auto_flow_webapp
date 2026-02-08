import React from 'react';
import { 
  FileText, 
  LogOut, 
  Award, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  BrainCircuit, 
  User2, 
  Home, 
  Settings2,
  Settings
} from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
  onBackToDashboard: () => void;
  onNavigateSettings: () => void; // Defined in interface
}


const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  onLogout, 
  onBackToDashboard, 
  onNavigateSettings 
}) => {
  return (
    <div 
      className="flex min-h-screen font-sans antialiased bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: `linear-gradient(rgba(252, 253, 253, 0.8), rgba(252, 253, 253, 0.8))` 
      }}
    >
      {/* SIDEBAR */}
      <aside className="w-20 md:w-24 bg-white/90 backdrop-blur-md border-r border-slate-200/50 flex flex-col items-center py-8 gap-10 sticky top-0 h-screen z-10">
        <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl text-[#159e8a]">A</div>
        <div className="flex flex-col gap-8 flex-1">
          <button 
            onClick={onBackToDashboard} 
            className="p-3 text-slate-400 hover:text-[#159e8a] transition-colors"
          >
            <FileText size={24} />
          </button>
          <button className="p-3 bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]">
            <User2 size={24} />
          </button>
        </div>
        <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 mb-4 transition-colors">
          <LogOut size={24} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto p-8 md:p-12">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12 bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#159e8a] rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#159e8a1a]">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                <span className="px-3 py-1 bg-amber-50/80 text-amber-600 text-[10px] font-bold uppercase rounded-full border border-amber-100 flex items-center gap-1">
                  <Award size={12} /> Exclusive Pro
                </span>
              </div>
              <p className="text-slate-500 font-medium">{user.collegeName}</p>
            </div>
          </div>

          <button 
            onClick={onNavigateSettings} 
            className="px-6 py-2.5 bg-[#159e8a] text-white rounded-xl font-semibold text-sm hover:opacity-90 flex items-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Settings size={16} />
          </button>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<FileText className="text-blue-600" />} label="Total Analyzed" value="128" unit="files" />
          <StatCard icon={<BrainCircuit className="text-purple-600" />} label="AI Accuracy Score" value="98.4" unit="%" />
          <StatCard icon={<Zap className="text-green-600" />} label="Time Saved" value="42" unit="hours" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-4">Account Configuration</h2>
                <div className="space-y-4">
                  <ConfigItem label="Email Address" value={user.email || "user@example.com"} />
                  <ConfigItem label="Analysis Preference" value="Deep Academic Feedback" />
                </div>
             </div>

             <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18}/> Recent Activity</h2>
                <ActivityItem file="Thesis_Final_Draft.pdf" date="2 hours ago" />
                <ActivityItem file="Lab_Report_V2.docx" date="Yesterday" />
             </div>
          </div>
          
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 text-white h-fit shadow-xl">
            <h3 className="font-bold text-xl mb-4">Pro Perks</h3>
            <ul className="space-y-3 mb-6 text-sm text-slate-300">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#159e8a]"/> Priority AI Processing</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#159e8a]"/> Unlimited File Size</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#159e8a]"/> Academic Plagiarism Check</li>
            </ul>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">Monthly Usage</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#159e8a] h-full w-[65%] shadow-[0_0_8px_rgba(21,158,138,0.5)]"></div>
              </div>
              <p className="text-[10px] text-right text-slate-500 mt-2">65% OF CAPACITY</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components (Helpers)
const StatCard = ({ icon, label, value, unit }: any) => (
  <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
    <div className="p-3 bg-white/50 w-fit rounded-xl mb-4 shadow-inner">{icon}</div>
    <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
    <p className="text-3xl font-bold text-slate-900">{value} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
  </div>
);

const ConfigItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
    <button className="text-xs font-bold text-[#159e8a] hover:underline">Change</button>
  </div>
);

const ActivityItem = ({ file, date }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100/80 rounded-lg text-slate-500"><FileText size={16}/></div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{file}</p>
        <p className="text-[10px] text-slate-400 uppercase font-medium">{date}</p>
      </div>
    </div>
    <span className="text-[10px] font-bold text-green-600 bg-green-50/80 px-2 py-1 rounded-md border border-green-100">Completed</span>
  </div>
);

export default ProfilePage;