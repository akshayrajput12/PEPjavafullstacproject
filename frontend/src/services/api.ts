import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    console.log("Login call", email, password)
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    return await api.post('/auth/register', { name, email, password });
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: (): string | null => {
    return localStorage.getItem('token');
  }
};

export const resumeService = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyResumes: async () => {
    return await api.get('/api/resume/my');
  },
  deleteResume: async (id: number) => {
    return await api.delete(`/api/resume/${id}`);
  },
};

export const analysisService = {
  analyzeResume: async (resumeId: number, jobDescription: string) => {
    return await api.post(`/api/analyze/${resumeId}`, { jobDescription });
  },
  getHistory: async (resumeId: number) => {
    return await api.get(`/api/analyze/history/${resumeId}`);
  },
};

export default api;
