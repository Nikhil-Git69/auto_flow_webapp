import React from 'react';
import { X, AlertTriangle, CheckCircle, FileText, Info, Layers } from 'lucide-react';
import { DocumentAnalysis } from '../types';

interface AnalysisSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: DocumentAnalysis | null;
}

const AnalysisSummaryModal: React.FC<AnalysisSummaryModalProps> = ({
    isOpen,
    onClose,
    analysis
}) => {
    const [showAllIssues, setShowAllIssues] = React.useState(false);

    React.useEffect(() => {
        setShowAllIssues(false);
    }, [analysis]);

    if (!isOpen || !analysis) return null;

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-500 bg-green-50 border-green-100';
        if (score >= 70) return 'text-[#159e8a] bg-teal-50 border-teal-100';
        if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-red-500 bg-red-50 border-red-100';
    };

    const issues = analysis.issues || [];
    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const majorCount = issues.filter(i => i.severity === 'Major').length;
    const minorCount = issues.filter(i => i.severity === 'Minor').length;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                {/* HEADER */}
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-white relative">
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl font-black border-4 ${getScoreColor(analysis.totalScore || 0)}`}>
                            {analysis.totalScore || 0}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">{analysis.fileName}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                                {new Date(analysis.uploadDate).toLocaleDateString()} • {analysis.fileType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                    {/* SUMMARY SECTION */}
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-[#159e8a]" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Analysis Summary</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            {analysis.summary || "No summary available for this analysis."}
                        </p>
                    </div>


                    {/* CONDITIONAL CONTENT: WBS / CUSTOM FORMAT / AI ISSUES */}
                    {analysis.formatType === 'concept' ? (
                        /* WBS VIEW */
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Layers size={20} className="text-[#159e8a]" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Work Breakdown Structure</h3>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 prose prose-sm prose-slate max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: analysis.processedContent || "<p>No detailed breakdown available.</p>" }} />
                            </div>
                        </div>
                    ) : analysis.formatType === 'custom' ? (
                        /* CUSTOM FORMAT COMPLIANCE VIEW */
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Info size={20} className="text-purple-600" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Custom Format Compliance</h3>
                            </div>

                            {/* Compliance Badge */}
                            <div className={`rounded-2xl p-5 border mb-6 text-center ${(analysis.totalScore || 0) >= 80 ? 'bg-green-50 border-green-200' :
                                (analysis.totalScore || 0) >= 60 ? 'bg-amber-50 border-amber-200' :
                                    'bg-red-50 border-red-200'
                                }`}>
                                <div className={`text-3xl font-black mb-1 ${(analysis.totalScore || 0) >= 80 ? 'text-green-600' :
                                    (analysis.totalScore || 0) >= 60 ? 'text-amber-600' :
                                        'text-red-600'
                                    }`}>
                                    {(analysis.totalScore || 0) >= 80 ? '✅ COMPLIANT' :
                                        (analysis.totalScore || 0) >= 60 ? '⚠️ PARTIALLY COMPLIANT' :
                                            '❌ NON-COMPLIANT'}
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Score: {analysis.totalScore || 0}/100
                                </p>
                            </div>

                            {/* Format Requirements */}
                            {analysis.formatRequirements && (
                                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 mb-6">
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Your Format Requirements</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis.formatRequirements}</p>
                                </div>
                            )}

                            {/* Issue counts */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-red-500 mb-1">{criticalCount}</div>
                                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Critical</div>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-amber-500 mb-1">{majorCount}</div>
                                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Major</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-blue-500 mb-1">{minorCount}</div>
                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Minor</div>
                                </div>
                            </div>

                            {/* Issue list */}
                            <div className="space-y-3">
                                {issues.slice(0, showAllIssues ? undefined : 5).map((issue, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-purple-100 rounded-xl hover:border-purple-200 transition-colors">
                                        <div className={`mt-0.5 shrink-0 ${issue.severity === 'Critical' ? 'text-red-500' :
                                            issue.severity === 'Major' ? 'text-amber-500' : 'text-purple-500'
                                            }`}>
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 leading-tight mb-1">{issue.type}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{issue.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {issues.length > 5 && !showAllIssues && (
                                    <button
                                        onClick={() => setShowAllIssues(true)}
                                        className="w-full text-center pt-2 pb-1 hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
                                            + {issues.length - 5} more issues found
                                        </span>
                                    </button>
                                )}
                                {issues.length > 5 && showAllIssues && (
                                    <button
                                        onClick={() => setShowAllIssues(false)}
                                        className="w-full text-center pt-2 pb-1 hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
                                            Show Less
                                        </span>
                                    </button>
                                )}
                                {issues.length === 0 && (
                                    <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
                                        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                                        <p className="text-green-700 font-bold">Fully compliant! No format violations found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* STANDARD AI ISSUE OVERVIEW */
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Info size={20} className="text-[#159e8a]" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Issue Overview</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-red-500 mb-1">{criticalCount}</div>
                                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Critical</div>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-amber-500 mb-1">{majorCount}</div>
                                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Major</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-blue-500 mb-1">{minorCount}</div>
                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Minor</div>
                                </div>
                            </div>

                            {/* ISSUE LIST (TOP 5) */}
                            <div className="space-y-3">
                                {issues.slice(0, showAllIssues ? undefined : 5).map((issue, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                                        <div className={`mt-0.5 shrink-0 ${issue.severity === 'Critical' ? 'text-red-500' :
                                            issue.severity === 'Major' ? 'text-amber-500' : 'text-blue-500'
                                            }`}>
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 leading-tight mb-1">{issue.type}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{issue.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {issues.length > 5 && !showAllIssues && (
                                    <button
                                        onClick={() => setShowAllIssues(true)}
                                        className="w-full text-center pt-2 pb-1 hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
                                            + {issues.length - 5} more issues found
                                        </span>
                                    </button>
                                )}
                                {issues.length > 5 && showAllIssues && (
                                    <button
                                        onClick={() => setShowAllIssues(false)}
                                        className="w-full text-center pt-2 pb-1 hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
                                            Show Less
                                        </span>
                                    </button>
                                )}
                                {issues.length === 0 && (
                                    <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
                                        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                                        <p className="text-green-700 font-bold">No issues found!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisSummaryModal;
