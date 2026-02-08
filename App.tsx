import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import Login from './components/Login';
import HomePage from './components/ProfilePage';
import SettingsView from './components/SettingsView';
import Toast, { ToastMessage, ToastType } from './components/Toast'; // Import Toast
import { UploadedFile, DocumentAnalysis, User } from './types';
import { analysisApi } from './services/api';

// Storage keys
const USER_STORAGE_KEY = 'autoflow_user';
const HISTORY_STORAGE_KEY = 'autoflow_history';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]); // Toast State

  // Initialize history from localStorage
  const [historyMap, setHistoryMap] = useState<Record<string, DocumentAnalysis[]>>(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    return savedHistory ? JSON.parse(savedHistory) : {};
  });

  // Helper to add toast
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyMap));
  }, [historyMap]);

  // Redirect to dashboard if logged in and on login page
  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/')) {
      navigate('/dashboard');
    }
  }, [user, location.pathname, navigate]);

  // Redirect to login if not logged in and on protected route
  useEffect(() => {
    const publicRoutes = ['/login', '/signup'];
    if (!user && !publicRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentFile(null);
    setCurrentAnalysis(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Clear history on logout to prevent state leakage across accounts
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistoryMap({}); // Reset local state
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

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
          const userId = user?.id || 'anonymous';

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
              [user.id]: [analysis, ...(prev[user.id] || [])]
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

  const goToSettings = () => navigate('/settings');
  const goToDashboard = () => navigate('/dashboard');

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />
      <Routes>
        {/* Login Route - redirects to dashboard if already logged in */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          user ? (
            <Dashboard
              user={user}
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              history={historyMap[user.id] || []}
              onLogout={handleLogout}
              onDeleteDocument={(fileName, uploadDate) => {
                setHistoryMap(prev => ({
                  ...prev,
                  [user.id]: (prev[user.id] || []).filter(
                    doc => !(doc.fileName === fileName && doc.uploadDate === uploadDate)
                  )
                }));
                addToast('Document deleted from history', 'info');
              }}
              onNavigateHome={goToSettings}
            />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/profile" element={
          user ? (
            <HomePage
              user={user}
              onBackToDashboard={goToDashboard}
              onLogout={handleLogout}
            />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/settings" element={
          user ? (
            <SettingsView
              onBack={goToDashboard}
              onLogout={handleLogout}
            />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/analysis" element={
          user && currentFile && currentAnalysis ? (
            <AnalysisView
              file={currentFile}
              analysis={currentAnalysis}
              onBack={handleBackToDashboard}
            />
          ) : <Navigate to="/dashboard" replace />
        } />

        {/* Default redirect */}
        <Route path="*" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  );
};

export default App;