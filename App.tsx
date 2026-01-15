import React, { useState } from 'react';   
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import Login from './components/Login';
import HomePage from './components/Homepage';
import { UploadedFile, DocumentAnalysis, AppState, User } from './types';
import { analyzeDocumentWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // History stored by User ID to ensure data isolation
  const [historyMap, setHistoryMap] = useState<Record<string, DocumentAnalysis[]>>({});

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAppState(AppState.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setAppState(AppState.LOGIN);
    setCurrentFile(null);
    setCurrentAnalysis(null);
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // 1. Convert to Base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Raw = e.target?.result as string;
        // Remove data URL prefix
        const base64Data = base64Raw.split(',')[1];
        const mimeType = file.type;

        // 2. Setup UploadedFile object
        const uploadedFile: UploadedFile = {
            file,
            previewUrl: URL.createObjectURL(file),
            base64: base64Data,
            mimeType
        };
        setCurrentFile(uploadedFile);

        // 3. Call Gemini Service
        try {
            const result = await analyzeDocumentWithGemini(base64Data, mimeType);
            
            const analysis: DocumentAnalysis = {
                fileName: file.name,
                fileType: file.type,
                uploadDate: new Date().toISOString(),
                totalScore: result.score,
                issues: result.issues,
                summary: result.summary
            };

            setCurrentAnalysis(analysis);
            
            // Add to history for specific user only
            setHistoryMap(prev => ({
                ...prev,
                [user.id]: [analysis, ...(prev[user.id] || [])]
            }));
            
            setAppState(AppState.ANALYSIS);
        } catch (error) {
            console.error("Analysis error:", error);
            alert("Failed to analyze document. Please ensure your API key is valid and the file is supported.");
        } finally {
            setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      setIsProcessing(false);
    }
  };

  const handleBackToDashboard = () => {
    setAppState(AppState.DASHBOARD);
    setCurrentFile(null);
    setCurrentAnalysis(null);
  };

  // UPDATED: Toggle between Home and Dashboard
  const handleToggleHomeDashboard = () => {
    setAppState(prevState => 
      prevState === AppState.HOME ? AppState.DASHBOARD : AppState.HOME
    );
  };

  // Render logic
  if (appState === AppState.LOGIN || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      {appState === AppState.HOME && (
        <HomePage 
          user={user}
          onBackToDashboard={handleToggleHomeDashboard} // Use the same toggle function
          onLogout={handleLogout}
          isHome={appState === AppState.HOME} // Pass isHome prop for UI state
        />
      )}
      {appState === AppState.DASHBOARD && (
        <Dashboard 
            user={user}
            onFileSelect={handleFileSelect} 
            isProcessing={isProcessing}
            history={historyMap[user.id] || []}
            onLogout={handleLogout}
            onDeleteDocument={(fileName, uploadDate) => {
              // Add delete functionality here if needed
              setHistoryMap(prev => ({
                ...prev,
                [user.id]: (prev[user.id] || []).filter(
                  doc => !(doc.fileName === fileName && doc.uploadDate === uploadDate)
                )
              }));
            }}
            onNavigateHome={handleToggleHomeDashboard} // Use the toggle function
            isHome={appState === AppState.HOME} // Pass isHome prop
        />
      )}
      {appState === AppState.ANALYSIS && currentFile && currentAnalysis && (
        <AnalysisView 
            file={currentFile} 
            analysis={currentAnalysis} 
            onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
};

export default App;

