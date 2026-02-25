import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layout, Calendar } from 'lucide-react'; // Added icons
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import HomePage from './components/ProfilePage';
import SettingsView from './components/SettingsView';
import Toast, { ToastMessage, ToastType } from './components/Toast'; // Import Toast
import { UploadedFile, DocumentAnalysis, User, Workspace } from './types';
import { analysisApi, workspaceApi } from './services/api';
import { logout as authLogout, getCurrentUser } from './services/authService';
import Sidebar from './components/Sidebar';
import WorkspacePage from './components/WorkspacePage';
import WorkspaceDetailView from './components/WorkspaceDetailView';
import ProjectBoard from './components/pms/ProjectBoard';
import GanttView from './components/pms/GanttView';
import ConceptAnalysisView from './components/ConceptAnalysisView';
import ReportAnalysisView from './components/ReportAnalysisView';

// Storage keys
const USER_STORAGE_KEY = 'autoflow_user';
const HISTORY_STORAGE_KEY = 'autoflow_history';


const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Add session loading state
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    // Initialize user state as null - don't auto-restore from localStorage
    // Session validation will handle restoration only when appropriate
    const [user, setUser] = useState<User | null>(null);

    const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
    const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]); // Toast State

    // Initialize history from localStorage
    const [historyMap, setHistoryMap] = useState<Record<string, DocumentAnalysis[]>>(() => {
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        return savedHistory ? JSON.parse(savedHistory) : {};
    });

    // NEW: Initialize workspaces from localStorage with migration for access codes
    // Initialize workspaces from API
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [workspaceView, setWorkspaceView] = useState<'active' | 'archived'>('active');

    // Fetch workspaces and history on load
    useEffect(() => {
        if (user) {
            loadWorkspaces(workspaceView === 'archived');
            loadHistory();
        }
    }, [user, workspaceView]);

    const loadWorkspaces = async (archived: boolean = false) => {
        try {
            const response = await workspaceApi.getAll(archived);
            if (response.success) {
                // Ensure id property exists for frontend compatibility
                const mappedWorkspaces = response.data.map((ws: any) => ({
                    ...ws,
                    id: ws.id || ws._id
                }));
                setWorkspaces(mappedWorkspaces);
            }
        } catch (error) {
            console.error("Failed to load workspaces:", error);
        }
    };

    const loadHistory = async () => {
        if (!user) return;
        const userId = user.id || user._id; // Handle both ID formats
        if (!userId) {
            console.error("❌ loadHistory: No valid userId found on user object:", user);
            return;
        }

        console.log(`🔄 Loading history for user: ${userId}`);
        try {
            const response = await analysisApi.getAll({ userId });

            // Handle both { success: true, data: [...] } and raw [...] responses for backward compatibility
            const historyData = response.data || (Array.isArray(response) ? response : []);

            if (historyData) {
                // Map backend analysis to frontend DocumentAnalysis type
                const historyDocs: DocumentAnalysis[] = historyData.map((item: any) => ({
                    analysisId: item.analysisId || item._id,
                    fileName: item.fileName,
                    fileType: item.fileType,
                    uploadDate: item.analyzedAt || item.uploadDate || new Date().toISOString(),
                    totalScore: item.score,
                    issues: item.issues || [],
                    summary: item.summary,
                    processedContent: item.processedContent,
                    correctedContent: item.correctedContent,
                    correctedPdfBase64: item.correctedPdfBase64,
                    status: item.status,
                    formatType: item.formatType,
                    formatRequirements: item.formatRequirements,
                    metadata: item.metadata
                }));

                setHistoryMap(prev => ({
                    ...prev,
                    [userId]: historyDocs
                }));
                console.log(`✅ Loaded ${historyDocs.length} history items for user ${userId}`);
            }
        } catch (error) {
            console.error("Failed to load history:", error);
            // Fallback to local storage if API fails
        }
    };



    // Helper to add toast
    const addToast = (message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const handleCreateWorkspace = async (name: string, description: string, category: string = 'General') => {
        if (!user) return;
        try {
            const response = await workspaceApi.create(name, description, category);
            if (response.success) {
                const newWorkspace = { ...response.data, id: response.data.id || response.data._id };
                setWorkspaces(prev => [newWorkspace, ...prev]);
                addToast('Workspace created!', 'success');
            }
        } catch (error: any) {
            if (error.limitReached) {
                setShowUpgradeModal(true);
            } else {
                addToast(error.message || 'Failed to create workspace', 'error');
            }
        }
    };

    const handleJoinWorkspace = async (code: string) => {
        if (!user) return;
        try {
            const response = await workspaceApi.join(code);
            if (response.success) {
                // Ensure ID mapping
                const joinedWorkspace = { ...response.data, id: response.data.id || response.data._id };
                setWorkspaces(prev => [joinedWorkspace, ...prev]);
                addToast('Successfully joined workspace!', 'success');
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to join workspace', 'error');
        }
    };

    const handleDeleteWorkspace = async (id: string) => {
        try {
            await workspaceApi.delete(id);
            setWorkspaces(prev => prev.filter(ws => ws.id !== id));
            addToast('Workspace deleted', 'info');
        } catch (error: any) {
            addToast(error.message || 'Failed to delete workspace', 'error');
        }
    };

    const handleArchiveWorkspace = async (id: string) => {
        try {
            await workspaceApi.archive(id);
            // If we are in active view, remove it. If we are in archived view (shouldn't happen for archive call), remove it too.
            setWorkspaces(prev => prev.filter(ws => (ws.id || ws._id) !== id));
            addToast('Workspace archived', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to archive workspace', 'error');
        }
    };

    const handleUnarchiveWorkspace = async (id: string) => {
        try {
            await workspaceApi.unarchive(id);
            setWorkspaces(prev => prev.filter(ws => (ws.id || ws._id) !== id));
            addToast('Workspace unarchived', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to unarchive workspace', 'error');
        }
    };





    // Redirect logic is now handled by React Router's <Navigate> components in routes
    // This prevents race conditions during session validation on page refresh
    // The routes themselves will redirect if user is not authenticated
    /*
    useEffect(() => {
      const publicRoutes = ['/login', '/signup'];
      console.log('🔄 Redirect useEffect - isSessionLoading:', isSessionLoading, 'user:', !!user, 'path:', location.pathname);
      if (!isSessionLoading && !user && !publicRoutes.includes(location.pathname)) {
        console.log('🚀 Redirecting to /login from:', location.pathname);
        navigate('/login');
      }
    }, [user, location.pathname, navigate, isSessionLoading]);
    */


    const handleLoginSuccess = (loggedInUser: User) => {
        console.log("🔐 Login successful, user:", loggedInUser);
        // Store user in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        addToast(`Welcome, ${loggedInUser.name}!`, 'success');
        navigate('/dashboard');
    };

    const handleLogout = (message?: string | React.MouseEvent, type: 'success' | 'info' | 'error' = 'info') => {
        // Prevent event from being treated as message
        const actualMessage = typeof message === 'string' ? message : undefined;
        const actualType = typeof message === 'string' ? type : 'info';

        console.log("🚪 handleLogout called via:", typeof message === 'string' ? 'Manual/Delete' : 'Button Click');

        // 1. Clear tokens and storage
        authLogout();
        localStorage.removeItem(USER_STORAGE_KEY);

        // 2. Persist toast for after the "Automated Refresh"
        const logoutToast = {
            id: Date.now().toString(),
            message: actualMessage || 'Logged out successfully',
            type: actualType
        };
        localStorage.setItem('pending_logout_toast', JSON.stringify(logoutToast));

        // 3. Force a full page reload to the login page
        // This is the "hard refresh" the user confirmed resolved the blank screen.
        window.location.href = '/login';
    };

    // Track current route in localStorage for refresh preservation
    useEffect(() => {
        const publicRoutes = ['/login', '/signup'];
        if (!publicRoutes.includes(location.pathname)) {
            localStorage.setItem('lastRoutePath', location.pathname);
            console.log('📌 Saved route for refresh:', location.pathname);
        }
    }, [location.pathname]);

    // Validate session on mount ONLY - not on pathname changes
    // This prevents re-validation loops during navigation
    useEffect(() => {
        // Check for pending logout toast
        const pendingToastStr = localStorage.getItem('pending_logout_toast');
        if (pendingToastStr) {
            try {
                const toast = JSON.parse(pendingToastStr);
                addToast(toast.message, toast.type);
            } catch (e) {
                console.error("Failed to parse pending toast", e);
            }
            localStorage.removeItem('pending_logout_toast');
        }

        const validateSession = async () => {
            const publicRoutes = ['/', '/login', '/signup', '/landingpage', '/landing'];
            const currentPath = location.pathname; // Capture current path at mount time
            const isPublicRoute = publicRoutes.includes(currentPath);
            console.log('🔍 Session validation starting - path:', currentPath, 'isPublic:', isPublicRoute);

            // If on public route, don't auto-restore session
            if (isPublicRoute) {
                console.log("📍 On public route, skipping auto-login");
                setIsSessionLoading(false);
                return;
            }

            // Only validate and restore session for protected routes
            try {
                const currentUserData = await getCurrentUser();
                if (currentUserData) {
                    console.log("✅ Session validated for user:", currentUserData.email, 'on path:', currentPath);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUserData));
                    setUser(currentUserData);
                } else {
                    console.log("⚠️ Session invalid or expired");
                    setUser(null);
                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            } catch (error) {
                console.error("Session validation failed:", error);
                setUser(null);
                localStorage.removeItem(USER_STORAGE_KEY);
            } finally {
                // Mark session validation as complete
                console.log('🏁 Session validation complete - isSessionLoading set to false');
                setIsSessionLoading(false);
            }
        };
        validateSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONLY on mount - empty dependency array!


    const handleFileSelect = async (file: File, formatType: string = 'default', templateFile: File | undefined = undefined, formatRequirements: string = '') => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Raw = e.target?.result as string;
                const base64Data = base64Raw.split(',')[1];
                const mimeType = file.type;

                const uploadedFile: UploadedFile = {
                    file,
                    previewUrl: URL.createObjectURL(file), // Keep local preview for now
                    base64: base64Data,
                    mimeType
                };
                setCurrentFile(uploadedFile);

                try {
                    // CALL BACKEND API INSTEAD OF LOCAL GEMINI SERVICE
                    // Ensure we have a user ID
                    // CRITICAL FIX: Use _id if id is missing to ensure link
                    const userId = user.id || user._id;

                    if (!userId) {
                        throw new Error("User ID missing. Please log in again.");
                    }

                    const response = await analysisApi.uploadFile(file, userId, formatType, templateFile, formatRequirements);

                    if (response.success && response.data) {
                        const apiData = response.data;

                        // Map backend response to frontend types
                        const analysis: DocumentAnalysis = {
                            analysisId: apiData.analysisId,
                            fileName: apiData.fileName,
                            fileType: apiData.fileType,
                            uploadDate: apiData.analyzedAt || new Date().toISOString(),
                            totalScore: apiData.totalScore,
                            issues: apiData.issues || [],
                            summary: apiData.summary,
                            processedContent: apiData.processedContent,
                            correctedContent: apiData.correctedContent,
                            correctedPdfBase64: apiData.correctedPdfBase64,
                            formatType: apiData.formatType,
                            formatRequirements: apiData.formatRequirements,
                            metadata: apiData.metadata
                        };

                        setCurrentAnalysis(analysis);
                        setHistoryMap(prev => ({
                            ...prev,
                            [userId]: [analysis, ...(prev[userId] || [])]
                        }));
                        addToast('Document analyzed successfully!', 'success');

                        // REDIRECT BASED ON FORMAT TYPE
                        if (formatType === 'concept') {
                            navigate(`/concept-analysis/${analysis.analysisId}`);
                        } else if (formatType === 'report') {
                            navigate(`/report-analysis/${analysis.analysisId}`);
                        } else {
                            navigate('/analysis');
                        }
                    } else {
                        throw new Error(response.error || "Analysis failed");
                    }
                } catch (error: any) {
                    console.error("Analysis error:", error);
                    addToast(`Failed to analyze document: ${error.message || 'Unknown error'}`, 'error');
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("File reading error:", error);
            addToast('Error reading file', 'error');
            setIsProcessing(false);
        }
    };

    const handleBackToDashboard = () => {
        setCurrentFile(null);
        setCurrentAnalysis(null);
        navigate('/dashboard');
    };



    const handleWorkspaceFileUpload = async (file: File, workspaceId: string) => {
        if (!user) return;
        setIsProcessing(true);
        addToast(`Analysing collaborative upload...`, 'info');

        try {
            // 1. Upload and analyze file first
            const response = await analysisApi.uploadFile(file, user.id);

            if (response.success && response.data) {
                const apiData = response.data;
                const analysis: DocumentAnalysis = {
                    analysisId: apiData.analysisId,
                    fileName: apiData.fileName,
                    fileType: apiData.fileType,
                    uploadDate: apiData.analyzedAt || new Date().toISOString(),
                    totalScore: apiData.totalScore,
                    issues: apiData.issues || [],
                    summary: apiData.summary,
                    processedContent: apiData.processedContent,
                    correctedContent: apiData.correctedContent,
                    correctedPdfBase64: apiData.correctedPdfBase64
                };

                // 2. Add to workspace in backend
                const wsResponse = await workspaceApi.addDocument(workspaceId, analysis);

                if (wsResponse.success) {
                    // Update local state with latest workspace data from backend
                    setWorkspaces(prev => prev.map(ws =>
                        ws.id === workspaceId ? wsResponse.data : ws
                    ));
                    addToast('Document added to workspace!', 'success');
                } else {
                    throw new Error(wsResponse.error || "Failed to link document to workspace");
                }
            } else {
                throw new Error(response.error || "Analysis failed");
            }
        } catch (error: any) {
            console.error("Workspace upload error:", error);
            addToast(`Failed to upload to workspace: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteWorkspaceDocument = async (workspaceId: string, fileName: string, uploadDate: string) => {
        // Note: We need analysisId to delete from backend. 
        // Finding the document to get its ID is efficient enough here.
        const workspace = workspaces.find(w => w.id === workspaceId);
        const doc = workspace?.documents?.find(d => d.fileName === fileName && d.uploadDate === uploadDate);

        if (!doc || !doc.analysisId) {
            // Fallback or error if we can't find ID (should not happen with new data)
            console.error("Could not find analysisId for deletion");
            addToast("Error: Could not identify document to delete", "error");
            return;
        }

        try {
            const response = await workspaceApi.removeDocument(workspaceId, doc.analysisId);
            if (response.success) {
                setWorkspaces(prev => prev.map(ws =>
                    ws.id === workspaceId ? response.data : ws
                ));
                addToast('Document removed from workspace', 'info');
            }
        } catch (error: any) {
            console.error("Failed to remove document:", error);
            addToast(error.message || "Failed to remove document", "error");
        }
    };

    const handleAddToWorkspace = async (document: DocumentAnalysis, workspaceId: string) => {
        try {
            const response = await workspaceApi.addDocument(workspaceId, document);
            if (response.success) {
                setWorkspaces(prev => prev.map(ws =>
                    ws.id === workspaceId ? response.data : ws
                ));
                addToast('Document added to workspace successfully', 'success');
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to add document to workspace', 'error');
        }
    };

    const handleViewAnalysis = (doc: DocumentAnalysis) => {
        setCurrentAnalysis(doc);
        // Create a dummy uploaded file object to satisfy AnalysisView props
        // AnalysisView mostly uses 'analysis' prop, but might need file for preview if available.
        // If we only have analysis data, we might need to adjust AnalysisView or provide dummy file.
        // The current backend persistence saves 'fileData' (Buffer) but the frontend fetch doesn't retrieve it blindly to save bandwidth.
        // If we want preview, we might need to fetch the file blob. 
        // For now, let's set a dummy file and rely on analysis data.
        const dummyFile: UploadedFile = {
            file: new File([""], doc.fileName, { type: doc.fileType }),
            previewUrl: "", // No preview available from just history unless we fetch blob
            base64: "",
            mimeType: doc.fileType
        };
        setCurrentFile(dummyFile);
        navigate('/analysis');
    };

    const goToSettings = () => navigate('/settings');
    const goToProfile = () => navigate('/profile');
    const goToDashboard = () => navigate('/dashboard');

    const handleKickWorkspaceMember = async (workspaceId: string, memberId: string) => {
        try {
            await workspaceApi.removeMember(workspaceId, memberId);
            addToast('Member removed successfully', 'success');
            // Workspace will auto-refresh via WorkspaceDetailWrapper
        } catch (error: any) {
            console.error('Error removing member:', error);
            addToast(`Failed to remove member: ${error.message}`, 'error');
        }
    };

    const isPublicRoute = ['/', '/login', '/signup', '/landingpage', '/landing'].includes(location.pathname);

    return (
        <div className={`font-sans text-slate-900 ${isPublicRoute ? 'bg-white' : 'bg-slate-50 h-screen overflow-hidden'}`}>
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className={isPublicRoute ? '' : 'flex h-full'}>
                {user && !isPublicRoute && (
                    <Sidebar
                        currentPath={location.pathname}
                        onNavigate={(path) => navigate(path)}
                        onLogout={handleLogout}
                    />
                )}

                <div className={isPublicRoute ? '' : 'flex-1 h-full overflow-hidden'}>
                    <Routes>
                        {/* Login Route - redirects to dashboard if already logged in */}
                        <Route path="/login" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen bg-white">
                                    <div className="w-8 h-8 border-4 border-[#159e8a] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />)
                        } />
                        <Route path="/signup" element={
                            isSessionLoading ? null : (user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />)
                        } />
                        {/* Email verification route - always accessible */}
                        <Route path="/verify-email" element={
                            <VerifyEmail onLoginSuccess={handleLoginSuccess} />
                        } />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <Dashboard
                                    user={user}
                                    workspaces={workspaces}
                                    onFileSelect={handleFileSelect}
                                    onAddToWorkspace={handleAddToWorkspace}
                                    isProcessing={isProcessing}
                                    history={historyMap[user._id || user.id] || []}
                                    onLogout={handleLogout}
                                    onDeleteDocument={async (fileName, uploadDate) => {
                                        const userId = user._id || user.id;
                                        try {
                                            // Find the document in history to get its analysisId
                                            const userHistory = historyMap[userId] || [];
                                            const document = userHistory.find(
                                                doc => doc.fileName === fileName && doc.uploadDate === uploadDate
                                            );

                                            if (!document || !document.analysisId) {
                                                throw new Error('Document not found or missing analysisId');
                                            }

                                            // Delete from backend using the correct method
                                            await analysisApi.delete(document.analysisId);

                                            // Reload history from backend to ensure sync
                                            await loadHistory();

                                            addToast('Document deleted from history', 'success');
                                        } catch (error: any) {
                                            console.error('Failed to delete analysis:', error);
                                            addToast('Failed to delete document', 'error');
                                        }
                                    }}
                                />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/profile" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <HomePage
                                    user={user}
                                    onBackToDashboard={goToDashboard}
                                    onLogout={handleLogout}
                                />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/settings" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <SettingsView
                                    user={user}
                                    onLogout={handleLogout}
                                />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/analysis" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : (user && currentFile && currentAnalysis) ? (
                                <AnalysisView
                                    file={currentFile}
                                    analysis={currentAnalysis}
                                    onBack={handleBackToDashboard}
                                />
                            ) : <Navigate to="/dashboard" replace />
                        } />

                        <Route path="/workspace" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <WorkspacePage
                                    workspaces={workspaces}
                                    onCreateWorkspace={handleCreateWorkspace}
                                    onDeleteWorkspace={handleDeleteWorkspace}
                                    onOpenWorkspace={(id) => navigate(`/workspace/${id}`)}
                                    onJoinWorkspace={handleJoinWorkspace}
                                    showUpgradeModal={showUpgradeModal}
                                    onCloseUpgradeModal={() => setShowUpgradeModal(false)}
                                    onWorkspaceUpdated={(ws) => {
                                        setWorkspaces(prev => prev.map(w => (w.id || w._id) === (ws.id || ws._id) ? { ...ws, id: ws.id || ws._id } : w));
                                    }}
                                    onArchiveWorkspace={handleArchiveWorkspace}
                                    onUnarchiveWorkspace={handleUnarchiveWorkspace}
                                    currentView={workspaceView}
                                    onViewChange={(view) => setWorkspaceView(view)}
                                />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/workspace/:workspaceId" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <WorkspaceDetailWrapper
                                    user={user}
                                    onBack={() => navigate('/workspace')}
                                    onUploadFile={handleWorkspaceFileUpload}
                                    onDeleteDocument={handleDeleteWorkspaceDocument}
                                    onKickMember={handleKickWorkspaceMember}
                                    onPromoteToCoAdmin={async (wsId, memberId) => {
                                        try {
                                            await workspaceApi.promoteToCoAdmin(wsId, memberId);
                                            addToast('Member promoted to Co-Admin', 'success');
                                            // Workspace Details will auto-refresh via Wrapper
                                        } catch (error: any) {
                                            console.error('Error promoting member:', error);
                                            addToast(`Failed to promote member: ${error.message}`, 'error');
                                        }
                                    }}
                                    onDemoteToMember={async (wsId, memberId) => {
                                        try {
                                            await workspaceApi.demoteToMember(wsId, memberId);
                                            addToast('Co-Admin demoted to Member', 'success');
                                        } catch (error: any) {
                                            console.error('Error demoting member:', error);
                                            addToast(`Failed to demote member: ${error.message}`, 'error');
                                        }
                                    }}
                                />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/workspace/:workspaceId/board" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <WorkspacePMSWrapper component={ProjectBoard} user={user} />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/workspace/:workspaceId/gantt" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <WorkspacePMSWrapper component={GanttView} user={user} />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/concept-analysis/:id" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <ConceptAnalysisView />
                            ) : <Navigate to="/login" replace />
                        } />

                        <Route path="/report-analysis/:id" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? (
                                <ReportAnalysisView />
                            ) : <Navigate to="/login" replace />
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/landingpage" element={<LandingPage />} />
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="*" element={
                            isSessionLoading ? (
                                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
                            ) : user ? <Navigate to="/dashboard" replace /> : <LandingPage />
                        } />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Helper component to extract params and fetch workspace with populated members
const WorkspaceDetailWrapper: React.FC<{
    user: User;
    onBack: () => void;
    onUploadFile: (file: File, wsId: string) => void;
    onDeleteDocument: (wsId: string, fileName: string, uploadDate: string) => void;
    onKickMember: (wsId: string, memberId: string) => void;
    onPromoteToCoAdmin?: (wsId: string, memberId: string) => void;
    onDemoteToMember?: (wsId: string, memberId: string) => void;
}> = ({ user, onBack, onUploadFile, onDeleteDocument, onKickMember, onPromoteToCoAdmin, onDemoteToMember }) => {
    const { workspaceId } = useParams();
    const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchWorkspace = async () => {
            if (!workspaceId) return;
            try {
                const response = await workspaceApi.getById(workspaceId);
                if (response.success) {
                    setWorkspace(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch workspace:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [workspaceId]);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading workspace...</div></div>;
    if (!workspace) return <Navigate to="/workspace" replace />;

    return (
        <WorkspaceDetailView
            workspace={workspace}
            currentUser={user}
            onBack={onBack}
            onUploadFile={(file) => onUploadFile(file, workspace.id || workspace._id)}
            onDeleteDocument={(fileName, uploadDate) => onDeleteDocument(workspace.id || workspace._id, fileName, uploadDate)}
            onKickMember={(memberId) => {
                onKickMember(workspace.id || workspace._id, memberId);
                // Refresh workspace after kicking member
                workspaceApi.getById(workspace.id || workspace._id).then(res => {
                    if (res.success) setWorkspace(res.data);
                });
            }}
            onPromoteToCoAdmin={(memberId) => {
                if (onPromoteToCoAdmin) {
                    onPromoteToCoAdmin(workspace.id || workspace._id, memberId);
                    // Refresh workspace
                    workspaceApi.getById(workspace.id || workspace._id).then(res => {
                        if (res.success) setWorkspace(res.data);
                    });
                }
            }}
            onDemoteToMember={(memberId) => {
                if (onDemoteToMember) {
                    onDemoteToMember(workspace.id || workspace._id, memberId);
                    // Refresh workspace
                    workspaceApi.getById(workspace.id || workspace._id).then(res => {
                        if (res.success) setWorkspace(res.data);
                    });
                }
            }}
        />
    );
};

export default App;

// Helper for PMS routes (Board/Gantt)
const WorkspacePMSWrapper: React.FC<{
    component: React.FC<any>;
    user: User;
}> = ({ component: Component, user }) => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchWorkspace = async () => {
            if (!workspaceId) return;
            try {
                const response = await workspaceApi.getById(workspaceId);
                if (response.success) {
                    setWorkspace(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch workspace:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [workspaceId]);

    if (!workspaceId) return <Navigate to="/workspace" replace />;
    if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading workspace...</div></div>;
    if (!workspace) return <Navigate to="/workspace" replace />;

    const isOwner = user.id === workspace.ownerId || user._id === workspace.ownerId || user.id === workspace.ownerId?.toString();
    const isCoAdmin = workspace.coAdmins?.includes(user.id) || workspace.coAdmins?.includes(user._id || '');
    const isAdmin = isOwner || isCoAdmin;

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Simple Header for PMS views */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/workspace/${workspaceId}`)}
                        className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Workspace
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <h1 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-[#159e8a]" />
                        Project Timeline
                    </h1>
                </div>

                {/* Navigation Tabs (Quick Switch) */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => navigate(`/workspace/${workspaceId}`)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => navigate(`/workspace/${workspaceId}/gantt`)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${window.location.pathname.includes('/gantt') ? 'bg-white shadow text-[#159e8a]' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Timeline
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-slate-50">
                <Component workspaceId={workspaceId} isAdmin={isAdmin} />
            </div>
        </div>
    );
};