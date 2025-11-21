import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  title: string;
  doc_type: 'docx' | 'pptx';
  created_at: string;
  owner_id: number;
  sections?: DocumentSection[];
}

export interface DocumentSection {
  id: number;
  project_id: number;
  heading: string;
  content: string;
  order_index: number;
  feedback?: 'like' | 'dislike' | null;
  comments?: string | null;
}

export interface LoginCredentials {
  username: string; // FastAPI OAuth2 uses 'username' field
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

// Authentication API
export const authAPI = {
  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_BASE_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    return token;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};

// Projects API
export const projectsAPI = {
  async create(title: string, doc_type: 'docx' | 'pptx'): Promise<Project> {
    const response = await api.post('/projects', { title, doc_type });
    return response.data;
  },

  async getAll(): Promise<Project[]> {
    const response = await api.get('/projects');
    return response.data;
  },

  async getById(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async export(id: number): Promise<Blob> {
    const response = await api.get(`/projects/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Sections API
export const sectionsAPI = {
  async create(
    project_id: number,
    heading: string,
    content: string,
    order_index: number
  ): Promise<DocumentSection> {
    const response = await api.post('/sections', {
      project_id,
      heading,
      content,
      order_index,
    });
    return response.data;
  },

  async getByProject(project_id: number): Promise<DocumentSection[]> {
    const response = await api.get(`/projects/${project_id}/sections`);
    return response.data;
  },

  async update(
    id: number,
    updates: Partial<Omit<DocumentSection, 'id' | 'project_id'>>
  ): Promise<DocumentSection> {
    const response = await api.patch(`/sections/${id}`, updates);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sections/${id}`);
  },
};

// AI Generation API
export const aiAPI = {
  async generateOutline(
    topic: string,
    doc_type: 'docx' | 'pptx'
  ): Promise<string[]> {
    const response = await api.post('/generate/outline', { topic, doc_type });
    return response.data.sections;
  },

  async generateSection(
    section_title: string,
    topic: string,
    doc_type: 'docx' | 'pptx'
  ): Promise<string> {
    const response = await api.post('/generate/section', {
      section_title,
      topic,
      doc_type,
    });
    return response.data.content;
  },
};

export default api;

