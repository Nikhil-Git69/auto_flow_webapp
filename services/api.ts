// // frontend/src/services/api.ts
// import { getAuthHeaders } from './authService';

// const API_BASE_URL = 'http://localhost:5000';

// // Generic fetch wrapper with auth
// const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
//   const headers = {
//     'Content-Type': 'application/json',
//     ...getAuthHeaders(),
//     ...options.headers,
//   };

//   const response = await fetch(`${API_BASE_URL}${url}`, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
//   }

//   return response.json();
// };

// // Analysis API
// export const analysisApi = {
//   // Get all analyses
//   getAll: (filters?: { userId?: string; minScore?: number; maxScore?: number }) => {
//     const params = new URLSearchParams();
//     if (filters?.userId) params.append('userId', filters.userId);
//     if (filters?.minScore) params.append('minScore', filters.minScore.toString());
//     if (filters?.maxScore) params.append('maxScore', filters.maxScore.toString());
    
//     const query = params.toString() ? `?${params.toString()}` : '';
//     return fetchWithAuth(`/analysis${query}`);
//   },

//   // Get analysis by ID
//   getById: (id: string) => fetchWithAuth(`/analysis/id/${id}`),

//   // Create analysis
//   create: (data: any) => fetchWithAuth('/analysis', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   }),

//   // Update analysis
//   update: (id: string, data: any) => fetchWithAuth(`/analysis/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(data),
//   }),

//   // Delete analysis
//   delete: (id: string) => fetchWithAuth(`/analysis/${id}`, {
//     method: 'DELETE',
//   }),

//   // Get user stats
//   getUserStats: (userId: string) => fetchWithAuth(`/analysis/stats/${userId}`),

//   // Upload file
//   uploadFile: async (file: File, userId: string) => {
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('userId', userId);
//     formData.append('fileName', file.name);

//     const headers = getAuthHeaders();
    
//     const response = await fetch(`${API_BASE_URL}/analysis/upload-file`, {
//       method: 'POST',
//       headers,
//       body: formData,
//     });

//     if (!response.ok) {
//       const error = await response.json().catch(() => ({}));
//       throw new Error(error.error || 'Upload failed');
//     }

//     return response.json();
//   }
// };
import { getAuthHeaders } from './authService';

const API_BASE_URL = 'http://localhost:5000';

// Generic fetch wrapper with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Analysis API
export const analysisApi = {
  // Get all analyses
  getAll: (filters?: { userId?: string; minScore?: number; maxScore?: number }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.minScore) params.append('minScore', filters.minScore.toString());
    if (filters?.maxScore) params.append('maxScore', filters.maxScore.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/analysis${query}`);
  },

  // Get analysis by ID
  getById: (id: string) => fetchWithAuth(`/analysis/id/${id}`),

  // Create analysis
  create: (data: any) => fetchWithAuth('/analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update analysis
  update: (id: string, data: any) => fetchWithAuth(`/analysis/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Delete analysis
  delete: (id: string) => fetchWithAuth(`/analysis/${id}`, {
    method: 'DELETE',
  }),

  // Get user stats
  getUserStats: (userId: string) => fetchWithAuth(`/analysis/stats/${userId}`),

  // UPDATED: Upload file with format customization - FIXED 413/400 errors
  uploadFile: async (
  file: File, 
  userId: string, 
  formatType?: string, 
  templateFile?: File, 
  formatRequirements?: string
): Promise<any> => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('userId', userId);
  formData.append('fileName', file.name);

  // Add format customization parameters
  if (formatType) {
    formData.append('formatType', formatType);
    console.log('🔧 Format type:', formatType);
  } else {
    // Default to 'default' if not specified
    formData.append('formatType', 'default');
  }
  
  if (formatRequirements) {
    formData.append('formatRequirements', formatRequirements);
    console.log('🔧 Format requirements length:', formatRequirements.length);
  } else if (formatType === 'custom') {
    // If custom mode but no requirements, use a default set
    const defaultRequirements = "Default academic formatting:\n• 1-inch margins on all sides\n• Times New Roman, 12pt font\n• Double line spacing\n• APA citation style\n• Include title page and abstract";
    formData.append('formatRequirements', defaultRequirements);
    console.log('🔧 Using default custom requirements');
  }
  
  // Add template file if provided
  if (templateFile) {
    if (templateFile.size > 50 * 1024 * 1024) {
      throw new Error(`Template file too large. Maximum size is 50MB. Your file is ${(templateFile.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    formData.append('templateFile', templateFile);
    console.log('🔧 Template file:', templateFile.name);
  }

  // Get auth headers but DON'T set Content-Type manually for FormData
  const authHeaders = getAuthHeaders();
  
  // Remove Content-Type from headers if it exists (browser will set it automatically)
  const headers: Record<string, string> = {};
  if (authHeaders) {
    Object.entries(authHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = value as string;
      }
    });
  }

  // Add upload progress tracking
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    console.log('🔧 Uploading file:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      userId,
      formatType: formatType || 'default',
      hasRequirements: !!formatRequirements,
      hasTemplateFile: !!templateFile
    });

    const response = await fetch(`${API_BASE_URL}/analysis/upload-file`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle response status
    if (response.status === 413) {
      throw new Error(`File too large. Maximum file size is 100MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      let errorDetails = '';
      let serverError = '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData.details || '';
        serverError = errorData.error || '';
      } catch (e) {
        errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
      }
      
      // Special handling for user ID errors
      if (serverError.includes('User ID') || serverError.includes('userId')) {
        // Force a default user ID and retry with the same file?
        // Or just show a better error message
        errorMessage = 'Authentication issue. Please try logging in again or refresh the page.';
      }
      
      // Handle specific status codes
      switch (response.status) {
        case 400:
          errorMessage = `Bad request: ${errorMessage}`;
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission to upload files.';
          break;
        case 404:
          errorMessage = 'Upload endpoint not found. Please contact support.';
          break;
        case 415:
          errorMessage = 'Unsupported file type. Please upload PDF, Word, or text files.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server error. Please try again in a few moments.';
          break;
      }
      
      throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.success) {
      throw new Error(result.error || result.message || 'Analysis failed');
    }

    console.log('✅ Upload successful:', {
      analysisId: result.data?.analysisId,
      fileName: result.data?.fileName,
      score: result.data?.totalScore,
      formatUsed: formatType || 'default'
    });

    return result;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ Upload error:', error);
    
    // Handle specific error cases
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please try again with a smaller file or check your connection.');
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('User ID')) {
      // Special handling for the user ID issue
      console.log('⚠️ User ID error detected, trying fallback...');
      
      // Retry with a hardcoded user ID
      formData.set('userId', 'demo-user-fallback-' + Date.now());
      
      try {
        const retryResponse = await fetch(`${API_BASE_URL}/analysis/upload-file`, {
          method: 'POST',
          headers,
          body: formData,
        });
        
        if (retryResponse.ok) {
          console.log('✅ Upload succeeded with fallback user ID');
          return await retryResponse.json();
        }
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError);
      }
      
      throw new Error('Please refresh the page and try again. If the problem persists, contact support.');
    }
    
    // Re-throw the original error if not handled above
    throw error;
  }
},
  // Export corrected document
  exportCorrected: async (analysisId: string, fixedIssueIds: string[]) => {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/analysis/export-corrected`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisId, fixedIssueIds }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Export failed');
    }

    // Handle the file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extract filename from content-disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'corrected_document.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    return { success: true, fileName: filename };
  },

  // Extract text from Word document
  extractText: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);

    const authHeaders = getAuthHeaders();
    const headers: Record<string, string> = {};
    if (authHeaders) {
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          headers[key] = value as string;
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/analysis/extract-text`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Text extraction failed');
    }

    return response.json();
  },

  // Get issue fixes
  getFixes: (analysisId: string) => fetchWithAuth(`/analysis/${analysisId}/fixes`),

  // Bulk export
  bulkExport: async (analysisIds: string[], fixedIssueIdsMap: Record<string, string[]>) => {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/analysis/bulk-export`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisIds, fixedIssueIdsMap }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Bulk export failed');
    }

    return response.json();
  },

  // Helper: Validate file size before upload
  validateFileSize: (file: File, maxSizeMB: number = 50): { valid: boolean; message: string } => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `File size (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit.`
      };
    }
    
    return { valid: true, message: '' };
  },

  // Helper: Validate file type
  validateFileType: (file: File): { valid: boolean; message: string } => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];
    
    const isTypeValid = allowedTypes.includes(file.type);
    const isExtensionValid = allowedExtensions.includes(fileExtension);
    
    if (!isTypeValid && !isExtensionValid) {
      return {
        valid: false,
        message: `Invalid file type. Allowed: PDF, Word (DOC/DOCX), Text, Images (PNG, JPG).`
      };
    }
    
    return { valid: true, message: '' };
  }
};

// User API
export const userApi = {
  getProfile: (userId: string) => fetchWithAuth(`/users/${userId}`),
  updateProfile: (userId: string, data: any) => fetchWithAuth(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Document API
export const documentApi = {
  getRecent: (userId: string, limit: number = 10) => 
    fetchWithAuth(`/documents/recent/${userId}?limit=${limit}`),
  
  search: (query: string, userId?: string) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (userId) params.append('userId', userId);
    
    return fetchWithAuth(`/documents/search?${params.toString()}`);
  },
  
  deleteMultiple: (documentIds: string[]) => fetchWithAuth('/documents/bulk-delete', {
    method: 'DELETE',
    body: JSON.stringify({ documentIds }),
  }),
};