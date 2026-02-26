// services/documentStorageService.ts
import { Issue } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const API_BASE_URL = 'https://auto-flow-backend.onrender.com';


export interface SaveDocumentRequest {
  userId: string;
  originalAnalysisId?: string;
  fileName: string;
  fileContent: string; // Base64
  mimeType: string;
  fixesApplied: number;
  issuesFixed: Issue[];
}

export interface SaveDocumentResponse {
  success: boolean;
  message: string;
  documentId?: string;
  downloadUrl?: string;
}

export interface UserDocument {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fixesApplied: number;
  uploadedAt: string;
  downloadUrl: string;
}

// Save corrected document to backend/MongoDB
export const saveCorrectedDocument = async (
  data: SaveDocumentRequest
): Promise<SaveDocumentResponse> => {
  try {
    // Convert base64 to Blob for upload
    const byteCharacters = atob(data.fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: data.mimeType });

    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, data.fileName);
    formData.append('userId', data.userId);
    formData.append('originalAnalysisId', data.originalAnalysisId || '');
    formData.append('fixesApplied', data.fixesApplied.toString());
    formData.append('issuesFixed', JSON.stringify(data.issuesFixed));

    const response = await fetch(`${API_BASE_URL}/documents/save-corrected`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save document');
    }

    return result;

  } catch (error) {
    console.error('Error saving document:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save document'
    };
  }
};

// Get user's saved documents
export const getUserDocuments = async (userId: string): Promise<UserDocument[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/user/${userId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch documents');
    }

    return result.documents.map((doc: any) => ({
      ...doc,
      downloadUrl: `${API_BASE_URL}/documents/download/${doc._id}`
    }));

  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Download document from backend
export const downloadDocument = async (documentId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/download/${documentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return await response.blob();

  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};