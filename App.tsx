import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import Login from './components/Login';
import HomePage from './components/ProfilePage';
import SettingsView from './components/SettingsView';
import Toast, { ToastMessage, ToastType } from './components/Toast'; // Import Toast
import { UploadedFile, DocumentAnalysis, User, Workspace } from './types';
import { analysisApi, workspaceApi } from './services/api';
import Sidebar from './components/Sidebar';
import WorkspacePage from './components/WorkspacePage';
import WorkspaceDetailView from './components/WorkspaceDetailView';

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

  // Fetch workspaces and history on load
  useEffect(() => {
    if (user) {
      loadWorkspaces();
      loadHistory();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceApi.getAll();
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
          analysisId: item.analysisId || item._id, // Handle both ID formats
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

  const handleCreateWorkspace = async (name: string, description: string) => {
    if (!user) return;
    try {
      const response = await workspaceApi.create(name, description);
      if (response.success) {
        // Ensure ID mapping
        const newWorkspace = { ...response.data, id: response.data.id || response.data._id };
        setWorkspaces(prev => [newWorkspace, ...prev]);
        addToast('Workspace created!', 'success');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to create workspace', 'error');
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
    addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentFile(null);
    setCurrentAnalysis(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    addToast('Logged out successfully', 'info');
    navigate('/login');
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
    const validateSession = async () => {
      const publicRoutes = ['/login', '/signup'];
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
        const currentUser = await import('./services/authService').then(m => m.getCurrentUser());
        if (currentUser) {
          console.log("✅ Session validated for user:", currentUser.email, 'on path:', currentPath);
          // Store user in localStorage
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
          setUser(currentUser);

          // CRITICAL: Don't navigate away from the current path!
          // The routes will handle rendering the correct component
          console.log('✨ Staying on current path after session validation:', currentPath);
        } else {
          console.log("⚠️ Session invalid or expired");
          // Clear user if session is invalid
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


  const handleFileSelect = async (file: File) => {
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

          const response = await analysisApi.uploadFile(file, userId);

          if (response.success && response.data) {
            const apiData = response.data;

            // Map backend response to frontend types
            const analysis: DocumentAnalysis = {
              analysisId: apiData.analysisId,
              fileName: apiData.fileName,
              fileType: apiData.fileType,
              uploadDate: apiData.analyzedAt || new Date().toISOString(),
              totalScore: apiData.totalScore, // Should be 100 if auto-corrected
              issues: apiData.issues || [],
              summary: apiData.summary,
              processedContent: apiData.processedContent,
              correctedContent: apiData.correctedContent, // NEW
              correctedPdfBase64: apiData.correctedPdfBase64 // NEW
            };

            setCurrentAnalysis(analysis);
            setHistoryMap(prev => ({
              ...prev,
              [userId]: [analysis, ...(prev[userId] || [])]
            }));
            addToast('Document analyzed successfully!', 'success');
            navigate('/analysis');
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

  const isPublicRoute = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="font-sans text-slate-900 bg-slate-50 h-screen overflow-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex h-full">
        {user && !isPublicRoute && (
          <Sidebar
            currentPath={location.pathname}
            onNavigate={(path) => navigate(path)}
            onLogout={handleLogout}
          />
        )}

        <div className="flex-1 h-full overflow-hidden">
          <Routes>
            {/* Login Route - redirects to dashboard if already logged in */}
            <Route path="/login" element={
              isSessionLoading ? null : (user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />)
            } />
            <Route path="/signup" element={
              isSessionLoading ? null : (user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />)
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
                  onDeleteDocument={(fileName, uploadDate) => {
                    const userId = user._id || user.id;
                    setHistoryMap(prev => ({
                      ...prev,
                      [userId]: (prev[userId] || []).filter(
                        doc => !(doc.fileName === fileName && doc.uploadDate === uploadDate)
                      )
                    }));
                    addToast('Document deleted from history', 'info');
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
                  onBack={goToDashboard}
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
                />
              ) : <Navigate to="/login" replace />
            } />

            {/* Default redirect */}
            <Route path="*" element={
              isSessionLoading ? (
                <div className="flex items-center justify-center h-screen"><div className="text-slate-400">Loading...</div></div>
              ) : user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
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
}> = ({ user, onBack, onUploadFile, onDeleteDocument, onKickMember }) => {
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
    />
  );
};

export default App;