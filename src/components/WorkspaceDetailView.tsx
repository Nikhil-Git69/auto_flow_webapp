import React, { useState, useRef } from 'react';
import {
    ArrowLeft, Upload, FileText,
    Search, Trash2, ExternalLink, Copy, Check,
    Layout, Calendar, MessageSquare, Eye, FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Workspace, DocumentAnalysis, User } from '../types';
import AnalysisSummaryModal from './AnalysisSummaryModal';
import DocumentCommentsModal from './DocumentCommentsModal';
import AdminUploadPreviewModal from './AdminUploadPreviewModal';
import { workspaceApi } from '../services/workspaceApi';

interface WorkspaceDetailViewProps {
    workspace: Workspace;
    currentUser: User;
    onUploadFile: (file: File) => void;
    onDeleteDocument: (fileName: string, uploadDate: string) => void;
    onKickMember: (memberId: string) => void;
    onPromoteToCoAdmin?: (memberId: string) => void;
    onDemoteToMember?: (memberId: string) => void;
}

const WorkspaceDetailView: React.FC<WorkspaceDetailViewProps> = ({
    workspace,
    currentUser,
    onBack,
    onUploadFile,
    onDeleteDocument,
    onKickMember,
    onPromoteToCoAdmin,
    onDemoteToMember
}) => {
    const [accessCodeCopied, setAccessCodeCopied] = useState(false);
    const [showAllMembers, setShowAllMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
    const [viewAnalysis, setViewAnalysis] = useState<DocumentAnalysis | null>(null);
    const [commentDoc, setCommentDoc] = useState<any>(null);
    const [analysisModal, setAnalysisModal] = useState<{ id: string; type: 'report' | 'concept' } | null>(null);
    // Admin uploads state
    const [adminUploads, setAdminUploads] = useState<any[]>((workspace as any).adminUploads || []);
    const [uploadingAdmin, setUploadingAdmin] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
    const adminFileInputRef = useRef<HTMLInputElement>(null);
    // Tab state
    const [activeTab, setActiveTab] = useState<'documents' | 'references'>('documents');
    const navigate = useNavigate();
    const workspaceReturnPath = `/workspace/${workspace.id || workspace._id}`;



    const handleCopyAccessCode = () => {
        navigator.clipboard.writeText(workspace.accessCode);
        setAccessCodeCopied(true);
        setTimeout(() => setAccessCodeCopied(false), 2000);
    };

    const handleAdminUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAdmin(true);
        try {
            const wsId = workspace.id || workspace._id;
            const response = await workspaceApi.uploadAdminFile(wsId, file);
            if (response.success) {
                setAdminUploads(prev => [...prev, response.data]);
            }
        } catch (err: any) {
            console.error('Admin upload failed:', err);
        } finally {
            setUploadingAdmin(false);
            if (adminFileInputRef.current) adminFileInputRef.current.value = '';
        }
    };

    const handleDeleteAdminFile = async (uploadId: string) => {
        try {
            const wsId = workspace.id || workspace._id;
            await workspaceApi.deleteAdminFile(wsId, uploadId);
            setAdminUploads(prev => prev.filter((u: any) => u.id !== uploadId));
        } catch (err) {
            console.error('Delete admin file failed:', err);
        }
    };

    const isOwner = currentUser.id === workspace.ownerId || currentUser._id === workspace.ownerId || currentUser.id === workspace.ownerId?.toString();
    const isCoAdmin = workspace.coAdmins?.includes(currentUser.id) || workspace.coAdmins?.includes(currentUser._id || '');
    const currentUserId = currentUser._id || currentUser.id;
    const isAdmin = isOwner || isCoAdmin;

    const filteredDocs = (workspace.documents || []).filter(doc => {
        const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const docUserId = doc.userId;
        const visibleToUser = isOwner || String(docUserId) === String(currentUserId);
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
                                    Role: {isOwner ? <span className="text-[#159e8a]">Admin</span> : isCoAdmin ? <span className="text-teal-600">Co-Admin</span> : 'Member'}
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

                {/* NAV TABS */}
                <div className="flex items-center gap-1 mb-8 border-b border-slate-200 pb-1">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-all rounded-t-lg ${activeTab === 'documents'
                            ? 'text-[#159e8a] border-b-2 border-[#159e8a]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <FileText size={18} />
                        Documents
                    </button>
                    <button
                        onClick={() => navigate(`/workspace/${workspace.id || workspace._id}/gantt`)}
                        className="px-4 py-2 font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg transition-all flex items-center gap-2"
                    >
                        <Calendar size={18} />
                        Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab('references')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-all rounded-t-lg ${activeTab === 'references'
                            ? 'text-[#159e8a] border-b-2 border-[#159e8a]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <FolderOpen size={18} />
                        Reference Materials
                        {adminUploads.length > 0 && (
                            <span className="text-[10px] font-bold bg-teal-100 text-[#159e8a] px-1.5 py-0.5 rounded-full">
                                {adminUploads.length}
                            </span>
                        )}
                    </button>
                </div>

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
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                                {(workspace.members || []).slice(0, 8).map((member: any, i) => {
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
                            {(workspace.members?.length || 0) > 8 && (
                                <span className="text-xs font-bold text-slate-400 ml-2">
                                    +{(workspace.members?.length || 0) - 8} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {(workspace.members || []).map((member: any, i) => {
                                const memberId = member._id || member;
                                const memberName = member.name || 'Member';
                                const memberEmail = member.email || '';
                                const isCurrentUser = String(memberId) === String(currentUserId);
                                return (
                                    <div key={i} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#159e8a] to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                                {memberName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                    {memberName}
                                                    {isCurrentUser && (
                                                        <span className="text-xs bg-teal-50 text-[#159e8a] px-2 py-0.5 rounded-full">You</span>
                                                    )}
                                                    {memberId === workspace.ownerId && (
                                                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Admin</span>
                                                    )}
                                                    {workspace.coAdmins?.includes(memberId) && (
                                                        <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">Co-Admin</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400">{memberEmail}</div>
                                            </div>
                                        </div>
                                        {isOwner && !isCurrentUser && (
                                            <div className="flex items-center gap-2">
                                                {workspace.coAdmins?.includes(memberId) ? (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to demote ${memberName} to Member?`) && onDemoteToMember) {
                                                                onDemoteToMember(memberId);
                                                            }
                                                        }}
                                                        className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-200 transition-all"
                                                        title="Demote to Member"
                                                    >
                                                        Demote
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to promote ${memberName} to Co-Admin?`) && onPromoteToCoAdmin) {
                                                                onPromoteToCoAdmin(memberId);
                                                            }
                                                        }}
                                                        className="text-xs font-bold text-[#159e8a] hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-teal-200 transition-all"
                                                        title="Promote to Co-Admin"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
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
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── DOCUMENTS TAB ─────────────────────────────────── */}
                {activeTab === 'documents' && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Workspace Documents</h2>
                            <div className="flex flex-col md:flex-row gap-3">
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
                                    if (sortBy === 'score') return (b.totalScore || 0) - (a.totalScore || 0);
                                    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
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
                                                <h4 className="font-bold text-slate-900 group-hover:text-[#159e8a] transition-colors text-lg flex items-center gap-2">
                                                    {doc.fileName}
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${doc.status === 'Accepted' ? 'bg-green-100 text-green-700' : doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {doc.status || 'Pending'}
                                                    </span>
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                                    <span>{doc.fileType}</span>
                                                    <span>•</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${doc.formatType === 'concept' ? 'bg-indigo-100 text-indigo-600' : doc.formatType === 'custom' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 hidden'}`}>
                                                        {doc.formatType === 'concept' ? 'CONCEPT' : doc.formatType === 'custom' ? 'CUSTOM' : ''}
                                                    </span>
                                                    <span className={doc.formatType && doc.formatType !== 'default' ? '' : 'hidden'}>•</span>
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
                                            {isOwner && (
                                                <div className="mr-2">
                                                    <select
                                                        value={doc.status || 'Pending'}
                                                        onChange={async (e) => {
                                                            try {
                                                                const newStatus = e.target.value;
                                                                await workspaceApi.updateDocumentStatus(workspace.id || workspace._id, doc.analysisId, newStatus);
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                console.error('Status update failed:', err);
                                                                alert(`Failed to update status: ${err.message}`);
                                                            }
                                                        }}
                                                        className={`text-xs font-bold rounded-md py-1.5 pl-2 pr-6 border-none ring-1 outline-none cursor-pointer ${doc.status === 'Accepted' ? 'bg-green-50 text-green-700 ring-green-200 focus:ring-green-400' : doc.status === 'Rejected' ? 'bg-red-50 text-red-700 ring-red-200 focus:ring-red-400' : 'bg-amber-50 text-amber-700 ring-amber-200 focus:ring-amber-400'}`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="text-right mr-4">
                                                <div className={`text-2xl font-black ${(doc.totalScore || 0) >= 90 ? 'text-green-500' : (doc.totalScore || 0) >= 70 ? 'text-[#159e8a]' : (doc.totalScore || 0) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {doc.totalScore || 0}%
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-300 uppercase">Analysis Score</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCommentDoc(doc)}
                                                    className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all relative"
                                                    title="Comments"
                                                >
                                                    <MessageSquare size={20} />
                                                    {doc.comments && doc.comments.length > 0 && (
                                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (doc.formatType === 'concept') {
                                                            navigate(`/concept-analysis/${doc.analysisId}`, { state: { from: workspaceReturnPath } });
                                                        } else if (doc.formatType === 'report') {
                                                            navigate(`/report-analysis/${doc.analysisId}`, { state: { from: workspaceReturnPath } });
                                                        } else {
                                                            setViewAnalysis(doc);
                                                        }
                                                    }}
                                                    className="p-3 text-slate-300 hover:text-[#159e8a] hover:bg-teal-50 rounded-2xl transition-all"
                                                    title="View Analysis"
                                                >
                                                    <ExternalLink size={20} />
                                                </button>
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
                )}

                {/* ─── REFERENCE MATERIALS TAB ───────────────────────── */}
                {activeTab === 'references' && (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

                        {/* Section header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
                                    <FolderOpen size={18} className="text-[#159e8a]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800 leading-tight">Reference Materials</h2>
                                    <p className="text-xs text-slate-400 font-medium">Files shared by the workspace admin</p>
                                </div>
                                <span className="ml-1 text-xs font-bold text-[#159e8a] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                                    {adminUploads.length}
                                </span>
                            </div>
                            {isOwner && (
                                <>
                                    <input
                                        type="file"
                                        ref={adminFileInputRef}
                                        className="hidden"
                                        onChange={handleAdminUpload}
                                    />
                                    <button
                                        onClick={() => adminFileInputRef.current?.click()}
                                        disabled={uploadingAdmin}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#159e8a] text-white text-sm font-bold rounded-2xl hover:bg-[#0f8a77] active:scale-95 transition-all disabled:opacity-60 shadow-md shadow-[#159e8a22]"
                                    >
                                        <Upload size={14} />
                                        {uploadingAdmin ? 'Uploading…' : 'Direct Upload'}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* File grid */}
                        <div className="p-6">
                            {adminUploads.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {adminUploads.map((upload: any) => {
                                        const ext = upload.fileName.split('.').pop()?.toLowerCase() || '';
                                        const isPDF = ext === 'pdf';
                                        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
                                        return (
                                            <div
                                                key={upload.id}
                                                className="group flex items-center gap-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-teal-200 hover:shadow-md rounded-2xl p-3.5 transition-all cursor-default"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] tracking-wider ${isPDF ? 'bg-red-50 text-red-500' : isImage ? 'bg-blue-50 text-blue-500' : 'bg-teal-50 text-[#159e8a]'}`}>
                                                    {ext.toUpperCase() || <FileText size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate leading-tight" title={upload.fileName}>
                                                        {upload.fileName}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <span className="truncate">{upload.uploaderName}</span>
                                                        <span className="text-slate-200">·</span>
                                                        <span className="shrink-0">{new Date(upload.uploadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setPreviewFile({
                                                            url: workspaceApi.getAdminFileDownloadUrl(workspace.id || workspace._id, upload.id),
                                                            name: upload.fileName
                                                        })}
                                                        className="p-2 text-slate-400 hover:text-[#159e8a] hover:bg-teal-50 rounded-xl transition-all"
                                                        title="Preview file"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleDeleteAdminFile(upload.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete file"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-14 text-center">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <FolderOpen size={24} className="text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {isOwner
                                            ? 'No reference files yet. Click "Direct Upload" to add one.'
                                            : 'No reference files shared in this workspace yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ANALYSIS SUMMARY MODAL */}
            <AnalysisSummaryModal
                isOpen={!!viewAnalysis}
                onClose={() => setViewAnalysis(null)}
                analysis={viewAnalysis}
            />

            {/* COMMENTS MODAL */}
            <DocumentCommentsModal
                isOpen={!!commentDoc}
                onClose={() => setCommentDoc(null)}
                workspaceId={workspace.id || workspace._id}
                document={commentDoc}
                currentUser={currentUser}
                isAdmin={isOwner}
            />

            {/* ADMIN FILE PREVIEW MODAL */}
            <AdminUploadPreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ''}
                fileName={previewFile?.name || ''}
            />
        </div>
    );
};

export default WorkspaceDetailView;
