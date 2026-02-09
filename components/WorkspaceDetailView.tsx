import React, { useState } from 'react';
import {
    ArrowLeft, Share2, Upload, FileText,
    Search, Trash2, ExternalLink, Copy, Check
} from 'lucide-react';
import { Workspace, DocumentAnalysis, User } from '../types';
import AnalysisSummaryModal from './AnalysisSummaryModal';

interface WorkspaceDetailViewProps {
    workspace: Workspace;
    currentUser: User;
    onBack: () => void;
    onUploadFile: (file: File) => void;
    onDeleteDocument: (fileName: string, uploadDate: string) => void;
    onKickMember: (memberId: string) => void;
}

const WorkspaceDetailView: React.FC<WorkspaceDetailViewProps> = ({
    workspace,
    currentUser,
    onBack,
    onUploadFile,
    onDeleteDocument,
    onKickMember
}) => {
    const [copied, setCopied] = useState(false);
    const [accessCodeCopied, setAccessCodeCopied] = useState(false);
    const [showAllMembers, setShowAllMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date'); // Added sort state
    const [viewAnalysis, setViewAnalysis] = useState<DocumentAnalysis | null>(null); // State for view modal

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyAccessCode = () => {
        navigator.clipboard.writeText(workspace.accessCode);
        setAccessCodeCopied(true);
        setTimeout(() => setAccessCodeCopied(false), 2000);
    };

    const isOwner = currentUser.id === workspace.ownerId || currentUser._id === workspace.ownerId || currentUser.id === workspace.ownerId?.toString();
    const currentUserId = currentUser._id || currentUser.id; // Handle both ID formats

    const filteredDocs = (workspace.documents || []).filter(doc => {
        const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const visibleToUser = isOwner || doc.userId === currentUserId;
        return matchesSearch && visibleToUser;
    });

    return (
        <div className="h-full bg-[#fcfcfd] font-sans antialiased text-slate-800 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto p-8 md:p-12">
                {/* BACK & ACTIONS */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#159e8a] font-bold transition-colors group"
                    >
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        Back to Workspaces
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-slate-400" />}
                            {copied ? 'Copied Link' : 'Invite Link'}
                        </button>
                        <button className="p-2.5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-400 hover:text-[#159e8a] shadow-sm transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* WORKSPACE INFO */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-teal-50 rounded-[28px] flex items-center justify-center text-[#159e8a]">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight">{workspace.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                    Role: {isOwner ? <span className="text-[#159e8a]">Admin</span> : 'Member'}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    Created {new Date(workspace.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    • {workspace.members?.length || 1} Member{workspace.members?.length !== 1 && 's'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <p className="text-slate-500 max-w-2xl text-lg leading-relaxed font-medium italic flex-1">
                            {workspace.description || 'No specialized description provided for this project environment.'}
                        </p>

                        {isOwner && (
                            <div className="bg-slate-900 text-white p-6 rounded-3xl min-w-[300px] shadow-xl shadow-slate-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Access Code</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <code className="text-3xl font-mono font-bold tracking-widest text-[#159e8a]">{workspace.accessCode}</code>
                                    <button
                                        onClick={handleCopyAccessCode}
                                        className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                        title={accessCodeCopied ? 'Copied!' : 'Copy Code'}
                                    >
                                        {accessCodeCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Share this code to let others join.</p>
                            </div>
                        )}
                    </div>
                </header>

                {/* MEMBERS & COLLABORATION */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            Workspace Members ({workspace.members?.length || 0})
                        </h3>
                        {isOwner && (workspace.members?.length || 0) > 0 && (
                            <button
                                onClick={() => setShowAllMembers(!showAllMembers)}
                                className="text-xs font-bold text-[#159e8a] hover:underline"
                            >
                                {showAllMembers ? 'Show Less' : 'Manage Members'}
                            </button>
                        )}
                    </div>

                    {!showAllMembers ? (
                        // Compact view - just avatars
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                                {(workspace.members || []).slice(0, 8).map((member: any, i) => {
                                    const memberId = member._id || member;
                                    const memberName = member.name || 'Member';

                                    return (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#159e8a] to-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm"
                                            title={memberName}
                                        >
                                            {memberName.substring(0, 2).toUpperCase()}
                                        </div>
                                    );
                                })}
                            </div>
                            {workspace.members?.length > 8 && (
                                <div className="text-sm text-slate-400 font-medium ml-2">
                                    +{workspace.members.length - 8} more
                                </div>
                            )}
                        </div>
                    ) : (
                        // Expanded view - detailed list (admin only)
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 max-h-96 overflow-y-auto">
                            {(workspace.members || []).map((member: any, i) => {
                                const memberId = member._id || member;
                                const memberName = member.name || 'Unknown User';
                                const memberEmail = member.email || 'No email';
                                const isCurrentUser = memberId === currentUserId;

                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#159e8a] to-teal-600 flex items-center justify-center text-white font-bold">
                                                {memberName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                    {memberName}
                                                    {isCurrentUser && (
                                                        <span className="text-xs bg-teal-50 text-[#159e8a] px-2 py-0.5 rounded-full">You</span>
                                                    )}
                                                    {memberId === workspace.ownerId && (
                                                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Admin</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400">{memberEmail}</div>
                                            </div>
                                        </div>
                                        {/* Kick Button - Only for admin, and not for themselves */}
                                        {isOwner && !isCurrentUser && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
                                                        onKickMember(memberId);
                                                    }
                                                }}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove member"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>



                {/* DOCUMENT LIST */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Workspace Documents</h2>

                    <div className="flex flex-col md:flex-row gap-3">
                        {/* SEARCH */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Filter docs..."
                                className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#159e8a11]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* SORT */}
                        <div className="flex bg-white border border-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setSortBy('date')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'date' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Date
                            </button>
                            <button
                                onClick={() => setSortBy('score')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'score' ? 'bg-[#159e8a11] text-[#159e8a]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Score
                            </button>
                        </div>
                    </div>
                </div>

                {filteredDocs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDocs.sort((a, b) => {
                            if (sortBy === 'score') {
                                return (b.totalScore || 0) - (a.totalScore || 0); // High to low
                            }
                            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(); // Newest first
                        }).map((doc, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-slate-50 rounded-[28px] p-5 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-all group gap-4"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#159e8a] transition-all shrink-0">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-[#159e8a] transition-colors text-lg">{doc.fileName}</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            <span>{doc.fileType}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                            {(isOwner || doc.submitterName) && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md normal-case tracking-normal">
                                                        by {doc.submitterName || 'Unknown User'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 border-t md:border-0 border-slate-50 pt-3 md:pt-0">
                                    <div className="text-right mr-4">
                                        <div className={`text-2xl font-black ${(doc.totalScore || 0) >= 90 ? 'text-green-500' :
                                            (doc.totalScore || 0) >= 70 ? 'text-[#159e8a]' :
                                                (doc.totalScore || 0) >= 50 ? 'text-amber-500' : 'text-red-500'
                                            }`}>
                                            {doc.totalScore || 0}%
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300 uppercase">Analysis Score</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* View Analysis Button - Opens Modal */}
                                        <button
                                            onClick={() => setViewAnalysis(doc)}
                                            className="p-3 text-slate-300 hover:text-[#159e8a] hover:bg-teal-50 rounded-2xl transition-all"
                                            title="View Analysis Summary"
                                        >
                                            <ExternalLink size={20} />
                                        </button>

                                        {/* Delete Button - Only for Owner/Admin */}
                                        {isOwner && (
                                            <button
                                                onClick={() => onDeleteDocument(doc.fileName, doc.uploadDate)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                title="Remove Document"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-slate-50 shadow-sm">
                        <p className="text-slate-400 font-medium italic">No documents uploaded to this workspace yet.</p>
                    </div>
                )}
            </div>

            {/* ANALYSIS SUMMARY MODAL */}
            <AnalysisSummaryModal
                isOpen={!!viewAnalysis}
                onClose={() => setViewAnalysis(null)}
                analysis={viewAnalysis}
            />
        </div>
    );
};

export default WorkspaceDetailView;
