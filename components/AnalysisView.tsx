import React, { useState } from 'react';
import { UploadedFile, DocumentAnalysis, Issue } from '../types';
import IssueCard from './IssueCard';
import Stats from './Stats';
import { ArrowLeft, CheckCircle, Download, FileText, Filter } from 'lucide-react';

interface AnalysisViewProps {
  file: UploadedFile;
  analysis: DocumentAnalysis;
  onBack: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ file, analysis, onBack }) => {
  const [issues, setIssues] = useState<Issue[]>(analysis.issues);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'RECOMMENDED'>('ALL');
  const [isExporting, setIsExporting] = useState(false);
   const [saveToDatabase, setSaveToDatabase] = useState(true); // Default to saving

  const handleApplyFix = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, isFixed: true } : issue
    ));
    // In a real app, this would trigger a file regeneration or edit
  };

  const handleApplyAll = () => {
      setIssues(prev => prev.map(issue => ({...issue, isFixed: true})));
  };

  const filteredIssues = issues.filter(i => {
    if (filter === 'CRITICAL') return i.severity === 'Critical';
    if (filter === 'RECOMMENDED') return i.severity === 'Recommended';
    return true;
  });

  const fixedCount = issues.filter(i => i.isFixed).length;
  const totalCount = issues.length;

   const generateCorrection = (issue: Issue): string => {
    switch (issue.type) {
      case 'Grammar':
        return `${issue.originalText} [Grammar corrected]`;
      case 'Layout':
        return `${issue.originalText} [Layout optimized]`;
      case 'Accessibility':
        return `${issue.originalText} [Accessibility enhanced]`;
      default:
        return `${issue.originalText} [Improved]`;
    }
  };

   // Export corrected document
  const exportCorrectedDocument = async () => {
    setIsExporting(true);
    
    try {
      // Get fixed issues count
      const fixedIssuesCount = issues.filter(issue => issue.isFixed).length;
      
      if (fixedIssuesCount === 0) {
        alert('No issues have been fixed. Please fix at least one issue before exporting.');
        setIsExporting(false);
        return;
      }

      // Create corrected document
      const correctedDoc = await generateCorrectedDocument(file, issues);
      
      // Download the file
      downloadFile(correctedDoc);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export corrected document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCorrectedDocument = async (
    originalFile: UploadedFile, 
    issuesList: Issue[]
  ): Promise<{ content: string; fileName: string; mimeType: string }> => {
    
    const fixedIssues = issuesList.filter(issue => issue.isFixed);
    
    // For now, we'll create a simple corrected version
    // In a real app, you would:
    // 1. Parse the original document
    // 2. Apply corrections
    // 3. Regenerate the document
    
    let correctedContent = originalFile.base64;
    let correctedFileName = `Corrected_${originalFile.file.name}`;
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add a watermark or metadata indicating fixes
    // For PDFs/DOCs, you would use a library like pdf-lib or mammoth
    
    return {
      content: correctedContent,
      fileName: correctedFileName,
      mimeType: originalFile.mimeType
    };
  };

  // Download file
  const downloadFile = (doc: { content: string; fileName: string; mimeType: string }) => {
    // Convert base64 to blob
    const byteCharacters = atob(doc.content);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: doc.mimeType });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    {file.file.name}
                </h1>
                <p className="text-xs text-slate-500">Processed just now • {analysis.issues.length} Issues Found</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 mr-4 font-medium">
                {fixedCount}/{totalCount} Fixes Applied
            </div>
            <button 
                onClick={handleApplyAll}
                className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
                Auto-Fix All
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                <Download className="w-4 h-4" /> Export Corrected
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Document Viewer */}
        <div className="flex-1 bg-slate-200 p-6 overflow-auto flex justify-center items-start">
            <div className="bg-white shadow-xl min-h-[800px] w-full max-w-3xl relative">
                {/* Simulated Document Overlay for Highlighting (Optional enhancement) */}
                {file.mimeType.startsWith('image/') ? (
                    <img src={file.previewUrl} alt="Document Preview" className="w-full h-auto" />
                ) : (
                    <object data={file.previewUrl} type="application/pdf" className="w-full h-[800px]">
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                             <p>PDF Viewer not supported in this frame.</p>
                             <a href={file.previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Open PDF</a>
                        </div>
                    </object>
                )}
            </div>
        </div>

        {/* Right Panel: Issues & Analysis */}
        <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-0">
            
            <div className="p-5 border-b border-slate-100 overflow-y-auto max-h-[40%]">
                <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">Analysis Report</h2>
                <Stats issues={issues} score={analysis.score} />
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <h3 className="text-indigo-900 font-medium text-sm mb-1">AI Summary</h3>
                    <p className="text-xs text-indigo-800 leading-relaxed">{analysis.summary}</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                <div className="px-5 py-3 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Issues List
                    </h2>
                    <div className="flex bg-slate-100 rounded-md p-0.5">
                        <button 
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${filter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('CRITICAL')}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${filter === 'CRITICAL' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Critical
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-4 flex-1 space-y-1">
                    {filteredIssues.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle className="w-12 h-12 mb-3 text-green-500 opacity-20" />
                            <p>No issues found in this category.</p>
                        </div>
                    ) : (
                        filteredIssues.map(issue => (
                            <IssueCard key={issue.id} issue={issue} onApplyFix={handleApplyFix} />
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;