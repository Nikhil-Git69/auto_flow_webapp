import React, { useState, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { workspaceApi } from '../../services/workspaceApi';
import { startOfDay } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

interface GanttViewProps {
    workspaceId: string;
    isAdmin: boolean;
}

const GanttView: React.FC<GanttViewProps> = ({ workspaceId, isAdmin }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month); // Default to Month (Quarters)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{
        id?: string,
        title: string,
        description?: string,
        startDate: Date,
        deadline: Date,
        color?: string,
        memberStatuses?: any[]
    } | null>(null);

    // Predefined colors for the picker
    const colorPalette = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Amber
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#f97316', // Orange
        '#64748b', // Slate
    ];

    useEffect(() => {
        fetchTasks();
        fetchWorkspaceDetails();
        // Get current user from storage
        const userStr = localStorage.getItem('autoflow_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUser(user);
            } catch (e) { console.error("Error parsing user", e); }
        }
    }, [workspaceId]);

    const fetchWorkspaceDetails = async () => {
        try {
            const response = await workspaceApi.getById(workspaceId);
            if (response.success) {
                setWorkspaceMembers(response.data.members || []);
            }
        } catch (error) {
            console.error("Failed to fetch workspace members", error);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await workspaceApi.getBoard(workspaceId);
            if (response.success && response.data.length > 0) {
                // Flatten tasks from all boards (if multiple) or just take first
                // Assuming single board for now based on previous code
                const allTasks: any[] = [];
                response.data.forEach((board: any) => {
                    if (board.tasks) allTasks.push(...board.tasks);
                });

                // const apiTasks = response.data[0].tasks;

                // Transform API tasks to Gantt tasks
                const ganttTasks: Task[] = allTasks.map((t: any) => {
                    const taskColor = t.color || '#3b82f6';
                    return {
                        start: t.startDate ? new Date(t.startDate) : startOfDay(new Date()),
                        end: t.deadline ? new Date(t.deadline) : startOfDay(new Date(new Date().setDate(new Date().getDate() + 14))),
                        name: t.title,
                        id: t.id,
                        type: 'task',
                        progress: t.status === 'Done' ? 100 : t.status === 'In Progress' ? 50 : 0,
                        isDisabled: !isAdmin, // Only admin handles drag/drop
                        styles: {
                            progressColor: taskColor,
                            progressSelectedColor: taskColor,
                            backgroundColor: t.status === 'Done' ? '#10b981' : taskColor + '40', // Add transparency for background to show track
                            backgroundSelectedColor: taskColor + '60'
                        },
                        // Store full task data in a custom property if needed, or lookup later
                        // We need description and memberStatuses
                        originalData: t
                    };
                });

                // Sort by date
                ganttTasks.sort((a, b) => a.start.getTime() - b.start.getTime());
                setTasks(ganttTasks);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskChange = async (task: Task) => {
        if (!isAdmin) return;
        try {
            // Update UI immediately (optimistic)
            setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));

            await workspaceApi.updateTask(workspaceId, task.id, {
                startDate: task.start,
                deadline: task.end
            });
        } catch (err: any) {
            setError(err.message);
            fetchTasks(); // Revert
        }
    };

    const handleDblClick = (task: Task) => {
        // Allow members to view details too
        // if (!isAdmin) return; 

        // Find original task to get color and other details
        // We stored logic in fetchTasks but typescript Task interface of gantt-react might not have custom props.
        // So let's find it from state or if we stored it
        // We need to re-fetch or look up in the 'tasks' state if we extended it, 
        // OR request fresh data. 
        // Since we are not storing originalData in state cleanly (unless we cast), let's refetch or find from a parallel list?
        // Actually, let's just use what we have or refetch board if needed not to be stale?
        // Optimization: We could store 'apiTasks' in state too.
        // For now, let's try to pass `originalData` in the task object (requires casting).
        const extendedTask = task as any;
        const originalData = extendedTask.originalData;

        if (!originalData) return;

        setEditingTask({
            id: task.id,
            title: task.name,
            description: originalData.description || '',
            startDate: task.start,
            deadline: task.end,
            color: originalData.color || '#3b82f6',
            memberStatuses: originalData.memberStatuses || []
        });
        setIsModalOpen(true);
    };

    const handleSaveTask = async () => {
        if (!editingTask || !editingTask.title) return;

        try {
            if (editingTask.id) {
                // Edit existing
                // Construct update payload
                // If member, only send memberStatuses
                // If admin, send everything

                let updatePayload: any = {};

                if (isAdmin) {
                    updatePayload = {
                        title: editingTask.title,
                        description: editingTask.description,
                        startDate: editingTask.startDate,
                        deadline: editingTask.deadline,
                        color: editingTask.color,
                        memberStatuses: editingTask.memberStatuses // Admin overwrite
                    };
                } else {
                    // Member update
                    // Only send memberStatuses
                    updatePayload = {
                        memberStatuses: editingTask.memberStatuses
                    };
                }

                const response = await workspaceApi.updateTask(workspaceId, editingTask.id, updatePayload);
                if (response.success) {
                    fetchTasks();
                }
            } else {
                // Create new (Admin only)
                if (!isAdmin) return;

                const response = await workspaceApi.createTask(workspaceId, {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: 'To Do',
                    startDate: editingTask.startDate,
                    deadline: editingTask.deadline,
                    color: editingTask.color,
                    boardId: undefined // Let backend find default
                });
                if (response.success) {
                    fetchTasks();
                }
            }
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (err: any) {
            alert('Failed to save task: ' + err.message);
        }
    };

    const handleDeleteTask = async () => {
        if (!editingTask?.id || !isAdmin) return;
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            await workspaceApi.deleteTask(workspaceId, editingTask.id);
            fetchTasks();
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (err: any) {
            alert('Failed to delete: ' + err.message);
        }
    }

    const openNewTaskModal = () => {
        setEditingTask({
            title: '',
            description: '',
            startDate: new Date(),
            deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
            color: '#3b82f6', // Default blue
            memberStatuses: []
        });
        setIsModalOpen(true);
    };

    // Helper to update a member status locally in the modal
    const updateMemberStatus = (userId: string, newStatus: string) => {
        if (!editingTask) return;

        const currentStatuses = [...(editingTask.memberStatuses || [])];
        const existingIndex = currentStatuses.findIndex(s => s.userId === userId);

        if (existingIndex >= 0) {
            if (newStatus === 'DELETE') {
                // Remove status
                currentStatuses.splice(existingIndex, 1);
            } else {
                currentStatuses[existingIndex] = { ...currentStatuses[existingIndex], status: newStatus, updatedAt: new Date() };
            }
        } else {
            if (newStatus !== 'DELETE') {
                currentStatuses.push({ userId, status: newStatus, updatedAt: new Date() });
            }
        }

        setEditingTask({ ...editingTask, memberStatuses: currentStatuses });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
        </div>
    );
    if (error) return <div className="p-8 text-red-500 text-center">Error: {error}</div>;

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-slate-700">Project Timeline</h2>
                    {isAdmin && (
                        <>
                            <button onClick={openNewTaskModal} className="flex items-center gap-1 text-xs bg-[#159e8a] text-white px-3 py-1.5 rounded-md hover:bg-[#118272] transition-colors">
                                <Plus size={14} /> Add Activity
                            </button>
                            <span className="text-xs text-slate-400 ml-2">(Double-click task to edit)</span>
                        </>
                    )}
                    {!isAdmin && <span className="text-xs text-slate-400 ml-2">(Double-click to view details & update status)</span>}
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode(ViewMode.Day)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Day ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-600'}`}>Days</button>
                    <button onClick={() => setViewMode(ViewMode.Week)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Week ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-600'}`}>Weeks</button>
                    <button onClick={() => setViewMode(ViewMode.Month)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Month ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-600'}`}>Months</button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="mb-2">No timeline activities found.</p>
                        {isAdmin && (
                            <div className="flex gap-4">
                                <button onClick={openNewTaskModal} className="text-sm bg-slate-100 px-4 py-2 rounded-md hover:bg-slate-200 text-slate-700">Create Activity</button>
                            </div>
                        )}
                        {!isAdmin && <p className="text-sm">Waiting for supervisor to add activities.</p>}
                    </div>
                ) : (
                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm h-full">
                        <Gantt
                            tasks={tasks}
                            viewMode={viewMode}
                            onDateChange={handleTaskChange}
                            onDoubleClick={handleDblClick}
                            listCellWidth="300px" // Wider for "Process" name
                            columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 150 : 60} // Wider columns
                            headerHeight={50}
                            rowHeight={50}
                            barCornerRadius={8}
                            fontFamily="Inter, sans-serif"
                            fontSize="12px"
                        />
                    </div>
                )}
            </div>

            {!isAdmin && (
                <div className="px-6 py-2 bg-amber-50 text-amber-600 text-xs font-bold text-center border-t border-amber-100">
                    🔒 Tasks are managed by supervisor. You can update your own progress status.
                </div>
            )}

            {/* Task Edit/Create Modal */}
            {isModalOpen && editingTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">{editingTask.id ? (isAdmin ? 'Edit Activity' : 'Activity Details') : 'New Activity'}</h3>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                            {/* BASIC INFO */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Activity Name</label>
                                {isAdmin ? (
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#159e8a]"
                                        value={editingTask.title}
                                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                        placeholder="Enter activity name..."
                                    />
                                ) : (
                                    <div className="text-slate-900 font-bold text-lg">{editingTask.title}</div>
                                )}
                            </div>

                            {/* DESCRIPTION - ADDED */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                {isAdmin ? (
                                    <textarea
                                        className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#159e8a] min-h-[100px]"
                                        value={editingTask.description || ''}
                                        onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                        placeholder="Add a detailed description..."
                                    />
                                ) : (
                                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
                                        {editingTask.description || 'No description provided.'}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className={`w-full border border-slate-200 rounded-md p-2 text-sm ${!isAdmin ? 'bg-slate-50 text-slate-500' : ''}`}
                                        value={editingTask.startDate.toISOString().split('T')[0]}
                                        onChange={e => setEditingTask({ ...editingTask, startDate: new Date(e.target.value) })}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className={`w-full border border-slate-200 rounded-md p-2 text-sm ${!isAdmin ? 'bg-slate-50 text-slate-500' : ''}`}
                                        value={editingTask.deadline.toISOString().split('T')[0]}
                                        onChange={e => setEditingTask({ ...editingTask, deadline: new Date(e.target.value) })}
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>

                            {/* Color Picker (Admin Only) */}
                            {isAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Activity Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorPalette.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setEditingTask({ ...editingTask, color })}
                                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${editingTask.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* MEMBER STATUS SECTION - ADDED */}
                            {editingTask.id && (
                                <div className="border-t border-slate-100 pt-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Member Progress</label>

                                    <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                        {workspaceMembers.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">No members found</div>
                                        ) : (
                                            <div>
                                                {workspaceMembers.filter(member => {
                                                    // Filter logic:
                                                    // If admin: show everyone
                                                    // If member: show ONLY themselves
                                                    if (isAdmin) return true;
                                                    return (member._id === currentUser?.id || member._id === currentUser?._id || member.id === currentUser?.id);
                                                }).map(member => {
                                                    const statusEntry = (editingTask.memberStatuses || []).find(s => s.userId === (member._id || member.id));
                                                    const currentStatus = statusEntry?.status;
                                                    // Logic for 'isMe' needs to be robust
                                                    // Ensure we match IDs correctly.
                                                    // member._id is from mongo, currentUser might be from localstorage
                                                    const memberId = member._id || member.id;
                                                    const currentUserId = currentUser?.id || currentUser?._id;
                                                    const isMe = memberId === currentUserId;

                                                    // Determine if editable:
                                                    // Admin can edit all.
                                                    // Member can only edit themselves.
                                                    const canEdit = isAdmin || isMe;

                                                    return (
                                                        <div key={memberId} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isMe ? 'bg-teal-500' : 'bg-slate-400'}`}>
                                                                    {(member.name || 'U').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                        {member.name}
                                                                        {isMe && <span className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">You</span>}
                                                                    </div>
                                                                    {statusEntry?.updatedAt && (
                                                                        <div className="text-[10px] text-slate-400">
                                                                            Updated {new Date(statusEntry.updatedAt).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                {canEdit ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            value={currentStatus || ''}
                                                                            onChange={(e) => updateMemberStatus(memberId, e.target.value)}
                                                                            className={`text-xs font-bold rounded-md py-1.5 pl-2 pr-6 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#159e8a] outline-none ${currentStatus === 'Completed' ? 'bg-green-50 text-green-600 ring-green-200' :
                                                                                    currentStatus === 'In Progress' ? 'bg-blue-50 text-blue-600 ring-blue-200' :
                                                                                        'bg-slate-white text-slate-500'
                                                                                }`}
                                                                        >
                                                                            <option value="" disabled>Set Status</option>
                                                                            <option value="To Do">To Do</option>
                                                                            <option value="In Progress">In Progress</option>
                                                                            <option value="Completed">Completed</option>
                                                                        </select>

                                                                        {isAdmin && currentStatus && (
                                                                            <button
                                                                                onClick={() => updateMemberStatus(memberId, 'DELETE')}
                                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                                title="Clear status"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className={`text-xs font-bold px-3 py-1.5 rounded-md ${currentStatus === 'Completed' ? 'bg-green-50 text-green-600' :
                                                                            currentStatus === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                                                currentStatus === 'To Do' ? 'bg-slate-100 text-slate-500' :
                                                                                    'text-slate-300 italic'
                                                                        }`}>
                                                                        {currentStatus || 'No Status'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                            {editingTask.id && isAdmin ? (
                                <button onClick={handleDeleteTask} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50">Delete Activity</button>
                            ) : <div></div>}
                            <div className="flex gap-2">
                                <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-md text-sm font-medium">Cancel</button>
                                <button onClick={handleSaveTask} className="px-3 py-1.5 bg-[#159e8a] text-white rounded-md text-sm font-bold hover:bg-[#118272]">
                                    {isAdmin ? 'Save Changes' : 'Update My Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GanttView;
