import React, { useState } from 'react';
import { Layout, Plus, Trash2, Search, ExternalLink, Pencil, Crown, Zap, X, Tag, Archive, ArchiveRestore } from 'lucide-react';
import { Workspace } from '../types';
import { workspaceApi } from '../services/workspaceApi';

interface WorkspacePageProps {
    workspaces: Workspace[];
    onCreateWorkspace: (name: string, description: string, category: string) => void;
    onDeleteWorkspace: (id: string) => void;
    onOpenWorkspace: (id: string) => void;
    onJoinWorkspace: (code: string) => void;
    showUpgradeModal?: boolean;
    onCloseUpgradeModal?: () => void;
    onWorkspaceUpdated?: (ws: Workspace) => void;
    onArchiveWorkspace?: (id: string) => void;
    onUnarchiveWorkspace?: (id: string) => void;
    currentView?: 'active' | 'archived';
    onViewChange?: (view: 'active' | 'archived') => void;
}

const WorkspacePage: React.FC<WorkspacePageProps> = ({
    workspaces,
    onCreateWorkspace,
    onDeleteWorkspace,
    onOpenWorkspace,
    onJoinWorkspace,
    showUpgradeModal = false,
    onCloseUpgradeModal,
    onWorkspaceUpdated,
    onArchiveWorkspace,
    onUnarchiveWorkspace,
    currentView = 'active',
    onViewChange
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [newWsName, setNewWsName] = useState('');
    const [newWsDesc, setNewWsDesc] = useState('');
    const [newWsCategory, setNewWsCategory] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Edit state
    const [editingWs, setEditingWs] = useState<Workspace | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Derive unique category tags from existing workspaces
    const categoryTags = ['All', ...Array.from(new Set(workspaces.map(ws => (ws as any).category || 'General')))];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWsName.trim()) {
            onCreateWorkspace(newWsName, newWsDesc, newWsCategory || 'General');
            setNewWsName('');
            setNewWsDesc('');
            setNewWsCategory('');
            setIsModalOpen(false);
        }
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            onJoinWorkspace(joinCode);
            setJoinCode('');
            setIsJoinModalOpen(false);
        }
    };

    const openEditModal = (ws: Workspace) => {
        setEditingWs(ws);
        setEditName(ws.name);
        setEditDesc(ws.description || '');
        setEditCategory((ws as any).category || 'General');
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWs) return;
        setEditLoading(true);
        try {
            const id = editingWs.id || editingWs._id;
            const response = await workspaceApi.update(id, {
                name: editName,
                description: editDesc,
                category: editCategory || 'General'
            });
            if (response.success && onWorkspaceUpdated) {
                onWorkspaceUpdated(response.data);
            }
            setEditingWs(null);
        } catch (err) {
            console.error('Failed to update workspace:', err);
        } finally {
            setEditLoading(false);
        }
    };

    const filteredWorkspaces = workspaces.filter(ws => {
        const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || ((ws as any).category || 'General') === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full bg-[#fcfcfd] font-sans antialiased text-slate-800 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto p-8 md:p-12">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-[#159e8a] mb-2">{currentView === 'archived' ? 'Archived Workspaces' : 'Work-Space'}</h1>
                        <p className="text-slate-500 font-medium">{currentView === 'archived' ? 'Your archived environments.' : 'Create and manage your project environments.'}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onViewChange?.(currentView === 'active' ? 'archived' : 'active')}
                            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm border ${currentView === 'archived'
                                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#159e8a]'
                                }`}
                            title={currentView === 'active' ? 'View Archived' : 'View Active'}
                        >
                            {currentView === 'active' ? <Archive size={20} /> : <ArchiveRestore size={20} />}
                            {currentView === 'active' ? 'Archived' : 'Back to Active'}
                        </button>
                        {currentView === 'active' && (
                            <>
                                <button
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="bg-white text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-[#159e8a] transition-all hover:-translate-y-0.5"
                                >
                                    <Search size={20} /> Join with Code
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-[#159e8a] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all hover:-translate-y-0.5"
                                >
                                    <Plus size={20} /> Create Workspace
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* SEARCH & STATS */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#159e8a22] transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="px-4 py-2 bg-teal-50 text-[#159e8a] rounded-xl text-sm font-bold">
                        {workspaces.length} Total
                    </div>
                </div>

                {/* CATEGORY FILTER TAGS */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categoryTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setCategoryFilter(tag)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${categoryFilter === tag
                                ? 'bg-[#159e8a] text-white shadow-md shadow-[#159e8a33]'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-[#159e8a] hover:text-[#159e8a]'
                                }`}
                        >
                            <Tag size={12} />
                            {tag}
                        </button>
                    ))}
                </div>

                {/* WORKSPACE GRID */}
                {filteredWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkspaces.map((ws) => (
                            <div
                                key={ws.id || ws._id}
                                className="bg-white border-2 border-[#159e8a]/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group hover:border-[#159e8a]/40"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#159e8a]">
                                        <Layout size={24} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(ws)}
                                            className="p-2 text-slate-300 hover:text-[#159e8a] hover:bg-teal-50 rounded-xl transition-all"
                                            title="Edit workspace"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => ws.isArchived ? onUnarchiveWorkspace?.(ws.id || ws._id) : onArchiveWorkspace?.(ws.id || ws._id)}
                                            className={`p-2 transition-all rounded-xl ${ws.isArchived
                                                ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                                                : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'
                                                }`}
                                            title={ws.isArchived ? "Unarchive workspace" : "Archive workspace"}
                                        >
                                            {ws.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                                        </button>
                                        <button
                                            onClick={() => onDeleteWorkspace(ws.id || ws._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete workspace"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Category badge */}
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
                                    <Tag size={9} />
                                    {(ws as any).category || 'General'}
                                </span>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#159e8a] transition-colors line-clamp-1">{ws.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed italic">
                                    {ws.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">
                                        {new Date(ws.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => onOpenWorkspace(ws.id || ws._id)}
                                        className="flex items-center gap-1.5 text-sm font-bold text-[#159e8a] hover:gap-3 transition-all"
                                    >
                                        Open <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                            {currentView === 'archived' ? <Archive size={40} /> : <Layout size={40} />}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {currentView === 'archived' ? 'No Archived Workspaces' : 'No Workspaces Found'}
                        </h2>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">
                            {currentView === 'archived'
                                ? "You haven't archived any workspaces yet. Archive workspaces you don't need active to keep your space organized."
                                : "You haven't joined any workspaces yet. Create one or join an existing one using an access code."}
                        </p>
                        {currentView === 'active' && (
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setIsJoinModalOpen(true)} className="text-slate-500 font-bold hover:text-[#159e8a]">
                                    Join existing
                                </button>
                                <button onClick={() => setIsModalOpen(true)} className="text-[#159e8a] font-bold underline underline-offset-8">
                                    Create new workspace
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Workspace</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all font-bold placeholder:text-slate-300"
                                    placeholder="e.g. Legal Documents 2024"
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all font-medium placeholder:text-slate-300"
                                    placeholder="e.g. Legal, Research, Finance…"
                                    value={newWsCategory}
                                    onChange={(e) => setNewWsCategory(e.target.value)}
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all h-28 resize-none font-medium text-slate-600"
                                    placeholder="What is this workspace for?"
                                    value={newWsDesc}
                                    onChange={(e) => setNewWsDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-[#159e8a] text-white rounded-2xl font-bold shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingWs && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Workspace</h2>
                        <form onSubmit={handleEdit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all font-bold"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all font-medium"
                                    placeholder="e.g. Legal, Research, Finance…"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all h-28 resize-none font-medium text-slate-600"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setEditingWs(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={editLoading} className="flex-1 py-4 bg-[#159e8a] text-white rounded-2xl font-bold shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all disabled:opacity-60">
                                    {editLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN MODAL */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Join Workspace</h2>
                        <p className="text-slate-500 mb-6 font-medium">Enter the 6-character access code shared by the workspace owner.</p>
                        <form onSubmit={handleJoin}>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Access Code</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all font-mono text-center text-2xl font-bold tracking-widest placeholder:text-slate-200 uppercase"
                                    placeholder="ABC123"
                                    maxLength={6}
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-[#159e8a] text-white rounded-2xl font-bold shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all">Join</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* UPGRADE REQUIRED MODAL */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 text-center relative">
                        <button
                            onClick={onCloseUpgradeModal}
                            className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                            <Crown size={36} className="text-amber-500" />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2">Upgrade Required</h2>
                        <p className="text-slate-500 font-medium mb-1">Free Plan Limit Reached</p>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            You've used all <span className="font-bold text-slate-600">3 workspaces</span> included in the Free plan. Upgrade to Pro for unlimited workspaces and advanced features.
                        </p>

                        {/* Upgrade perks */}
                        <div className="bg-gradient-to-br from-[#159e8a10] to-teal-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                            {['Unlimited workspaces', 'Admin direct uploads', 'Priority AI analysis', 'Advanced analytics'].map(perk => (
                                <div key={perk} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Zap size={14} className="text-[#159e8a] shrink-0" />
                                    {perk}
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-gradient-to-r from-[#159e8a] to-teal-400 text-white rounded-2xl font-black text-lg shadow-lg shadow-[#159e8a33] hover:opacity-90 transition-all">
                            Upgrade to Pro
                        </button>
                        <button onClick={onCloseUpgradeModal} className="mt-3 w-full py-3 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">
                            Maybe later
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspacePage;
