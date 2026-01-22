
// import React, { useState, useEffect } from 'react';
// import { UploadedFile, DocumentAnalysis, Issue } from '../types';
// import IssueCard from './IssueCard';
// import Stats from './Stats';
// import { ArrowLeft, CheckCircle, Download, FileText, Filter, Loader2 } from 'lucide-react';
// import { exportCorrectedDocument as runExportService } from '../services/exportService';

// interface AnalysisViewProps {
//   file: UploadedFile;
//   analysis: DocumentAnalysis;
//   onBack: () => void;
// }

// const AnalysisView: React.FC<AnalysisViewProps> = ({ file, analysis, onBack }) => {
//   const [issues, setIssues] = useState<Issue[]>(analysis.issues);
//   const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'RECOMMENDED'>('ALL');
//   const [isExporting, setIsExporting] = useState(false);

//   // Synchronize state if analysis changes
//   useEffect(() => {
//     setIssues(analysis.issues);
//   }, [analysis]);

//   const handleApplyFix = (id: string) => {
//     setIssues(prev => prev.map(issue => 
//       issue.id === id ? { ...issue, isFixed: true } : issue
//     ));
//   };

//   const handleApplyAll = () => {
//     setIssues(prev => prev.map(issue => ({ ...issue, isFixed: true })));
//   };

//   const handleExport = async () => {
//     const fixedCount = issues.filter(i => i.isFixed).length;
//     if (fixedCount === 0) {
//       alert("Please fix (click 'Apply Fix') at least one issue before exporting.");
//       return;
//     }

//     setIsExporting(true);
//     try {
//       await runExportService(file.base64, issues, file.file.name);
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const filteredIssues = issues.filter(i => {
//     if (filter === 'CRITICAL') return i.severity === 'Critical';
//     if (filter === 'RECOMMENDED') return i.severity === 'Recommended';
//     return true;
//   });

//   const fixedCount = issues.filter(i => i.isFixed).length;

//   return (
//     <div className="flex flex-col h-screen bg-slate-50 font-sans">
//       {/* Header */}
//       <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm">
//         <div className="flex items-center gap-4">
//           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
//             <ArrowLeft className="w-5 h-5 text-slate-600" />
//           </button>
//           <div>
//             <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//               <FileText className="w-5 h-5 text-indigo-600" /> {file.file.name}
//             </h1>
//             <p className="text-xs text-slate-500 font-medium">
//               Document Score: <span className={analysis.totalScore > 70 ? "text-green-600" : "text-orange-600"}>{analysis.totalScore}/100</span>
//             </p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-slate-500 font-medium">{fixedCount}/{issues.length} Fixed</span>
//           <button 
//             onClick={handleApplyAll}
//             className="px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
//           >
//             Auto-Fix All
//           </button>
//           <button 
//             onClick={handleExport}
//             disabled={isExporting}
//             className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 flex items-center gap-2 transition-all shadow-md"
//           >
//             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
//             Export Corrected
//           </button>
//         </div>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Document Viewer Area */}
//         <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center">
//           <div className="bg-white shadow-2xl relative w-full max-w-4xl" style={{ height: 'fit-content' }}>
            
//             {/* PINPOINT RED MARKS - These overlay the document */}
//             {issues.map((issue) => (
//               issue.position && !issue.isFixed && (
//                 <div
//                   key={`mark-${issue.id}`}
//                   className={`absolute border-2 z-10 animate-pulse ${
//                     issue.severity === 'Critical' ? 'border-red-500 bg-red-500/10' : 'border-amber-500 bg-amber-500/10'
//                   }`}
//                   style={{
//                     top: `${issue.position.top}%`,
//                     left: `${issue.position.left}%`,
//                     width: `${issue.position.width}%`,
//                     height: `${issue.position.height}%`,
//                     pointerEvents: 'none'
//                   }}
//                 />
//               )
//             ))}

//             {file.mimeType.startsWith('image/') ? (
//               <img src={file.previewUrl} alt="Preview" className="w-full h-auto" />
//             ) : (
//               <object data={file.previewUrl} type="application/pdf" className="w-full min-h-[1100px]">
//                 <iframe src={file.previewUrl} className="w-full h-full" title="pdf-viewer" />
//               </object>
//             )}
//           </div>
//         </div>

//         {/* Sidebar - REORGANIZED: Chart above AI Summary */}
//         <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xl">
//           {/* Scrollable top section (Quality Score + Chart + AI Summary) */}
//           <div className="border-b border-slate-100 overflow-hidden flex-shrink-0" style={{ height: '30%' }}>
//             <div className="h-full overflow-y-auto p-3">
//               <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">Analysis Summary</h2>
              
//               {/* Quality Score */}
    
//               <div className="mb-4">
//                 <Stats issues={issues} score={analysis.totalScore} />
//               </div>
              
//               {/* Issue Breakdown Chart - Now above AI Summary */}
//             <div className="mb-4 bg-white rounded-lg p-3 border border-slate-200">
//                 <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
//                   <span>Issue Breakdown</span>
//                   <span className="text-xs font-normal text-slate-500">
//                     Total: {issues.length} issues
//                   </span>
//                 </h3>
                
//                 {/* Chart visualization */}
                
                
//                 {/* Issue counts */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-red-500"></span>
//                       <span className="text-slate-700">Critical</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Critical').length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-amber-500"></span>
//                       <span className="text-slate-700">Recommended</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Recommended').length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-blue-500"></span>
//                       <span className="text-slate-700">Cosmetic</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Cosmetic').length}
//                     </span>
//                   </div>
//                 </div>
//               </div>
              
//               {/* AI Summary - Now below the chart */}
//               <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
//                 <h3 className="text-xs font-bold text-indigo-900 mb-2">AI Overview</h3>
//                 <div className="overflow-y-auto max-h-32">
//                   <p className="text-sm text-indigo-800 leading-relaxed whitespace-normal break-words">
//                     {analysis.summary}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Detailed Issues - Taller section */}
//           <div className="flex-1 overflow-hidden flex flex-col" style={{ height: '60%' }}>
//             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
//               <h2 className="font-bold text-slate-700 flex items-center gap-2">
//                 Detailed Issues
//                 <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-1 rounded">
//                   {filteredIssues.length} found
//                 </span>
//               </h2>
//               <div className="flex items-center gap-2">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <select 
//                   className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-white"
//                   value={filter}
//                   onChange={(e) => setFilter(e.target.value as any)}
//                 >
//                   <option value="ALL">All Issues</option>
//                   <option value="CRITICAL">Critical Only</option>
//                   <option value="RECOMMENDED">Recommended</option>
//                 </select>
//               </div>
//             </div>

//             {/* Taller scrollable issues list */}
//             <div className="flex-1 overflow-y-auto p-3">
//               <div className="space-y-3">
//                 {filteredIssues.map(issue => (
//                   <IssueCard key={issue.id} issue={issue} onApplyFix={handleApplyFix} />
//                 ))}
//                 {filteredIssues.length === 0 && (
//                   <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
//                     <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                     <p className="text-sm font-medium">No issues found for this filter!</p>
//                     <p className="text-xs mt-1 text-slate-500">Try selecting a different filter option</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalysisView;
// import React, { useState, useEffect, useRef } from 'react';
// import { UploadedFile, DocumentAnalysis, Issue, isWordFile, isPDFFile } from '../types';
// import IssueCard from './IssueCard';
// import Stats from './Stats';
// import { ArrowLeft, CheckCircle, Download, FileText, Filter, Loader2, FileEdit, FileDown } from 'lucide-react';
// import { exportCorrectedDocument as runExportService } from '../services/exportService';

// interface AnalysisViewProps {
//   file: UploadedFile;
//   analysis: DocumentAnalysis;
//   onBack: () => void;
// }

// const AnalysisView: React.FC<AnalysisViewProps> = ({ file, analysis, onBack }) => {
//   const [issues, setIssues] = useState<Issue[]>(analysis.issues);
//   const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'RECOMMENDED'>('ALL');
//   const [isExporting, setIsExporting] = useState(false);
//   const [editedContent, setEditedContent] = useState<string>(file.textContent || '');
//   const [exportFormat, setExportFormat] = useState<'original' | 'pdf' | 'html'>('original');
//   const editableRef = useRef<HTMLDivElement>(null);

//   // Synchronize state if analysis changes
//   useEffect(() => {
//     setIssues(analysis.issues);
//   }, [analysis]);

//   // Initialize edited content
//   useEffect(() => {
//     if (file.textContent && !editedContent) {
//       setEditedContent(file.textContent);
//     }
//     if (analysis.processedContent?.textContent && !editedContent) {
//       setEditedContent(analysis.processedContent.textContent);
//     }
//   }, [file.textContent, analysis.processedContent, editedContent]);

//   const handleApplyFix = (id: string, suggestedFix?: string) => {
//     const updatedIssues = issues.map(issue => 
//       issue.id === id ? { ...issue, isFixed: true } : issue
//     );
//     setIssues(updatedIssues);

//     // Apply the fix to Word document content
//     if (isWordFile(file.mimeType)) {
//       const issue = issues.find(i => i.id === id);
//       if (issue && (issue.correctedText || suggestedFix)) {
//         const fixText = issue.correctedText || suggestedFix || '';
//         if (issue.originalText && fixText) {
//           const updated = editedContent.replace(issue.originalText, fixText);
//           setEditedContent(updated);
          
//           // Update the editable div
//           if (editableRef.current) {
//             editableRef.current.innerHTML = updated;
//           }
//         }
//       }
//     }
//   };

//   const handleApplyAll = () => {
//     const updatedIssues = issues.map(issue => ({ ...issue, isFixed: true }));
//     setIssues(updatedIssues);

//     // Apply all fixes to Word document content
//     if (isWordFile(file.mimeType)) {
//       let updated = editedContent;
//       issues.forEach(issue => {
//         if (issue.correctedText && issue.originalText) {
//           updated = updated.replace(issue.originalText, issue.correctedText);
//         }
//       });
//       setEditedContent(updated);
      
//       if (editableRef.current) {
//         editableRef.current.innerHTML = updated;
//       }
//     }
//   };

//   const handleExport = async (format?: 'original' | 'pdf' | 'html') => {
//     const fixedCount = issues.filter(i => i.isFixed).length;
//     const isWord = isWordFile(file.mimeType);
    
//     if (!isWord && fixedCount === 0) {
//       alert("Please fix (click 'Apply Fix') at least one issue before exporting PDFs.");
//       return;
//     }

//     setIsExporting(true);
//     try {
//       await runExportService(
//         file.base64, 
//         issues, 
//         file.file.name,
//         editedContent,
//         file.mimeType,
//         analysis.analysisId // Pass analysisId for backend export
//       );
//     } catch (error: any) {
//       console.error('Export failed:', error);
//       alert(`Export failed: ${error.message || 'Unknown error'}`);
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const handleContentEdit = () => {
//     if (editableRef.current && isWordFile(file.mimeType)) {
//       setEditedContent(editableRef.current.innerHTML);
//     }
//   };

//   const filteredIssues = issues.filter(i => {
//     if (filter === 'CRITICAL') return i.severity === 'Critical';
//     if (filter === 'RECOMMENDED') return i.severity === 'Recommended';
//     return true;
//   });

//   const fixedCount = issues.filter(i => i.isFixed).length;
//   const isWord = isWordFile(file.mimeType);
//   const isPDF = isPDFFile(file.mimeType);

//   return (
//     <div className="flex flex-col h-screen bg-slate-50 font-sans">
//       {/* Header */}
//       <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm">
//         <div className="flex items-center gap-4">
//           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
//             <ArrowLeft className="w-5 h-5 text-slate-600" />
//           </button>
//           <div>
//             <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//               {isWord ? <FileEdit className="w-5 h-5 text-blue-600" /> : 
//                isPDF ? <FileText className="w-5 h-5 text-red-600" /> : 
//                <FileText className="w-5 h-5 text-indigo-600" />} 
//               {file.file.name}
//             </h1>
//             <p className="text-xs text-slate-500 font-medium">
//               Document Score: <span className={analysis.totalScore > 70 ? "text-green-600" : "text-orange-600"}>{analysis.totalScore}/100</span>
//               {isWord && <span className="ml-3 text-blue-600 font-semibold">• Editable Word Document</span>}
//             </p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-slate-500 font-medium">{fixedCount}/{issues.length} Fixed</span>
          
//           {/* Word-specific export options */}
//           {isWord && (
//             <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
//               <span className="text-xs text-slate-500">Export as:</span>
//               <select 
//                 className="text-xs border border-slate-200 rounded px-2 py-1 outline-none bg-white"
//                 value={exportFormat}
//                 onChange={(e) => setExportFormat(e.target.value as any)}
//               >
//                 <option value="original">Original Format</option>
//                 <option value="html">HTML</option>
//                 <option value="pdf">PDF</option>
//               </select>
//             </div>
//           )}
          
//           <button 
//             onClick={handleApplyAll}
//             className="px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
//           >
//             {isWord ? "Apply All AI Fixes" : "Auto-Fix All"}
//           </button>
//           <button 
//             onClick={() => handleExport(exportFormat)}
//             disabled={isExporting}
//             className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 flex items-center gap-2 transition-all shadow-md"
//           >
//             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
//             {isWord ? "Export Document" : "Export Corrected"}
//           </button>
//         </div>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Document Viewer Area */}
//         <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center">
//           <div className="bg-white shadow-2xl relative w-full max-w-4xl" style={{ height: 'fit-content' }}>
            
//             {/* PINPOINT RED MARKS - These overlay the document */}
//             {issues.map((issue) => (
//               issue.position && !issue.isFixed && (
//                 <div
//                   key={`mark-${issue.id}`}
//                   className={`absolute border-2 z-10 animate-pulse ${
//                     issue.severity === 'Critical' ? 'border-red-500 bg-red-500/10' : 'border-amber-500 bg-amber-500/10'
//                   }`}
//                   style={{
//                     top: `${issue.position.top}%`,
//                     left: `${issue.position.left}%`,
//                     width: `${issue.position.width}%`,
//                     height: `${issue.position.height}%`,
//                     pointerEvents: 'none'
//                   }}
//                 />
//               )
//             ))}

//             {/* File type specific rendering */}
//             {file.mimeType.startsWith('image/') ? (
//               <img src={file.previewUrl} alt="Preview" className="w-full h-auto" />
//             ) : isPDF ? (
//               <object data={file.previewUrl} type="application/pdf" className="w-full min-h-[1100px]">
//                 <iframe src={file.previewUrl} className="w-full h-full" title="pdf-viewer" />
//               </object>
//             ) : isWord ? (
//               // Word Document Editor
//               <div className="p-8 min-h-[1100px]">
//                 <div className="mb-4 flex justify-between items-center border-b pb-2">
//                   <h3 className="text-lg font-bold text-slate-800">
//                     Word Document Editor
//                   </h3>
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
//                       Editable Mode
//                     </span>
//                     <button 
//                       onClick={() => window.open(file.previewUrl, '_blank')}
//                       className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
//                     >
//                       <FileDown className="w-3 h-3" /> View Original
//                     </button>
//                   </div>
//                 </div>
                
//                 {/* Editable text area for Word content */}
//                 <div 
//                   ref={editableRef}
//                   className="prose max-w-none text-slate-800 p-6 border rounded-lg bg-white min-h-[900px] outline-none focus:ring-2 focus:ring-blue-300 whitespace-pre-wrap"
//                   contentEditable={true}
//                   suppressContentEditableWarning={true}
//                   onInput={handleContentEdit}
//                   onBlur={handleContentEdit}
//                   dangerouslySetInnerHTML={{
//                     __html: editedContent || 
//                       '<p class="text-slate-400 italic">Loading document content...</p>'
//                   }}
//                 />
                
//                 {/* Word editing instructions */}
//                 <div className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
//                   <p className="font-medium">✏️ <strong>Word Document Editing:</strong></p>
//                   <ul className="list-disc pl-5 mt-1 space-y-1">
//                     <li>Click on any text above to edit directly</li>
//                     <li>Changes are saved automatically</li>
//                     <li>Use "Apply Fix" buttons for AI-suggested corrections</li>
//                     <li>Export will preserve all your edits and fixes</li>
//                   </ul>
//                 </div>
//               </div>
//             ) : (
//               // Text file viewer
//               <div className="p-8 min-h-[1100px]">
//                 <div className="mb-4 flex justify-between items-center border-b pb-2">
//                   <h3 className="text-lg font-bold text-slate-800">
//                     Text Document Viewer
//                   </h3>
//                   <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
//                     Read Only
//                   </span>
//                 </div>
//                 <pre className="text-slate-800 p-6 border rounded-lg bg-white min-h-[900px] whitespace-pre-wrap overflow-auto">
//                   {editedContent || file.textContent || 'Document content will appear here...'}
//                 </pre>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xl">
//           {/* Scrollable top section */}
//           <div className="border-b border-slate-100 overflow-hidden flex-shrink-0" style={{ height: '30%' }}>
//             <div className="h-full overflow-y-auto p-3">
//               <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">Analysis Summary</h2>
              
//               {/* Quality Score */}
//               <div className="mb-4">
//                 <Stats issues={issues} score={analysis.totalScore} />
//               </div>
              
//               {/* Issue Breakdown Chart */}
//               <div className="mb-4 bg-white rounded-lg p-3 border border-slate-200">
//                 <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
//                   <span>Issue Breakdown</span>
//                   <span className="text-xs font-normal text-slate-500">
//                     Total: {issues.length} issues
//                   </span>
//                 </h3>
                
//                 {/* Issue counts */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-red-500"></span>
//                       <span className="text-slate-700">Critical</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Critical').length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-amber-500"></span>
//                       <span className="text-slate-700">Recommended</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Recommended').length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="flex items-center gap-2">
//                       <span className="w-3 h-3 rounded-full bg-blue-500"></span>
//                       <span className="text-slate-700">Cosmetic</span>
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {issues.filter(i => i.severity === 'Cosmetic').length}
//                     </span>
//                   </div>
//                 </div>
//               </div>
              
//               {/* AI Summary */}
//               <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
//                 <h3 className="text-xs font-bold text-indigo-900 mb-2">AI Overview</h3>
//                 <div className="overflow-y-auto max-h-32">
//                   <p className="text-sm text-indigo-800 leading-relaxed whitespace-normal break-words">
//                     {analysis.summary}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Detailed Issues */}
//           <div className="flex-1 overflow-hidden flex flex-col" style={{ height: '60%' }}>
//             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
//               <h2 className="font-bold text-slate-700 flex items-center gap-2">
//                 Detailed Issues
//                 <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-1 rounded">
//                   {filteredIssues.length} found
//                 </span>
//               </h2>
//               <div className="flex items-center gap-2">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <select 
//                   className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-white"
//                   value={filter}
//                   onChange={(e) => setFilter(e.target.value as any)}
//                 >
//                   <option value="ALL">All Issues</option>
//                   <option value="CRITICAL">Critical Only</option>
//                   <option value="RECOMMENDED">Recommended</option>
//                 </select>
//               </div>
//             </div>

//             {/* Scrollable issues list */}
//             <div className="flex-1 overflow-y-auto p-3">
//               <div className="space-y-3">
//                 {filteredIssues.map(issue => (
//                   <IssueCard 
//                     key={issue.id} 
//                     issue={issue} 
//                     onApplyFix={handleApplyFix}
//                     isWordFile={isWord}
//                   />
//                 ))}
//                 {filteredIssues.length === 0 && (
//                   <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
//                     <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                     <p className="text-sm font-medium">No issues found for this filter!</p>
//                     <p className="text-xs mt-1 text-slate-500">Try selecting a different filter option</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalysisView;
import React, { useState, useEffect, useRef } from 'react';
import { UploadedFile, DocumentAnalysis, Issue, isWordFile, isPDFFile } from '../types';
import IssueCard from './IssueCard';
import Stats from './Stats';
import { 
  ArrowLeft, CheckCircle, Download, FileText, Filter, 
  Loader2, FileEdit, FileDown, Info, Ruler, AlignLeft, 
  Type, Space, Layout, AlertTriangle, Check, X, Eye
} from 'lucide-react';
import { exportCorrectedDocument as runExportService } from '../services/exportService';
import { analysisApi } from '../services/api';

interface AnalysisViewProps {
  file: UploadedFile;
  analysis: DocumentAnalysis;
  onBack: () => void;
}

// Define a local issue type that includes customFormatIssue
interface EnhancedIssue extends Issue {
  isFixed?: boolean;
  customFormatIssue?: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ file, analysis, onBack }) => {
  const [issues, setIssues] = useState<EnhancedIssue[]>(analysis.issues.map(issue => ({
    ...issue,
    isFixed: issue.isFixed || false,
    customFormatIssue: issue.customFormatIssue || false
  })));
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'TOPOLOGY' | 'SPACING' | 'TYPOGRAPHY' | 'GRAMMAR' | 'CUSTOM_FORMAT'>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [editedContent, setEditedContent] = useState<string>(file.textContent || '');
  const [exportFormat, setExportFormat] = useState<'original' | 'pdf' | 'html'>('original');
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [showTopologyMetrics, setShowTopologyMetrics] = useState(true);
  const editableRef = useRef<HTMLDivElement>(null);

  // Synchronize state if analysis changes
  useEffect(() => {
    setIssues(analysis.issues.map(issue => ({
      ...issue,
      isFixed: issue.isFixed || false,
      customFormatIssue: issue.customFormatIssue || false
    })));
  }, [analysis]);

  // Initialize edited content
  useEffect(() => {
    if (analysis.processedContent?.textContent && !editedContent) {
      setEditedContent(analysis.processedContent.textContent);
    } else if (file.textContent && !editedContent) {
      setEditedContent(file.textContent);
    }
  }, [file.textContent, analysis.processedContent, editedContent]);

  // Calculate metrics
  const topologyIssues = issues.filter(i => 
    i.type === 'Layout' || i.type === 'Margin' || i.type === 'Spacing' || 
    i.type === 'Alignment' || i.type === 'Indentation'
  );
  
  const spacingIssues = issues.filter(i => i.type === 'Spacing');
  const alignmentIssues = issues.filter(i => i.type === 'Alignment');
  const typographyIssues = issues.filter(i => i.type === 'Typography');
  const customFormatIssues = issues.filter(i => i.customFormatIssue);
  
  // Custom format analysis
  const isCustomFormat = analysis.formatType === 'custom' || analysis.analysisType?.includes('custom_format');
  const formatRequirements = analysis.formatRequirements || '';
  
  // Extract requirements for display
  const extractRequirements = (req: string) => {
    const requirements: Record<string, string> = {};
    if (!req) return requirements;
    
    const lines = req.split('\n');
    lines.forEach(line => {
      const match = line.match(/([^:]+):\s*(.+)/i);
      if (match) {
        requirements[match[1].trim()] = match[2].trim();
      }
    });
    return requirements;
  };
  
  const requirements = extractRequirements(formatRequirements);
  const hasFontRequirement = requirements['Font'] || requirements['font'];
  const hasSpacingRequirement = requirements['Spacing'] || requirements['spacing'];
  const hasMarginRequirement = requirements['Margins'] || requirements['margins'];
  
  // Check custom format compliance
  const hasFontMismatch = typographyIssues.some(issue => 
    issue.description?.includes('FONT MISMATCH') || 
    issue.description?.toLowerCase().includes('font mismatch')
  );
  
  const customFormatScore = analysis.totalScore || 0;
  const isFormatCompliant = customFormatScore >= 80;
  const isPartiallyCompliant = customFormatScore >= 60 && customFormatScore < 80;
  const isNonCompliant = customFormatScore < 60;

  const handleApplyFix = (id: string, suggestedFix?: string) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, isFixed: true } : issue
    );
    setIssues(updatedIssues);

    if (isWordFile(file.mimeType)) {
      const issue = issues.find(i => i.id === id);
      if (issue && (issue.correctedText || suggestedFix)) {
        const fixText = issue.correctedText || suggestedFix || '';
        if (issue.originalText && fixText) {
          const updated = editedContent.replace(issue.originalText, fixText);
          setEditedContent(updated);
          
          if (editableRef.current) {
            editableRef.current.innerHTML = updated;
          }
        }
      }
    }
  };

  const handleApplyAll = () => {
    const updatedIssues = issues.map(issue => ({ ...issue, isFixed: true }));
    setIssues(updatedIssues);

    if (isWordFile(file.mimeType)) {
      let updated = editedContent;
      issues.forEach(issue => {
        if (issue.correctedText && issue.originalText) {
          updated = updated.replace(issue.originalText, issue.correctedText);
        }
      });
      setEditedContent(updated);
      
      if (editableRef.current) {
        editableRef.current.innerHTML = updated;
      }
    }
  };

  const handleExport = async (format?: 'original' | 'pdf' | 'html') => {
    const fixedCount = issues.filter(i => i.isFixed).length;
    const isWord = isWordFile(file.mimeType);
    const isPDF = isPDFFile(file.mimeType);
    
    if (!isWord && fixedCount === 0) {
      alert("Please fix (click 'Apply Fix') at least one issue before exporting PDFs.");
      return;
    }

    setIsExporting(true);
    try {
      if (analysis.analysisId) {
        const fixedIssueIds = issues.filter(i => i.isFixed).map(i => i.id);
        
        if (fixedIssueIds.length === 0) {
          alert("Please fix at least one issue before exporting.");
          setIsExporting(false);
          return;
        }

        await analysisApi.exportCorrected(analysis.analysisId, fixedIssueIds);
      } else {
        await runExportService(
          file.base64, 
          issues, 
          file.file.name,
          editedContent,
          file.mimeType,
          analysis.analysisId
        );
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleContentEdit = () => {
    if (editableRef.current && isWordFile(file.mimeType)) {
      setEditedContent(editableRef.current.innerHTML);
    }
  };

  // Enhanced filtering
  const filteredIssues = issues.filter(i => {
    if (filter === 'CRITICAL') return i.severity === 'Critical';
    if (filter === 'TOPOLOGY') return ['Layout', 'Margin', 'Spacing', 'Alignment', 'Indentation'].includes(i.type);
    if (filter === 'SPACING') return i.type === 'Spacing';
    if (filter === 'TYPOGRAPHY') return i.type === 'Typography';
    if (filter === 'GRAMMAR') return ['Grammar', 'Spelling'].includes(i.type);
    if (filter === 'CUSTOM_FORMAT') return i.customFormatIssue || (
      (i.type === 'Typography' && hasFontRequirement) ||
      (i.type === 'Margin' && hasMarginRequirement) ||
      (i.type === 'Spacing' && hasSpacingRequirement)
    );
    return true;
  });

  const fixedCount = issues.filter(i => i.isFixed).length;
  const isWord = isWordFile(file.mimeType);
  const isPDF = isPDFFile(file.mimeType);

  // Gemini model info
  const geminiModel = analysis.geminiModel || 'gemini-2.5-flash';
  const analysisType = analysis.analysisType || 'standard';

  // Also update the IssueCard component props if needed
  // You might need to update IssueCard to accept isCustomFormatIssue prop

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {isWord ? <FileEdit className="w-5 h-5 text-blue-600" /> : 
               isPDF ? <FileText className="w-5 h-5 text-red-600" /> : 
               <FileText className="w-5 h-5 text-indigo-600" />} 
              {file.file.name}
              
              {/* Gemini model badge */}
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {geminiModel}
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500 font-medium">
                Document Score: <span className={analysis.totalScore > 70 ? "text-green-600" : "text-orange-600"}>{analysis.totalScore || 0}/100</span>
              </p>
              {isWord && (
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Editable Word Document
                </span>
              )}
              {isCustomFormat && (
                <button
                  onClick={() => setShowFormatInfo(!showFormatInfo)}
                  className="text-xs font-semibold px-2 py-0.5 rounded hover:opacity-90 flex items-center gap-1 transition-all"
                  style={{
                    backgroundColor: isFormatCompliant ? '#10b98120' : 
                                    isPartiallyCompliant ? '#f59e0b20' : '#ef444420',
                    color: isFormatCompliant ? '#059669' : 
                          isPartiallyCompliant ? '#d97706' : '#dc2626',
                    border: `1px solid ${isFormatCompliant ? '#10b98140' : 
                              isPartiallyCompliant ? '#f59e0b40' : '#ef444440'}`
                  }}
                >
                  {isFormatCompliant ? <Check className="w-3 h-3" /> : 
                   isPartiallyCompliant ? <AlertTriangle className="w-3 h-3" /> : 
                   <X className="w-3 h-3" />}
                  Custom Format {isFormatCompliant ? '✓' : isPartiallyCompliant ? '⚠' : '✗'}
                </button>
              )}
              
              {/* Topology analysis badge */}
              {analysisType.includes('topology') && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <Layout className="w-3 h-3" />
                  Topology Analysis
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">{fixedCount}/{issues.length} Fixed</span>
          
          {/* Word-specific export options */}
          {isWord && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <span className="text-xs text-slate-500">Export as:</span>
              <select 
                className="text-xs border border-slate-200 rounded px-2 py-1 outline-none bg-white"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
              >
                <option value="original">Original Format</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          )}
          
          <button 
            onClick={handleApplyAll}
            className="px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
          >
            {isWord ? "Apply All AI Fixes" : "Auto-Fix All"}
          </button>
          <button 
            onClick={() => handleExport(exportFormat)}
            disabled={isExporting || (!isWord && fixedCount === 0)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isWord ? "Export Document" : "Export Corrected"}
          </button>
        </div>
      </header>

      {/* Enhanced Custom Format Info Banner */}
      {showFormatInfo && isCustomFormat && (
        <div className="px-6 py-3 border-b" style={{
          backgroundColor: isFormatCompliant ? '#f0fdf4' : 
                          isPartiallyCompliant ? '#fffbeb' : '#fef2f2',
          borderColor: isFormatCompliant ? '#bbf7d0' : 
                      isPartiallyCompliant ? '#fde68a' : '#fecaca'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isFormatCompliant ? 'bg-green-100 text-green-600' :
                  isPartiallyCompliant ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {isFormatCompliant ? <Check className="w-4 h-4" /> : 
                   isPartiallyCompliant ? <AlertTriangle className="w-4 h-4" /> : 
                   <X className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold" style={{
                    color: isFormatCompliant ? '#059669' : 
                          isPartiallyCompliant ? '#d97706' : '#dc2626'
                  }}>
                    Custom Format Analysis - {isFormatCompliant ? 'Compliant ✓' : 
                    isPartiallyCompliant ? 'Partial Compliance ⚠' : 'Non-Compliant ✗'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {analysis.summary?.includes('CUSTOM FORMAT AUDIT') ? 
                      analysis.summary : 
                      `Score: ${customFormatScore}/100 - ${customFormatIssues.length} format issues found`}
                  </p>
                </div>
              </div>
              
              {/* Requirements Summary */}
              {Object.keys(requirements).length > 0 && (
                <div className="hidden md:flex items-center gap-4">
                  {requirements['Font'] && (
                    <div className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      <span>Font: {requirements['Font']}</span>
                      {hasFontMismatch && <X className="w-3 h-3 text-red-500" />}
                    </div>
                  )}
                  {requirements['Spacing'] && (
                    <div className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1">
                      <Space className="w-3 h-3" />
                      <span>Spacing: {requirements['Spacing']}</span>
                    </div>
                  )}
                  {requirements['Margins'] && (
                    <div className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      <span>Margins: {requirements['Margins']}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFormatInfo(false)}
                className="text-sm hover:opacity-80"
                style={{
                  color: isFormatCompliant ? '#059669' : 
                        isPartiallyCompliant ? '#d97706' : '#dc2626'
                }}
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topology Metrics Banner */}
      {showTopologyMetrics && (topologyIssues.length > 0 || analysis.structureAnalysis) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-800">
                  {isCustomFormat ? 'Format & Layout Analysis' : 'Topology & Layout Analysis'}
                </h3>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Issue Counts */}
                {isCustomFormat && customFormatIssues.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs font-medium text-red-700">
                      {customFormatIssues.length} Format Issues
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Ruler className="w-3 h-3 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">
                    {topologyIssues.length} Layout Issues
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Space className="w-3 h-3 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">
                    {spacingIssues.length} Spacing Issues
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-3 h-3 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">
                    {alignmentIssues.length} Alignment Issues
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Structure Metrics */}
              {analysis.structureAnalysis && (
                <div className="text-xs bg-white border border-blue-200 rounded px-2 py-1">
                  <span className="text-blue-700 font-medium">Format Score: </span>
                  <span className={analysis.structureAnalysis.overallCustomFormatScore >= 80 ? "text-green-600" : "text-orange-600"}>
                    {analysis.structureAnalysis.overallCustomFormatScore || analysis.totalScore || 0}%
                  </span>
                </div>
              )}
              
              <button 
                onClick={() => setShowTopologyMetrics(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Hide
              </button>
            </div>
          </div>
          
          {/* Custom Format Compliance Bars */}
          {isCustomFormat && analysis.structureAnalysis && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {analysis.structureAnalysis.fontCompliance !== undefined && (
                <div>
                  <div className="text-xs text-slate-600 mb-1">Font</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${analysis.structureAnalysis.fontCompliance || 0}%`,
                        backgroundColor: (analysis.structureAnalysis.fontCompliance || 0) >= 80 ? '#10b981' : 
                                       (analysis.structureAnalysis.fontCompliance || 0) >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              )}
              {analysis.structureAnalysis.marginCompliance !== undefined && (analysis.structureAnalysis.marginCompliance || 0) > 0 && (
                <div>
                  <div className="text-xs text-slate-600 mb-1">Margins</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${analysis.structureAnalysis.marginCompliance || 0}%`,
                        backgroundColor: (analysis.structureAnalysis.marginCompliance || 0) >= 80 ? '#10b981' : 
                                       (analysis.structureAnalysis.marginCompliance || 0) >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              )}
              {analysis.structureAnalysis.spacingCompliance !== undefined && (analysis.structureAnalysis.spacingCompliance || 0) > 0 && (
                <div>
                  <div className="text-xs text-slate-600 mb-1">Spacing</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${analysis.structureAnalysis.spacingCompliance || 0}%`,
                        backgroundColor: (analysis.structureAnalysis.spacingCompliance || 0) >= 80 ? '#10b981' : 
                                       (analysis.structureAnalysis.spacingCompliance || 0) >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Document Viewer Area */}
        <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center">
          <div className="bg-white shadow-2xl relative w-full max-w-4xl" style={{ height: 'fit-content' }}>
            
            {/* PINPOINT MARKS - Enhanced with custom format colors */}
            {issues.map((issue) => (
              issue.position && !issue.isFixed && (
                <div
                  key={`mark-${issue.id}`}
                  className={`absolute border-2 z-10 animate-pulse ${
                    issue.customFormatIssue ? 'border-purple-500 bg-purple-500/10 border-dashed' :
                    issue.severity === 'Critical' ? 'border-red-500 bg-red-500/10' : 
                    issue.severity === 'Major' ? 'border-amber-500 bg-amber-500/10' : 
                    issue.severity === 'Minor' ? 'border-blue-500 bg-blue-500/10' : 
                    'border-slate-500 bg-slate-500/10'
                  } ${issue.type === 'Margin' || issue.type === 'Spacing' || issue.type === 'Alignment' ? 'border-dashed' : 'border-solid'}`}
                  style={{
                    top: `${issue.position.top}%`,
                    left: `${issue.position.left}%`,
                    width: `${issue.position.width}%`,
                    height: `${issue.position.height}%`,
                    pointerEvents: 'none'
                  }}
                  title={`${issue.type}: ${issue.description}`}
                >
                  {/* Issue type indicator */}
                  {issue.customFormatIssue && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs font-bold text-white">!</span>
                    </div>
                  )}
                  {issue.type === 'Margin' && !issue.customFormatIssue && (
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Ruler className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {issue.type === 'Spacing' && !issue.customFormatIssue && (
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <Space className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {issue.type === 'Alignment' && !issue.customFormatIssue && (
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <AlignLeft className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {issue.type === 'Typography' && issue.customFormatIssue && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <Type className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              )
            ))}

            {/* File type specific rendering */}
            {file.mimeType.startsWith('image/') ? (
              <img src={file.previewUrl} alt="Preview" className="w-full h-auto" />
            ) : isPDF ? (
              <object data={file.previewUrl} type="application/pdf" className="w-full min-h-[1100px]">
                <iframe src={file.previewUrl} className="w-full h-full" title="pdf-viewer" />
              </object>
            ) : isWord ? (
              <div className="p-8 min-h-[1100px]">
                <div className="mb-4 flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Word Document Editor
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Editable Mode
                    </span>
                    <button 
                      onClick={() => window.open(file.previewUrl, '_blank')}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" /> View Original
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={editableRef}
                  className="prose max-w-none text-slate-800 p-6 border rounded-lg bg-white min-h-[900px] outline-none focus:ring-2 focus:ring-blue-300 whitespace-pre-wrap"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handleContentEdit}
                  onBlur={handleContentEdit}
                  dangerouslySetInnerHTML={{
                    __html: editedContent || 
                      '<p class="text-slate-400 italic">Loading document content...</p>'
                  }}
                />
                
                <div className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <p className="font-medium">✏️ <strong>Word Document Editing:</strong></p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Click on any text above to edit directly</li>
                    <li>Changes are saved automatically</li>
                    <li>Use "Apply Fix" buttons for AI-suggested corrections</li>
                    <li>Export will preserve all your edits and fixes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 min-h-[1100px]">
                <div className="mb-4 flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Text Document Viewer
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                    Read Only
                  </span>
                </div>
                <pre className="text-slate-800 p-6 border rounded-lg bg-white min-h-[900px] whitespace-pre-wrap overflow-auto">
                  {editedContent || file.textContent || 'Document content will appear here...'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xl">
          {/* Scrollable top section */}
          <div className="border-b border-slate-100 overflow-hidden flex-shrink-0" style={{ height: '35%' }}>
            <div className="h-full overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">
                  {isCustomFormat ? 'Custom Format Analysis' : 'Analysis Summary'}
                </h2>
                <div className="flex items-center gap-2">
                  {isCustomFormat && (
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{
                      backgroundColor: isFormatCompliant ? '#10b98120' : 
                                      isPartiallyCompliant ? '#f59e0b20' : '#ef444420',
                      color: isFormatCompliant ? '#059669' : 
                            isPartiallyCompliant ? '#d97706' : '#dc2626'
                    }}>
                      {isFormatCompliant ? 'Compliant' : 
                       isPartiallyCompliant ? 'Partial' : 'Non-Compliant'}
                    </span>
                  )}
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {geminiModel}
                  </span>
                </div>
              </div>
              
              {/* Quality Score */}
              <div className="mb-4">
                {/* Update your Stats component to accept isCustomFormat prop if needed */}
                <Stats issues={issues} score={analysis.totalScore || 0} isCustomFormat={isCustomFormat} />
              </div>
              
              {/* Enhanced Issue Breakdown */}
              <div className="mb-4 bg-white rounded-lg p-3 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layout className="w-3 h-3" />
                    {isCustomFormat ? 'Format Compliance' : 'Issue Breakdown'}
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    Total: {issues.length} issues
                  </span>
                </h3>
                
                <div className="space-y-2">
                  {/* Custom Format Issues */}
                  {isCustomFormat && customFormatIssues.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-slate-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Custom Format Issues
                        </span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {customFormatIssues.length}
                      </span>
                    </div>
                  )}
                  
                  {/* Topology Issues */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-slate-700 flex items-center gap-1">
                        <Layout className="w-3 h-3" />
                        Topology/Layout
                      </span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {topologyIssues.length}
                    </span>
                  </div>
                  
                  {/* Spacing Issues */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-slate-700 flex items-center gap-1">
                        <Space className="w-3 h-3" />
                        Spacing
                      </span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {spacingIssues.length}
                    </span>
                  </div>
                  
                  {/* Typography Issues */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span className="text-slate-700 flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        Typography
                      </span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {typographyIssues.length}
                    </span>
                  </div>
                </div>
                
                {/* Custom Format Requirements */}
                {isCustomFormat && Object.keys(requirements).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-600 mb-2">Format Requirements</h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(requirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-500">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced AI Summary */}
              <div className={`rounded-lg p-3 border ${
                isCustomFormat ? 'bg-purple-50 border-purple-100' :
                analysisType.includes('topology') ? 'bg-amber-50 border-amber-100' : 
                'bg-indigo-50 border-indigo-100'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCustomFormat ? (
                    <Eye className="w-3 h-3 text-purple-700" />
                  ) : analysisType.includes('topology') ? (
                    <Layout className="w-3 h-3 text-amber-700" />
                  ) : (
                    <FileText className="w-3 h-3 text-indigo-700" />
                  )}
                  <h3 className={`text-xs font-bold ${
                    isCustomFormat ? 'text-purple-900' :
                    analysisType.includes('topology') ? 'text-amber-900' : 'text-indigo-900'
                  }`}>
                    {isCustomFormat ? 'Custom Format Audit' : 
                     analysisType.includes('topology') ? 'Topology Analysis' : 'AI Overview'}
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-32">
                  <p className={`text-sm leading-relaxed whitespace-normal break-words ${
                    isCustomFormat ? 'text-purple-800' :
                    analysisType.includes('topology') ? 'text-amber-800' : 'text-indigo-800'
                  }`}>
                    {analysis.summary || 'No summary available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Issues */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ height: '65%' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                Detailed Issues
                <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {filteredIssues.length} found
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <select 
                  className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                >
                  <option value="ALL">All Issues</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="TOPOLOGY">Topology/Layout</option>
                  <option value="SPACING">Spacing</option>
                  <option value="TYPOGRAPHY">Typography</option>
                  <option value="GRAMMAR">Grammar/Spelling</option>
                  {isCustomFormat && <option value="CUSTOM_FORMAT">Custom Format Issues</option>}
                </select>
              </div>
            </div>

            {/* Scrollable issues list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                {filteredIssues.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onApplyFix={handleApplyFix}
                    isWordFile={isWord}
                    isCustomFormat={isCustomFormat}
                    isTopologyIssue={['Layout', 'Margin', 'Spacing', 'Alignment', 'Indentation'].includes(issue.type)}
                    // Pass customFormatIssue if your IssueCard component needs it
                    customFormatIssue={issue.customFormatIssue}
                  />
                ))}
                {filteredIssues.length === 0 && (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No issues found for this filter!</p>
                    <p className="text-xs mt-1 text-slate-500">Try selecting a different filter option</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;