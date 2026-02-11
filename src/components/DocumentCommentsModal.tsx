import React, { useState } from 'react';
import { X, MessageSquare, Send, Trash2, Edit2, Check, User } from 'lucide-react';
import { workspaceApi } from '../services/workspaceApi';
import { User as UserType } from '../types';

interface Comment {
    id: string;
    text: string;
    userId: string;
    userName: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

interface DocumentCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    document: any;
    currentUser: UserType;
    isAdmin: boolean;
}

const DocumentCommentsModal: React.FC<DocumentCommentsModalProps> = ({
    isOpen,
    onClose,
    workspaceId,
    document,
    currentUser,
    isAdmin
}) => {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !document) return null;

    const comments: Comment[] = document.comments || [];
    const currentUserId = currentUser.id || currentUser._id;

    // Check if user is allowed to comment: Admin OR Document Owner
    const isDocOwner = String(document.userId) === String(currentUserId);
    const canComment = isAdmin || isDocOwner;

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await workspaceApi.addDocumentComment(workspaceId, document.analysisId, newComment);
            setNewComment('');
            window.location.reload(); // Simple refresh for now
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        setLoading(true);
        try {
            await workspaceApi.deleteDocumentComment(workspaceId, document.analysisId, commentId);
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditText(comment.text);
    };

    const handleEditComment = async () => {
        if (!editText.trim() || !editingCommentId) return;
        setLoading(true);
        try {
            await workspaceApi.editDocumentComment(workspaceId, document.analysisId, editingCommentId, editText);
            setEditingCommentId(null);
            setEditText('');
            window.location.reload();
        } catch (error) {
            console.error('Failed to edit comment:', error);
            alert('Failed to edit comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 h-[600px]">
                {/* HEADER */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Comments</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {document.fileName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* COMMENTS LIST */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
                    {comments.length > 0 ? (
                        comments.map((comment) => {
                            const isMyComment = String(comment.userId) === String(currentUserId);
                            const canEdit = isAdmin || isMyComment;
                            const canDelete = isAdmin || isMyComment;

                            return (
                                <div key={comment.id} className={`bg-white p-4 rounded-2xl border shadow-sm ${isMyComment ? 'border-indigo-100' : 'border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${comment.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {comment.userName ? comment.userName.substring(0, 1).toUpperCase() : <User size={12} />}
                                            </div>
                                            <span className={`text-xs font-bold ${comment.role === 'Admin' ? 'text-amber-600' : 'text-slate-700'}`}>
                                                {comment.userName || (comment.role === 'Admin' ? 'Admin' : 'Member')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium ml-1">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {canEdit && (
                                            <div className="flex items-center gap-1">
                                                {editingCommentId === comment.id ? (
                                                    <button
                                                        onClick={handleEditComment}
                                                        disabled={loading}
                                                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(comment)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    disabled={loading}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full text-sm p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {comment.text}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No comments yet</p>
                            <p className="text-xs mt-1">Start the conversation!</p>
                        </div>
                    )}
                </div>

                {/* ADD COMMENT INPUT */}
                {canComment ? (
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type a comment..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || loading}
                                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        ReadOnly Access
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentCommentsModal;
