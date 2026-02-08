import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FileUpload from './FileUpload';
import { DocumentAnalysis, User } from '../types';
import { 
  FileText, LogOut, Home, Ruler, Type, AlignLeft, 
  ChevronDown, ChevronUp, Upload, Download, Trash2,
  Search, Settings,
  Users2,
  BarChart3,
  Files,
  Settings2
} from 'lucide-react';
import Stats from './Stats';

interface DashboardProps {
  user: User;
  onFileSelect: (file: File, formatType?: string, templateFile?: File, formatRequirements?: string) => void;
  isProcessing: boolean;
  history: DocumentAnalysis[];
  onLogout: () => void;
  onDeleteDocument: (fileName: string, uploadDate: string) => void;
  onNavigateHome?: () => void; // This goes to Profile
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onFileSelect,
  isProcessing,
  history = [],
  onLogout,
  onDeleteDocument,
  onNavigateHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatType, setFormatType] = useState<'default' | 'custom'>('default');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [formatRequirements, setFormatRequirements] = useState<string>('');

  // ... (Keep all your existing FormatField logic and initialFormatFields exactly as they are)
  const initialFormatFields: Record<string, any[]> = {
    margins: [
      { id: 'left-margin', label: 'Left Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'right-margin', label: 'Right Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'top-margin', label: 'Top Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'bottom-margin', label: 'Bottom Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
    ],
    typography: [
      { id: 'font-family', label: 'Font Family', value: '', icon: <Type size={16} />, placeholder: 'e.g., Arial', type: 'select', options: ['Arial', 'Times New Roman', 'Calibri', 'Georgia', 'Verdana', 'Custom...'] },
      { id: 'font-size', label: 'Font Size', value: '', icon: <Type size={16} />, placeholder: 'e.g., 12pt', type: 'select', options: ['10pt', '11pt', '12pt', '14pt', '16pt', 'Custom...'] },
    ],
    spacing: [
      { id: 'line-spacing', label: 'Line Spacing', value: '', icon: <AlignLeft size={16} />, placeholder: 'e.g., 1.5', type: 'select', options: ['Single', '1.15', '1.5', 'Double', 'Custom...'] },
    ]
  };

  const [formatFields, setFormatFields] = useState(initialFormatFields);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ margins: true });
  const [customInputMode, setCustomInputMode] = useState<Record<string, boolean>>({});

  const generateRequirementsString = useCallback((fields: any) => {
    const lines: string[] = ["### MANDATORY FORMATTING RULES ###"];
    Object.entries(fields).forEach(([section, fieldList]: [string, any]) => {
      const active = fieldList.filter((f: any) => f.value.trim() && f.value !== 'Default');
      if (active.length > 0) {
        active.forEach((f: any) => lines.push(`!!! RULE: DOCUMENT MUST USE ${f.value.toUpperCase()} FOR ${f.label.toUpperCase()} !!!`));
      }
    });
    return lines.length === 1 ? "Standard formatting." : lines.join('\n');
  }, []);

  useEffect(() => {
    setFormatRequirements(generateRequirementsString(formatFields));
  }, [formatFields, generateRequirementsString]);

  const filteredHistory = useMemo(() => {
    return (history || []).filter((doc) => doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [history, searchQuery]);

  // (Helper render functions stay the same...)
  const renderSection = (sectionKey: string, title: string, fields: any[]) => (
    <div className="bg-slate-50 rounded-lg border border-slate-200 mb-3 overflow-hidden">
      <button onClick={() => setExpandedSections(p => ({ ...p, [sectionKey]: !p[sectionKey] }))} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{title}</span>
        </div>
        {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 py-4 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</label>
              <select 
                value={field.value} 
                onChange={(e) => {
                    const val = e.target.value;
                    setFormatFields(prev => ({
                        ...prev,
                        [sectionKey]: prev[sectionKey].map((f: any, i: number) => i === index ? {...f, value: val} : f)
                    }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="">Default</option>
                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 flex-shrink-0">
        <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl text-[#159e8a]">A</div>
        <div className="flex flex-col gap-8 flex-1">
          {/* Dashboard Icon - Active on this page */}
          <button className="p-3 bg-teal-50 text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]">
            <FileText size={24} />
          </button>
          {/* Profile Icon - Navigates to Home/Profile */}
          <button 
            onClick={onNavigateHome} 
            className="p-3 text-slate-400 hover:text-[#159e8a] transition-colors"
          >
            <Users2 size={24} />
          </button>
          <button 
      onClick={onNavigateHome} // This triggers setCurrentView('settings') in App.js
      className="p-3 text-slate-400 hover:text-[#159e8a] transition-colors"
    >
      <Settings2 size={24} /> 
    </button>
  </div>
        <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4">
          <LogOut size={24} />
        </button>
      </aside>
      

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10">
        <header className="mb-8 flex justify-between items-end w-full">
          <div>
            <h1 className="text-3xl text-[#159e8a] font-bold tracking-tight">AUTO-FLOW</h1>
            <p className="text-[#159e8a] font-medium">{user.collegeName} Dashboard</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            Welcome, <span className="text-slate-700 font-bold">{user.name}</span>
          </div>
                     {/* STATS SUMMARY CARDS */}
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 flex-1 md:flex-initial">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Files size={20}/></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Total</p><p className="text-xl font-black text-slate-800 leading-none">{Stats.total}</p></div>
            </div>
            <div className="bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 flex-1 md:flex-initial">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><BarChart3 size={20}/></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Avg Score</p><p className="text-xl font-black text-slate-800 leading-none">{Stats.avgScore}%</p></div>
            </div>
          </div>
        
        </header>


        {/* UPLOAD & REQUIREMENTS SECTION */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 w-fit rounded-xl border border-slate-200">
              {(['default', 'custom'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormatType(type)}
                  className={`px-8 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${
                    formatType === type ? 'bg-white text-[#159e8a] shadow-md' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type.toUpperCase()} 
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              <div className="space-y-6">
                <FileUpload onFileSelect={(file) => onFileSelect(file, formatType, templateFile || undefined, formatRequirements)} isProcessing={isProcessing} />
                {formatType === 'custom' && (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <h4 className="font-bold text-slate-700 text-xs mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Upload size={14}/> Optional: Template
                    </h4>
                    <input type="file" onChange={(e) => setTemplateFile(e.target.files?.[0] || null)} className="text-xs cursor-pointer w-full" />
                  </div>
                )}
              </div>

              {formatType === 'custom' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Formatting Requirements</h3>
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    {renderSection('margins', 'Page Layout', formatFields.margins)}
                    {renderSection('typography', 'Typography', formatFields.typography)}
                    {renderSection('spacing', 'Spacing', formatFields.spacing)}
                  </div>
                </div>
              )}
            </div>
        </div>
       


        {/* RECENT ANALYSES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Analyses</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs outline-none w-48" 
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="px-8 py-4">Document</th>
                <th className="px-8 py-4">Score</th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((doc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-teal-600" size={18} />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{doc.fileName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{doc.totalScore}%</td>
                  <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDeleteDocument(doc.fileName, doc.uploadDate)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
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