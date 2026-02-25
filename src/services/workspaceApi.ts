import { getAuthHeaders, getToken } from './authService';

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
        const err: any = new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        err.limitReached = error.limitReached || false;
        err.status = response.status;
        throw err;
    }

    return response.json();
};

export const workspaceApi = {
    // Core workspace CRUD
    create: (name: string, description: string, category?: string) => fetchWithAuth('/workspace/create', {
        method: 'POST',
        body: JSON.stringify({ name, description, category: category || 'General' }),
    }),

    update: (id: string, data: { name?: string; description?: string; category?: string }) =>
        fetchWithAuth(`/workspace/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    getAll: (archived?: boolean) => {
        const query = archived !== undefined ? `?archived=${archived}` : '';
        return fetchWithAuth(`/workspace${query}`);
    },

    getById: (id: string) => fetchWithAuth(`/workspace/${id}`),

    join: (code: string) => fetchWithAuth('/workspace/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
    }),

    delete: (id: string) => fetchWithAuth(`/workspace/${id}`, {
        method: 'DELETE',
    }),

    archive: (id: string) => fetchWithAuth(`/workspace/${id}/archive`, {
        method: 'PATCH',
    }),

    unarchive: (id: string) => fetchWithAuth(`/workspace/${id}/unarchive`, {
        method: 'PATCH',
    }),

    // Documents
    addDocument: (workspaceId: string, document: any) => fetchWithAuth(`/workspace/${workspaceId}/documents`, {
        method: 'POST',
        body: JSON.stringify(document),
    }),

    removeDocument: (workspaceId: string, analysisId: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}`, {
        method: 'DELETE',
    }),

    // Members
    removeMember: (workspaceId: string, memberId: string) => fetchWithAuth(`/workspace/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
    }),

    promoteToCoAdmin: (workspaceId: string, memberId: string) => fetchWithAuth(`/workspace/${workspaceId}/members/${memberId}/promote`, {
        method: 'POST',
    }),

    demoteToMember: (workspaceId: string, memberId: string) => fetchWithAuth(`/workspace/${workspaceId}/members/${memberId}/demote`, {
        method: 'POST',
    }),

    // Document Status & Comments
    updateDocumentStatus: (workspaceId: string, analysisId: string, status: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),

    addDocumentComment: (workspaceId: string, analysisId: string, text: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    }),

    editDocumentComment: (workspaceId: string, analysisId: string, commentId: string, text: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ text }),
    }),

    deleteDocumentComment: (workspaceId: string, analysisId: string, commentId: string) => fetchWithAuth(`/workspace/${workspaceId}/documents/${analysisId}/comments/${commentId}`, {
        method: 'DELETE',
    }),

    // PMS
    createTask: (workspaceId: string, taskData: any) => fetchWithAuth(`/workspace/${workspaceId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    }),

    updateTask: (workspaceId: string, taskId: string, updates: any) => fetchWithAuth(`/workspace/${workspaceId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    }),

    deleteTask: (workspaceId: string, taskId: string) => fetchWithAuth(`/workspace/${workspaceId}/tasks/${taskId}`, {
        method: 'DELETE',
    }),

    getBoard: (workspaceId: string) => fetchWithAuth(`/workspace/${workspaceId}/board`),

    // Admin Direct Uploads
    uploadAdminFile: async (workspaceId: string, file: File) => {
        const headers = getAuthHeaders() as Record<string, string>;
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/admin-upload`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Upload failed');
        }
        return response.json();
    },

    deleteAdminFile: (workspaceId: string, uploadId: string) =>
        fetchWithAuth(`/workspace/${workspaceId}/admin-upload/${uploadId}`, { method: 'DELETE' }),

    getAdminFileDownloadUrl: (workspaceId: string, uploadId: string): string => {
        const token = getToken();
        return `${API_BASE_URL}/workspace/${workspaceId}/admin-upload/${uploadId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    },
};
