import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with interceptor for JWT
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    return api.post('/auth/register', { name, email, password });
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: () => {
    return localStorage.getItem('token');
  },
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};

export const jobApi = {
  getJobs: () => api.get('/jobs'),
};


export const resumeService = {
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyResumes: () => api.get('/resume/my-resumes'),
  deleteResume: (id: number) => api.delete(`/resume/${id}`),
};

export const analysisService = {
  analyzeResume: (resumeId: number, jobDescription: string) =>
    api.post(`/analyze/${resumeId}`, { jobDescription }),
  getAnalysisHistory: (resumeId: number) => api.get(`/analyze/history/${resumeId}`),
  deleteAnalysis: (id: number) => api.delete(`/analyze/${id}`),
};

export default api;
