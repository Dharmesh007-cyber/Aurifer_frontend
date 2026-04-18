/**
 * API client for the Momentext Aurifer backend.
 * All REST calls and WebSocket management go through here.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aurifer_token");
}

function setToken(token: string) {
  localStorage.setItem("aurifer_token", token);
}

function clearToken() {
  localStorage.removeItem("aurifer_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ── Auth ──

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    request<{ access_token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => {
      setToken(res.access_token);
      return res;
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => {
      setToken(res.access_token);
      return res;
    }),

  me: () => request<unknown>("/auth/me"),

  logout: () => {
    clearToken();
  },
};

// ── Projects ──

export const projectsApi = {
  create: (data: {
    project_name: string;
    client_name: string;
    project_context?: string;
    document_type: string;
    prompt?: string;
  }) =>
    request<unknown>("/projects/", { method: "POST", body: JSON.stringify(data) }),

  list: (statusFilter?: string) => {
    const params = statusFilter ? `?status_filter=${statusFilter}` : "";
    return request<unknown[]>(`/projects/${params}`);
  },

  get: (projectId: string) => request<unknown>(`/projects/${projectId}`),

  update: (projectId: string, data: Record<string, unknown>) =>
    request<unknown>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (projectId: string) =>
    request<void>(`/projects/${projectId}`, { method: "DELETE" }),

  listDocuments: (projectId: string) =>
    request<unknown[]>(`/projects/${projectId}/documents`),

  updateDocument: (projectId: string, documentId: string, contentJson: unknown) =>
    request<unknown>(`/projects/${projectId}/documents/${documentId}`, {
      method: "PATCH",
      body: JSON.stringify({ content_json: contentJson }),
    }),
};

// ── Chat ──

export const chatApi = {
  generateDocument: (projectId: string) =>
    request<{ document_id: string; content_json: unknown; message: string }>(
      `/chat/${projectId}/generate`,
      { method: "POST" },
    ),

  getMessages: (projectId: string) =>
    request<unknown[]>(`/chat/${projectId}/messages`),

  sendMessage: (
    projectId: string,
    data: { content: string; message_type?: string; current_document_json?: unknown },
  ) =>
    request<{ chat_response: string; patches: unknown[] }>(
      `/chat/${projectId}/messages`,
      { method: "POST", body: JSON.stringify(data) },
    ),

  createWebSocket: (projectId: string): WebSocket => {
    const ws = new WebSocket(`${WS_BASE}/chat/${projectId}/ws`);
    return ws;
  },
};

// ── Dropbox ──

export const dropboxApi = {
  getStatus: () => request<unknown>("/dropbox/status"),

  getAuthUrl: () =>
    request<{ auth_url: string }>("/dropbox/auth-url", { method: "POST" }),

  connect: (code: string) =>
    request<unknown>("/dropbox/connect", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  disconnect: () => request<unknown>("/dropbox/disconnect", { method: "DELETE" }),

  listFolders: (path?: string) => {
    const params = path ? `?path=${encodeURIComponent(path)}` : "";
    return request<{ folders: unknown[] }>(`/dropbox/folders${params}`);
  },

  listFiles: (clientName?: string) => {
    const params = clientName ? `?client_name=${encodeURIComponent(clientName)}` : "";
    return request<unknown[]>(`/dropbox/files${params}`);
  },

  triggerSync: () =>
    request<{ message: string }>("/dropbox/sync", { method: "POST" }),
};

// ── Export ──

export const exportApi = {
  exportDocument: (data: {
    document_id: string;
    format: string;
    document_json?: unknown;
  }) =>
    request<{ download_url: string; file_name: string; format: string }>(
      "/export/",
      { method: "POST", body: JSON.stringify(data) },
    ),

  downloadUrl: (fileName: string) => `${API_BASE}/export/download/${fileName}`,
};

// ── Ingestion ──

export const ingestionApi = {
  listJobs: (statusFilter?: string, clientName?: string) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status_filter", statusFilter);
    if (clientName) params.set("client_name", clientName);
    const qs = params.toString();
    return request<unknown[]>(`/ingestion/jobs${qs ? `?${qs}` : ""}`);
  },

  triggerSync: () =>
    request<{ message: string }>("/ingestion/trigger-sync", { method: "POST" }),

  uploadFile: async (file: File, clientName: string, isPolicy = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_name", clientName);
    formData.append("is_policy", String(isPolicy));

    const token = getToken();
    const response = await fetch(`${API_BASE}/ingestion/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail);
    }
    return response.json();
  },

  uploadPolicy: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const response = await fetch(`${API_BASE}/ingestion/upload-policy`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail);
    }
    return response.json();
  },
};
