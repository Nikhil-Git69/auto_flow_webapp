import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, CheckCircle, FileText, Layout, Layers, Hash } from 'lucide-react';
import { analysisApi } from '../services/api';
import { DocumentAnalysis } from '../types';

const ConceptAnalysisView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAnalysis(id);
        }
    }, [id]);

    const fetchAnalysis = async (analysisId: string) => {
        try {
            // NOTE: Ideally backend should support GET /analysis/:id
            // If not, we fetch all for user and find it.
            const userStr = localStorage.getItem('autoflow_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const response = await analysisApi.getAll({ userId: user.id || user._id });
                // Handle response format variations
                const allData = response.data || (Array.isArray(response) ? response : []);

                if (Array.isArray(allData)) {
                    const found = allData.find((a: any) => a.analysisId === analysisId || a._id === analysisId);
                    if (found) {
                        setAnalysis({
                            analysisId: found.analysisId || found._id,
                            fileName: found.fileName,
                            fileType: found.fileType,
                            uploadDate: found.analyzedAt || found.uploadDate,
                            totalScore: found.score,
                            issues: [],
                            summary: found.summary, // Total WBS
                            processedContent: found.processedContent, // Detailed WBS HTML
                            correctedContent: "",
                            correctedPdfBase64: null,
                            fileData: null
                        });
                    }
                }
            }
        } catch (err) {
            console.error(err);
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
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-[#159e8a] hover:underline">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Box className="text-[#159e8a]" size={24} />
                                Concept Breakdown
                            </h1>
                            <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                Concept Analysis
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

                    {/* Left Column: Total WBS / Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-0">
                            <div className="flex items-center gap-2 mb-4 text-[#159e8a]">
                                <Layout size={20} />
                                <h2 className="font-bold text-lg">Total WBS</h2>
                            </div>
                            <div className="prose prose-sm prose-slate text-slate-600">
                                <p className="leading-relaxed">{analysis.summary}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Analysis Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Document Type</span>
                                        <span className="font-medium text-slate-800">Concept / Proposal</span>
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
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Breakdown */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 min-h-[500px]">
                            <div className="flex items-center gap-2 mb-6 text-slate-800 border-b border-slate-100 pb-4">
                                <Layers size={22} className="text-[#159e8a]" />
                                <h2 className="font-bold text-xl">Detailed Work Breakdown Structure</h2>
                            </div>

                            <div className="prose prose-slate max-w-none hover:prose-a:text-[#159e8a]">
                                {/* Render HTML Content */}
                                <div dangerouslySetInnerHTML={{ __html: analysis.processedContent || "<p>No detailed breakdown available.</p>" }} />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ConceptAnalysisView;
