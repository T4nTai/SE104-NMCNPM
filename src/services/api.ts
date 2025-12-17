// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }
  return response;
};

// Generic API functions
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  await handleApiError(response);
  return response.json();
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });
  
  await handleApiError(response);
  return response.json();
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });
  
  await handleApiError(response);
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  await handleApiError(response);
  return response.json();
}

// Authentication API
export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tenDangNhap: username, matKhau: password })
  });
  
  await handleApiError(response);
  const data = await response.json();
  
  // Save token to localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

export function logout() {
  localStorage.removeItem('authToken');
}

// User Management API
export const userApi = {
  getAll: () => apiGet<any[]>('/users'),
  getById: (id: number) => apiGet<any>(`/users/${id}`),
  create: (data: any) => apiPost<any>('/users', data),
  update: (id: number, data: any) => apiPut<any>(`/users/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/users/${id}`)
};

// User Group API
export const userGroupApi = {
  getAll: () => apiGet<any[]>('/user-groups'),
  getById: (id: number) => apiGet<any>(`/user-groups/${id}`),
  create: (data: any) => apiPost<any>('/user-groups', data),
  update: (id: number, data: any) => apiPut<any>(`/user-groups/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/user-groups/${id}`)
};

// Permission API
export const permissionApi = {
  getAll: () => apiGet<any[]>('/permissions'),
  getById: (id: number) => apiGet<any>(`/permissions/${id}`),
  create: (data: any) => apiPost<any>('/permissions', data),
  update: (id: number, data: any) => apiPut<any>(`/permissions/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/permissions/${id}`)
};

// Semester API
export const semesterApi = {
  getAll: () => apiGet<any[]>('/semesters'),
  getById: (id: number) => apiGet<any>(`/semesters/${id}`),
  create: (data: any) => apiPost<any>('/semesters', data),
  update: (id: number, data: any) => apiPut<any>(`/semesters/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/semesters/${id}`)
};

// Subject API
export const subjectApi = {
  getAll: () => apiGet<any[]>('/subjects'),
  getById: (id: number) => apiGet<any>(`/subjects/${id}`),
  create: (data: any) => apiPost<any>('/subjects', data),
  update: (id: number, data: any) => apiPut<any>(`/subjects/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/subjects/${id}`)
};

// Grade API
export const gradeApi = {
  getAll: () => apiGet<any[]>('/grades'),
  getById: (id: number) => apiGet<any>(`/grades/${id}`),
  create: (data: any) => apiPost<any>('/grades', data),
  update: (id: number, data: any) => apiPut<any>(`/grades/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/grades/${id}`)
};

// Parameter API
export const parameterApi = {
  getAll: () => apiGet<any[]>('/parameters'),
  update: (data: any) => apiPut<any>('/parameters', data)
};

// Class API
export const classApi = {
  getAll: () => apiGet<any[]>('/classes'),
  getById: (id: number) => apiGet<any>(`/classes/${id}`),
  getByGrade: (grade: number) => apiGet<any[]>(`/classes/grade/${grade}`),
  create: (data: any) => apiPost<any>('/classes', data),
  update: (id: number, data: any) => apiPut<any>(`/classes/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/classes/${id}`)
};

// Student API
export const studentApi = {
  getAll: () => apiGet<any[]>('/students'),
  getById: (id: number) => apiGet<any>(`/students/${id}`),
  getByClass: (classId: number) => apiGet<any[]>(`/students/class/${classId}`),
  search: (keyword: string) => apiGet<any[]>(`/students/search?q=${keyword}`),
  create: (data: any) => apiPost<any>('/students', data),
  update: (id: number, data: any) => apiPut<any>(`/students/${id}`, data),
  delete: (id: number) => apiDelete<any>(`/students/${id}`)
};

// Score API
export const scoreApi = {
  getByStudent: (studentId: number) => apiGet<any[]>(`/scores/student/${studentId}`),
  getByClass: (classId: number, subjectId: number, semesterId: number) => 
    apiGet<any[]>(`/scores/class/${classId}?subjectId=${subjectId}&semesterId=${semesterId}`),
  createBulk: (data: any[]) => apiPost<any>('/scores/bulk', data),
  update: (id: number, data: any) => apiPut<any>(`/scores/${id}`, data)
};

// Report API
export const reportApi = {
  getSemesterReport: (semesterId: number) => apiGet<any>(`/reports/semester/${semesterId}`),
  getSubjectReport: (subjectId: number, semesterId: number) => 
    apiGet<any>(`/reports/subject/${subjectId}?semesterId=${semesterId}`)
};
