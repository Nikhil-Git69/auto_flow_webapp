// frontend/src/services/api.ts
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

  // Upload file
  uploadFile: async (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', userId);
    formData.append('fileName', file.name);

    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/analysis/upload-file`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
};