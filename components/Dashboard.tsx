import React, { useState, useMemo } from 'react';
import FileUpload from './FileUpload';
import { DocumentAnalysis, User } from '../types';
import { 
  FileText, ShieldCheck, Zap, BarChart3, LogOut, School, 
  Home, Users, Share2, Search, Download, Trash2 
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  history: DocumentAnalysis[];
  onLogout: () => void;
  // This must be passed from the parent to update the state
  onDeleteDocument: (fileName: string, uploadDate: string) => void;
  onNavigateHome?: () => void; // Add this prop
  isHome?: boolean; // Add this prop to know if we're on home page
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onFileSelect,
  isProcessing,
  history,
  onLogout,
  onDeleteDocument,
  onNavigateHome, // Destructure the new prop
  isHome = false // Default to false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>('2021-01-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  /* 🔹 FUNCTIONAL DOWNLOAD */
  const handleDownload = (doc: DocumentAnalysis) => {
    // If you have the actual file URL in your doc object, use that.
    // Otherwise, we create a placeholder for the analysis report.
    const link = document.createElement('a');
    link.href = "#"; // Replace with doc.fileUrl if available
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* 🔹 FUNCTIONAL DELETE */
  const handleDelete = (doc: DocumentAnalysis) => {
    if (window.confirm(`Permanently delete ${doc.fileName}?`)) {
      onDeleteDocument(doc.fileName, doc.uploadDate);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((doc) => {
      const docDate = new Date(doc.uploadDate).toISOString().split('T')[0];
      const isWithinDate = docDate >= startDate && docDate <= endDate;
      const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return isWithinDate && matchesSearch;
    });
  }, [history, startDate, endDate, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 sticky top-0 h-screen">
        <div className="text-[#159e8a]">
          <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl">A</div>
        </div>
        <div className="flex flex-col gap-8 flex-1">
          {/* Home button - active when not on dashboard */}
          <button 
            onClick={onNavigateHome} 
            className={`p-3 transition-colors ${
              isHome 
                ? 'bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]' 
                : 'text-slate-400 hover:text-[#159e8a]'
            }`}
          >
            <Home size={24} />
          </button>
          {/* FileText button - active when on dashboard */}
          <button 
            onClick={onNavigateHome} // Same function toggles back to dashboard
            className={`p-3 transition-colors ${
              !isHome 
                ? 'bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]' 
                : 'text-slate-400 hover:text-[#159e8a]'
            }`}
          >
            <FileText size={24} />
          </button>
        </div>
        <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4">
          <LogOut size={24} />
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Documents</h1>
            <p className="text-slate-500 text-sm mt-1">Institutional portal for {user.collegeName}.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-400 ml-2">Show from</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 outline-[#159e8a]"/>
            <span className="text-slate-400">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 outline-[#159e8a]"/>
          </div>
        </header>

        <div className="flex items-center justify-between border-b border-slate-200 mb-8">
          <div className="pb-4 border-b-2 border-[#159e8a] text-[#159e8a] font-semibold text-sm">
            All documents <span className="ml-1 bg-[#e8f6f4] px-2 py-0.5 rounded text-xs">{filteredHistory.length}</span>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-600 w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 mb-10 hover:border-[#159e8a] transition-colors">
          <FileUpload onFileSelect={onFileSelect} isProcessing={isProcessing} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((doc, idx) => (
                <tr key={`${doc.fileName}-${doc.uploadDate}`} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-700 flex items-center gap-3">
                    <FileText size={18} className="text-[#159e8a]" />
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${doc.totalScore > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {doc.totalScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button onClick={() => handleDownload(doc)} className="text-slate-300 hover:text-[#159e8a]"><Download size={18} /></button>
                      <button onClick={() => handleDelete(doc)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;