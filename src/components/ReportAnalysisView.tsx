import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Layout, Layers, Hash } from 'lucide-react';
import { analysisApi } from '../services/api';
import { DocumentAnalysis } from '../types';

const ReportAnalysisView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const backPath = (location.state as any)?.from || '/dashboard';
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAnalysis(id);
        }
    }, [id]);

    const fetchAnalysis = async (analysisId: string) => {
        try {
            setLoading(true);
            const response = await analysisApi.getById(analysisId);

            if (response.success && response.data) {
                const found = response.data;
                setAnalysis({
                    analysisId: found.analysisId || found._id,
                    fileName: found.fileName,
                    fileType: found.fileType,
                    uploadDate: found.analyzedAt || found.uploadDate,
                    totalScore: found.score,
                    issues: [],
                    summary: found.summary, // Overview
                    processedContent: found.processedContent, // Detailed Summary HTML
                    correctedContent: "",
                    correctedPdfBase64: null,
                    fileData: null,
                    images: found.images || [] // Load images
                });
            } else {
                setAnalysis(null);
            }
        } catch (err) {
            console.error('Error fetching analysis:', err);
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#159e8a]"></div>
        </div>
    );

    if (!analysis) return (
        <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-slate-700">Analysis not found</h2>
            <button onClick={() => navigate(backPath)} className="mt-4 text-[#159e8a] hover:underline">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(backPath)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="text-[#159e8a]" size={24} />
                                Report Overview & Summary
                            </h1>
                            <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                Report Analysis
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Analyzed: {new Date(analysis.uploadDate).toLocaleDateString()} • {analysis.fileName}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Overview Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-0">
                            <div className="flex items-center gap-2 mb-4 text-[#159e8a]">
                                <Layout size={20} />
                                <h2 className="font-bold text-lg">Project Overview</h2>
                            </div>
                            <div className="prose prose-sm prose-slate text-slate-600">
                                <p className="leading-relaxed">{analysis.summary}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Analysis Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Document Type</span>
                                        <span className="font-medium text-slate-800">Project Report</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><CheckCircle size={14} /> Status</span>
                                        <span className="font-medium text-teal-600">Complete</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><Hash size={14} /> ID reference</span>
                                        <span className="font-mono text-xs text-slate-400">#{analysis.analysisId.slice(-6)}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const btn = document.getElementById('download-btn-report');
                                                if (btn) btn.innerHTML = '<span class="animate-pulse">Downloading...</span>';

                                                await analysisApi.downloadOriginal(analysis.analysisId, analysis.fileName);

                                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Download Original Document';
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to download document.");
                                                const btn = document.getElementById('download-btn-report');
                                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Download Original Document';
                                            }
                                        }}
                                        id="download-btn-report"
                                        className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-[#159e8a] hover:text-[#159e8a] hover:bg-teal-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" x2="12" y1="15" y2="3" />
                                        </svg>
                                        Download Original Document
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const isPdf = analysis.fileName?.toLowerCase().endsWith('.pdf') || analysis.fileType === 'application/pdf';
                                            setShowPreview(true);

                                            if (!isPdf) {
                                                return; // Skip fetching for non-PDFs to prevent auto-download
                                            }

                                            try {
                                                setPreviewLoading(true);
                                                const url = await analysisApi.getDocumentPreviewUrl(analysis.analysisId);
                                                setPreviewUrl(url);
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to load document preview.");
                                                setShowPreview(false);
                                            } finally {
                                                setPreviewLoading(false);
                                            }
                                        }}
                                        className="w-full mt-3 py-3 px-4 bg-[#159e8a] text-white font-bold rounded-xl hover:bg-teal-600 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        Preview Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 min-h-[500px]">
                            <div className="flex items-center gap-3 mb-8 text-slate-800">
                                <FileText size={24} className="text-slate-700" />
                                <h2 className="font-bold text-2xl">Detailed Analytical Summary of the Report</h2>
                            </div>

                            <div className="prose prose-slate max-w-none hover:prose-a:text-[#159e8a]
                                [&_.report-metadata]:mb-8 [&_.report-metadata_p]:!my-2 [&_.report-metadata_p]:flex [&_.report-metadata_p]:items-start [&_.report-metadata_p]:gap-2 [&_.report-metadata_p]:text-sm
                                [&_.report-metadata_strong]:w-24 [&_.report-metadata_strong]:shrink-0 [&_.report-metadata_strong]:text-slate-800 
                                [&_.badge]:bg-slate-100 [&_.badge]:border [&_.badge]:border-slate-200 [&_.badge]:text-slate-600 [&_.badge]:px-2 [&_.badge]:py-0.5 [&_.badge]:rounded [&_.badge]:text-[11px] [&_.badge]:uppercase [&_.badge]:tracking-wider [&_.badge]:font-bold [&_.badge]:inline-block [&_.badge]:leading-none [&_.badge]:mt-0.5
                                [&_hr]:border-slate-200 [&_hr]:my-8
                                [&_.diagram-note]:bg-slate-50 [&_.diagram-note]:p-3 [&_.diagram-note]:rounded-lg [&_.diagram-note]:border [&_.diagram-note]:border-slate-200 [&_.diagram-note]:text-sm [&_.diagram-note]:my-4
                            ">
                                {/* Render HTML Content */}
                                <div dangerouslySetInnerHTML={{ __html: analysis.processedContent || "<p>No detailed summary available.</p>" }} />
                            </div>
                        </div>
                    </div>

                    {/* Extracted Figures Section removed */}
                </div>
            </main>

            {/* Document Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-full flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <FileText className="text-[#159e8a]" size={20} />
                                <h3 className="font-bold text-slate-800">Document Preview: {analysis.fileName}</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
                                    setPreviewUrl(null);
                                }}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 relative">
                            {previewLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#159e8a] mb-4"></div>
                                    <p className="text-slate-500 font-medium">Loading document preview...</p>
                                </div>
                            )}
                            {!previewLoading && (analysis.fileName?.toLowerCase().endsWith('.pdf') || analysis.fileType === 'application/pdf') && previewUrl && (
                                <iframe
                                    src={`${previewUrl}#toolbar=0`}
                                    className="w-full h-full border-none"
                                    title="Document Preview"
                                />
                            )}
                            {!previewLoading && !(analysis.fileName?.toLowerCase().endsWith('.pdf') || analysis.fileType === 'application/pdf') && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 p-8 text-center">
                                    <FileText className="w-16 h-16 text-slate-400 mb-4" />
                                    <h4 className="text-lg font-bold text-slate-700 mb-2">Preview Not Available</h4>
                                    <p className="text-slate-500 mb-6 max-w-md">Live preview is currently only available for PDF documents. Please download the original file to view its contents.</p>
                                    <button
                                        onClick={() => {
                                            setShowPreview(false);
                                            document.getElementById('download-btn-report')?.click();
                                        }}
                                        className="py-2 px-6 bg-[#159e8a] text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                                    >
                                        Download Document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportAnalysisView;
