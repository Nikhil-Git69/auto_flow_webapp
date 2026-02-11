import React, { useState } from 'react';
import { Layout, Plus, Trash2, Search, ExternalLink } from 'lucide-react';
import { Workspace } from '../types';

interface WorkspacePageProps {
    workspaces: Workspace[];
    onCreateWorkspace: (name: string, description: string) => void;
    onDeleteWorkspace: (id: string) => void;
    onOpenWorkspace: (id: string) => void;
    onJoinWorkspace: (code: string) => void;
}

const WorkspacePage: React.FC<WorkspacePageProps> = ({
    workspaces,
    onCreateWorkspace,
    onDeleteWorkspace,
    onOpenWorkspace,
    onJoinWorkspace
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [newWsName, setNewWsName] = useState('');
    const [newWsDesc, setNewWsDesc] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWsName.trim()) {
            onCreateWorkspace(newWsName, newWsDesc);
            setNewWsName('');
            setNewWsDesc('');
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

    const filteredWorkspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full bg-[#fcfcfd] font-sans antialiased text-slate-800 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto p-8 md:p-12">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Workspaces</h1>
                        <p className="text-slate-500 font-medium">Create and manage your project environments</p>
                    </div>
                    <div className="flex gap-3">
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
                    </div>
                </header>

                {/* SEARCH & STATS */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
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

                {/* WORKSPACE GRID */}
                {filteredWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkspaces.map((ws) => {
                            console.log("Rendering workspace:", ws);
                            return (
                                <div
                                    key={ws.id || ws._id}
                                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#159e8a]">
                                            <Layout size={24} />
                                        </div>
                                        <button
                                            onClick={() => onDeleteWorkspace(ws.id || ws._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
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
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Layout size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Workspaces Found</h2>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">
                            You haven't joined any workspaces yet. Create one or join an existing one using an access code.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="text-slate-500 font-bold hover:text-[#159e8a]"
                            >
                                Join existing
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-[#159e8a] font-bold underline underline-offset-8"
                            >
                                Create new workspace
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Workspace</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-6">
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
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#159e8a22] transition-all h-32 resize-none font-medium text-slate-600"
                                    placeholder="What is this workspace for?"
                                    value={newWsDesc}
                                    onChange={(e) => setNewWsDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#159e8a] text-white rounded-2xl font-bold shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN MODAL */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
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
                                <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#159e8a] text-white rounded-2xl font-bold shadow-lg shadow-[#159e8a33] hover:bg-[#0f8a77] transition-all"
                                >
                                    Join
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspacePage;
