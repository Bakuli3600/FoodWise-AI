/**
 * FOODWISE AI: Central REST API Client
 */

const API_BASE = '/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('foodwise_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foodwise_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('foodwise_token');
    localStorage.removeItem('foodwise_user');
  }
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('foodwise_user');
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foodwise_user', JSON.stringify(user));
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      errMsg = errData.detail || errMsg;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),

  // Detection
  getSamples: () => request<any[]>('/detection/samples'),

  predict: (formData: FormData) =>
    request<any>('/detection/predict', {
      method: 'POST',
      body: formData,
    }),

  // History
  getHistory: (params: { search?: string; cafeteria_id?: number; min_waste?: number; max_waste?: number; limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.cafeteria_id) q.set('cafeteria_id', String(params.cafeteria_id));
    if (params.min_waste !== undefined) q.set('min_waste', String(params.min_waste));
    if (params.max_waste !== undefined) q.set('max_waste', String(params.max_waste));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    return request<any[]>(`/history?${q.toString()}`);
  },

  getHistoryDetail: (id: number) => request<any>(`/history/${id}`),

  deleteHistory: (id: number) => request<{ message: string }>(`/history/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsOverview: (cafeteria_id?: number) => {
    const q = cafeteria_id ? `?cafeteria_id=${cafeteria_id}` : '';
    return request<any>(`/analytics/overview${q}`);
  },

  getCategoryIntelligence: (cafeteria_id?: number) => {
    const q = cafeteria_id ? `?cafeteria_id=${cafeteria_id}` : '';
    return request<any[]>(`/analytics/categories${q}`);
  },

  getTrends: (cafeteria_id?: number) => {
    const q = cafeteria_id ? `?cafeteria_id=${cafeteria_id}` : '';
    return request<any[]>(`/analytics/trends${q}`);
  },

  getCafeteriaComparison: () => request<any[]>('/analytics/cafeterias'),

  getInsights: () => request<any[]>('/analytics/insights'),

  // Predictions
  getPredictions: (horizon: number = 7, allowDemo: boolean = true, cafeteria_id?: number) => {
    const q = new URLSearchParams({
      horizon: String(horizon),
      allow_demo: String(allowDemo),
    });
    if (cafeteria_id) q.set('cafeteria_id', String(cafeteria_id));
    return request<any>(`/predictions?${q.toString()}`);
  },

  // Recommendations
  getRecommendations: (status?: string, cafeteria_id?: number) => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (cafeteria_id) q.set('cafeteria_id', String(cafeteria_id));
    return request<any[]>(`/recommendations?${q.toString()}`);
  },

  updateRecommendationStatus: (id: number, status: string) =>
    request<any>(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  reevaluateRecommendations: (cafeteria_id?: number) => {
    const q = cafeteria_id ? `?cafeteria_id=${cafeteria_id}` : '';
    return request<any[]>(`/recommendations/re-evaluate${q}`, { method: 'POST' });
  },

  // Cafeterias
  getCafeterias: () => request<any[]>('/cafeterias'),

  createCafeteria: (data: { name: string; code: string; campus_location?: string; daily_capacity?: number }) =>
    request<any>('/cafeterias', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCafeteria: (id: number, data: any) =>
    request<any>(`/cafeterias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCafeteria: (id: number) => request<any>(`/cafeterias/${id}`, { method: 'DELETE' }),

  // Meals
  getMeals: (params: { cafeteria_id?: number; meal_date?: string; session?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.cafeteria_id) q.set('cafeteria_id', String(params.cafeteria_id));
    if (params.meal_date) q.set('meal_date', params.meal_date);
    if (params.session) q.set('session', params.session);
    return request<any[]>(`/meals?${q.toString()}`);
  },

  recordMeal: (data: any) =>
    request<any>('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sustainability
  getSustainability: () => request<any>('/sustainability'),

  // Assistant
  askAssistant: (query: string, history?: any[]) =>
    request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ query, conversation_history: history }),
    }),

  // Model Info
  getModelInfo: () => request<any>('/model/info'),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),

  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () => request<any>('/notifications/mark-all-read', { method: 'POST' }),

  // Reports
  getReports: () => request<any[]>('/reports'),

  generateReport: (data: { title: string; report_type: string; date_range_start: string; date_range_end: string; format?: string; cafeteria_id?: number }) =>
    request<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
