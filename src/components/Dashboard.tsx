import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import { DocumentAnalysis, User, Workspace } from '../types';
import AnalysisSummaryModal from './AnalysisSummaryModal';
import {
  FileText, LogOut, Home, Ruler, Type, AlignLeft,
  ChevronDown, ChevronUp, Upload, Download, Trash2,
  Search, Settings,
  Users2,
  BarChart3,
  Files,
  Settings2,
  FolderInput // Added import
} from 'lucide-react';
import Stats from './Stats';
import UploadRafiki from '../assets/Upload-rafiki.svg';
const Image_API_URL = import.meta.env.VITE_API_URL;


interface DashboardProps {
  user: User;
  workspaces?: Workspace[]; // Added prop
  onFileSelect: (file: File, formatType?: string, templateFile?: File, formatRequirements?: string) => void;
  onAddToWorkspace?: (doc: DocumentAnalysis, workspaceId: string) => void; // Added prop
  isProcessing: boolean;
  history: DocumentAnalysis[];
  onLogout: (message?: string, type?: 'success' | 'info' | 'error') => void;
  onDeleteDocument: (fileName: string, uploadDate: string) => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
  onViewAnalysis?: (doc: DocumentAnalysis) => void; // Added prop
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  workspaces = [], // Default to empty array
  onFileSelect,
  onAddToWorkspace,
  isProcessing,
  history = [],
  onLogout,
  onDeleteDocument,
  onNavigateProfile,
  onNavigateSettings,
  onViewAnalysis
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [formatType, setFormatType] = useState<'default' | 'custom' | 'concept' | 'report'>('default');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [formatRequirements, setFormatRequirements] = useState<string>('');

  // New state for workspace modal
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState<DocumentAnalysis | null>(null);
  const [viewAnalysis, setViewAnalysis] = useState<DocumentAnalysis | null>(null); // State for view modal
  const [imageError, setImageError] = useState(false);

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
                    [sectionKey]: prev[sectionKey].map((f: any, i: number) => i === index ? { ...f, value: val } : f)
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
    <div className="h-full w-full bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden flex flex-col">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto py-8 px-6 md:px-10">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center w-full gap-6">
          <div className="flex flex-row items-baseline gap-4">
            <h1 className="text-4xl text-[#159e8a] font-black tracking-tight leading-10 mb-0">AUTO-FLOW</h1>
            <p className="text-[#159e8a] font-medium text-lg m-0">{user.collegeName}</p>
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer group hover:bg-slate-100 p-2 pr-4 rounded-full transition-colors"
            onClick={onNavigateProfile}
            title="View Profile"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-white shadow-[0_0_0_2px_#159e8a,0_4px_10px_rgba(21,158,138,0.2)] bg-[#159e8a] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              {(user.logoUrl && !imageError) ? (
                <img
                  src={user.logoUrl.startsWith('http') ? user.logoUrl : `${Image_API_URL}${user.logoUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    setImageError(true);
                  }}
                />
              ) : (
                <span className="text-white text-xl font-bold tracking-tight select-none">
                  {user.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <p className="text-slate-800 text-base font-bold">
              {user.name}
            </p>
          </div>
        </header>


        {/* UPLOAD & REQUIREMENTS SECTION */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex gap-2 mb-8 p-1 bg-slate-100 w-fit rounded-xl border border-slate-200">
            {(['default', 'report'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFormatType(type)}
                className={`relative px-8 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${formatType === type ? 'bg-white text-[#159e8a] shadow-md' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {type.toUpperCase()}

              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-0">
            {/* Directional Dotted Arrow */}
            {(formatType === 'default' || formatType === 'report') && (
              <div className="hidden xl:flex absolute left-1/2 -ml-6 top-1/2 -translate-y-1/2 w-[22rem] h-40 items-center justify-center pointer-events-none z-10 opacity-70">
                <svg viewBox="0 0 250 120" className="w-full h-full text-indigo-400 drop-shadow-sm" fill="none" stroke="currentColor">
                  {/* Extruded curly dashes with a loop in the middle */}
                  <path d="M 230 90 C 180 120, 140 80, 150 50 C 160 20, 200 40, 170 80 C 140 120, 60 60, 0 60" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
                  {/* Arrowhead pointing left at the very edge (x=0) */}
                  <path d="M 0 60 L 15 50 M 0 60 L 15 70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            <div className="space-y-6">
              <FileUpload onFileSelect={(file) => onFileSelect(file, formatType, templateFile || undefined, formatRequirements)} isProcessing={isProcessing} />
            </div>

            {(formatType === 'default' || formatType === 'report') && (
              <div className="flex items-center justify-end pr-12 xl:pr-8 opacity-90 pointer-events-none w-full h-full -mt-6">
                <img src={UploadRafiki} alt="Upload Illustration" className="h-[220px] xl:h-[260px] w-auto object-contain drop-shadow-sm right-0" />
              </div>
            )}
          </div>
        </div>



        {/* RECENT ANALYSiS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Analysis</h3>
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
                <th className="px-8 py-4">Type</th>
                {/* <th className="px-8 py-4">Date</th> */}
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
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${doc.formatType === 'concept' ? 'bg-indigo-100 text-indigo-600' :
                      doc.formatType === 'report' ? 'bg-amber-100 text-amber-700' :
                        doc.formatType === 'custom' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                      }`}>
                      {doc.formatType || 'Default'}
                    </span>
                  </td>
                  {/* <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                    {doc.uploadDate
                      ? new Date(doc.uploadDate).toISOString().slice(0, 10)
                      : '—'}
                  </td> */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (doc.formatType === 'concept') {
                            navigate(`/concept-analysis/${doc.analysisId}`);
                          } else if (doc.formatType === 'report') {
                            navigate(`/report-analysis/${doc.analysisId}`);
                          } else if (onViewAnalysis) {
                            onViewAnalysis(doc);
                          } else {
                            setViewAnalysis(doc);
                          }
                        }}
                        className="text-slate-400 hover:text-blue-500"
                        title="View Details"
                      >
                        <Files size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDocForUpload(doc);
                          setIsWorkspaceModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-[#159e8a]"
                        title="Add to Workspace"
                      >
                        <FolderInput size={18} />
                      </button>
                      <button onClick={() => onDeleteDocument(doc.fileName, doc.uploadDate)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* WORKSPACE SELECTION MODAL */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Add to Workspace</h3>
            <p className="text-slate-500 text-sm mb-6">Select a workspace to add <span className="font-bold text-slate-700">{selectedDocForUpload?.fileName}</span> to.</p>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {workspaces.length > 0 ? (
                workspaces.map((ws, index) => {
                  // Robust ID handling
                  const workspaceId = ws.id || ws._id;
                  if (!workspaceId) return null; // Skip invalid workspaces

                  return (
                    <button
                      key={workspaceId || index} // Fallback key just in case
                      onClick={() => {
                        if (selectedDocForUpload && onAddToWorkspace) {
                          onAddToWorkspace(selectedDocForUpload, workspaceId);
                          setIsWorkspaceModalOpen(false);
                        }
                      }}
                      className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-teal-50 hover:border-[#159e8a33] transition-all text-left flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#159e8a] shadow-sm">
                        <Users2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 group-hover:text-[#159e8a]">{ws.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{ws.members?.length || 1} Member{ws.members?.length !== 1 && 's'}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">No workspaces found.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsWorkspaceModalOpen(false)}
              className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ANALYSIS SUMMARY MODAL */}
      <AnalysisSummaryModal
        isOpen={!!viewAnalysis}
        onClose={() => setViewAnalysis(null)}
        analysis={viewAnalysis}
      />
    </div>
  );
};

export default Dashboard;