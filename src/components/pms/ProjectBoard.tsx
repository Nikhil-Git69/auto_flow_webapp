import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../../services/workspaceApi';
import { Plus, MoreVertical, Trash2, Calendar, User } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Review' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    assigneeId?: string;
    startDate?: Date;
    deadline?: Date;
    tags?: string[];
}

interface ProjectBoardProps {
    workspaceId: string;
    isAdmin: boolean;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ workspaceId, isAdmin }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState<string | false>(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const columns = ['To Do', 'In Progress', 'Review', 'Done'];

    useEffect(() => {
        fetchBoard();
    }, [workspaceId]);

    const fetchBoard = async () => {
        try {
            setLoading(true);
            const response = await workspaceApi.getBoard(workspaceId);
            if (response.success && response.data.length > 0) {
                // Assuming one board for now
                setTasks(response.data[0].tasks);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (status: string) => {
        if (!newTaskTitle.trim()) return;
        try {
            const response = await workspaceApi.createTask(workspaceId, {
                title: newTaskTitle,
                status,
                boardId: undefined // backend handles default board
            });
            if (response.success) {
                setTasks([...tasks, response.data]);
                setNewTaskTitle('');
                setIsCreating(false);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus as any } : t
            );
            setTasks(updatedTasks);

            await workspaceApi.updateTask(workspaceId, taskId, { status: newStatus });
        } catch (err: any) {
            setError(err.message);
            fetchBoard(); // Revert on error
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!isAdmin) return; // Guard
        if (!window.confirm('Delete this task?')) return;
        try {
            setTasks(tasks.filter(t => t.id !== taskId));
            await workspaceApi.deleteTask(workspaceId, taskId);
        } catch (err: any) {
            setError(err.message);
            fetchBoard();
        }
    };

    if (loading) return <div className="p-8 text-center">Loading board...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="flex h-full overflow-x-auto gap-4 p-4 bg-gray-50">
            {columns.map(column => (
                <div key={column} className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-700">{column}</h3>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {tasks.filter(t => t.status === column).length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                        {tasks.filter(t => t.status === column).map(task => (
                            <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 flex gap-2 mt-2">
                                    <span className={`px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {task.priority || 'Medium'}
                                    </span>
                                    {task.deadline && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <select
                                    className="mt-3 w-full text-xs border-gray-200 rounded p-1 bg-gray-50 text-gray-600"
                                    value={task.status}
                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                >
                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3">
                        {isAdmin && (
                            <>
                                {isCreating === column ? (
                                    <div className="bg-white p-2 rounded shadow-sm border border-blue-200">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Task title..."
                                            className="w-full text-sm p-1 outline-none mb-2"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateTask(column);
                                                if (e.key === 'Escape') setIsCreating(false);
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCreateTask(column)}
                                                className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => setIsCreating(false)}
                                                className="text-gray-500 text-xs px-2 py-1 hover:text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setIsCreating(column); setNewTaskTitle(''); }}
                                        className="w-full flex items-center gap-2 text-gray-500 hover:bg-gray-200 p-2 rounded text-sm transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add Task
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectBoard;
