import { getAuthHeaders } from './authService';

const API_BASE_URL = 'http://localhost:5000';

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

export const workspaceApi = {
    create: (name: string, description: string) => fetchWithAuth('/workspace/create', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
    }),

    getAll: () => fetchWithAuth('/workspace'),

    getById: (id: string) => fetchWithAuth(`/workspace/${id}`),

    join: (code: string) => fetchWithAuth('/workspace/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
    }),

    delete: (id: string) => fetchWithAuth(`/workspace/${id}`, {
        method: 'DELETE',
    }),

    addDocument: (workspaceId: string, document: any) => fetchWithAuth(`/workspace/${workspaceId}/documents`, {
        method: 'POST',
        body: JSON.stringify(document),
    }),

    removeDocument: (workspaceId: string, analysisId: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}`, {
        method: 'DELETE',
    }),

    removeMember: (workspaceId: string, memberId: string) => fetchWithAuth(`/workspace/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
    }),
};
