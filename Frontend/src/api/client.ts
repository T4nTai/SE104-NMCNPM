import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  ClassInfo,
  GradeRecord,
  SemesterAverage,
  StudentInClass,
  StudentScore,
  StudentSearchResult,
} from './types';

// Fallback to default URL if VITE_API_BASE_URL is not set
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Set auth token
export function setAuthToken(token?: string) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    localStorage.removeItem('authToken');
  }
}

// Restore token from storage on init
const storedToken = localStorage.getItem('authToken');
if (storedToken) setAuthToken(storedToken);

export const api = {
  // ========== Auth ==========
  async login(TenDangNhap: string, MatKhau: string): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', { TenDangNhap, MatKhau });
    return data.data || data;
  },

  async register(payload: {
    TenNguoiDung: string;
    Email: string;
    MatKhau: string;
    VaiTro?: string;
  }): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data || data;
  },

  async me() {
    const { data } = await apiClient.get('/auth/me');
    return data.data || data;
  },

  // ========== Student Endpoints ==========
  async getMyClasses(MaHocKy?: string): Promise<SemesterAverage[]> {
    const { data } = await apiClient.get('/students/me/classes', {
      params: { MaHocKy },
    });
    return (data.data || data) as SemesterAverage[];
  },

  async getMyScores(MaHocKy: string): Promise<GradeRecord[]> {
    const { data } = await apiClient.get('/students/me/scores', {
      params: { MaHocKy },
    });
    return (data.data || data) as GradeRecord[];
  },

  // ========== Teacher Endpoints ==========
  async getTeacherClasses(params?: { MaNamHoc?: string; MaKhoiLop?: string }): Promise<ClassInfo[]> {
    const { data } = await apiClient.get('/teacher/classes', { params });
    return (data.data || data) as ClassInfo[];
  },

  async addStudentToClass(
    MaLop: string,
    MaHocKy: string,
    student: {
      MaHocSinh: string;
      HoTen: string;
      GioiTinh: string;
      NgaySinh: string;
      Email?: string;
      SoDienThoai?: string;
      DiaChi?: string;
    }
  ): Promise<void> {
    await apiClient.post(`/teacher/classes/${MaLop}/semesters/${MaHocKy}/students`, student);
  },

  async updateStudent(MaHocSinh: string, updates: Partial<StudentInClass>): Promise<void> {
    await apiClient.put(`/teacher/students/${MaHocSinh}`, updates);
  },

  async deleteStudent(MaHocSinh: string): Promise<void> {
    await apiClient.delete(`/teacher/students/${MaHocSinh}`);
  },

  async getStudentScores(MaHocSinh: string, MaHocKy?: string): Promise<StudentScore[]> {
    const { data } = await apiClient.get(`/teacher/students/${MaHocSinh}/scores`, {
      params: { MaHocKy },
    });
    return (data.data || data) as StudentScore[];
  },

  async searchStudents(q: string): Promise<StudentSearchResult[]> {
    const { data } = await apiClient.get('/teacher/students/search', { params: { q } });
    return (data.data || data) as StudentSearchResult[];
  },

  async enterGradebook(payload: {
    MaLop: string;
    MaHocKy: string;
    MaMon: string;
    scores: Array<{
      MaHocSinh: string;
      details: Array<{ MaLHKT: string; Lan: number; Diem: number }>;
    }>;
  }): Promise<void> {
    await apiClient.post('/teacher/gradebooks/enter', payload);
  },

  // ========== Admin - Khoi Lop (Grade Levels) ==========
  async createGrade(payload: {
    TenKL: string;
    SoLop?: number;
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/khoilop', payload);
    return data.data || data;
  },

  async listGrades(): Promise<any[]> {
    const { data } = await apiClient.get('/admin/khoilop');
    return data.data || data;
  },

  async updateGrade(MaKL: string, payload: {
    TenKL?: string;
    SoLop?: number;
  }): Promise<any> {
    const { data } = await apiClient.put(`/admin/khoilop/${MaKL}`, payload);
    return data.data || data;
  },

  async deleteGrade(MaKL: string): Promise<void> {
    await apiClient.delete(`/admin/khoilop/${MaKL}`);
  },

  // ========== Admin - Mon Hoc (Subjects) ==========
  async createSubject(payload: {
    TenMonHoc: string;
    MaMon?: string;
    HeSoMon: number;
    MoTa?: string;
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/monhoc', payload);
    return data.data || data;
  },

  async listSubjects(): Promise<any[]> {
    const { data } = await apiClient.get('/admin/monhoc');
    return data.data || data;
  },

  async updateSubject(MaMonHoc: string, payload: {
    TenMonHoc?: string;
    MaMon?: string;
    HeSoMon?: number;
    MoTa?: string;
  }): Promise<any> {
    const { data } = await apiClient.put(`/admin/monhoc/${MaMonHoc}`, payload);
    return data.data || data;
  },

  async deleteSubject(MaMonHoc: string): Promise<void> {
    await apiClient.delete(`/admin/monhoc/${MaMonHoc}`);
  },

  // ========== Admin - Hoc Ky (Semesters) ==========
  async createSemester(payload: {
    TenHK: string;
    NamHoc: string; // e.g., "2024-2025"
    NgayBatDau?: string;
    NgayKetThuc?: string;
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/hocky', payload);
    return data.data || data;
  },

  async listSemesters(params?: { MaNamHoc?: number; NamHoc?: string }): Promise<any[]> {
    const { data } = await apiClient.get('/admin/hocky', { params });
    return data.data || data;
  },

  async updateSemester(MaHK: string, payload: {
    TenHK?: string;
    NamHoc?: string; // optional text, maps to MaNamHoc on server
    MaNamHoc?: number; // optional direct id
    NgayBatDau?: string;
    NgayKetThuc?: string;
  }): Promise<any> {
    const { data } = await apiClient.put(`/admin/hocky/${MaHK}`, payload);
    return data.data || data;
  },

  async deleteSemester(MaHK: string): Promise<void> {
    await apiClient.delete(`/admin/hocky/${MaHK}`);
  },

  // ========== Admin - Loai Hinh Kiem Tra (Test Types) ==========
  async createTestType(payload: {
    TenLHKT: string;
    HeSo?: number;
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/lhkt', payload);
    return data.data || data;
  },

  async listTestTypes(): Promise<any[]> {
    const { data } = await apiClient.get('/admin/lhkt');
    return data.data || data;
  },

  async updateTestType(MaLHKT: string, payload: {
    TenLHKT?: string;
    HeSo?: number;
  }): Promise<any> {
    const { data } = await apiClient.put(`/admin/lhkt/${MaLHKT}`, payload);
    return data.data || data;
  },

  async deleteTestType(MaLHKT: string): Promise<void> {
    await apiClient.delete(`/admin/lhkt/${MaLHKT}`);
  },

  // ========== Admin - Tham So (Parameters by Academic Year) ==========
  async getParameters(MaNH: string): Promise<any> {
    const { data } = await apiClient.get(`/admin/namhoc/${MaNH}/thamso`);
    return data.data || data;
  },
  async upsertParameters(MaNH: string, payload: {
    tuoiToiThieu: number;
    tuoiToiDa: number;
    soHocSinhToiDa1Lop: number;
    diemToiThieu: number;
    diemToiDa: number;
    diemDatToiThieu: number;
    diemToiThieuHocKy: number;
  }): Promise<any> {
    const { data } = await apiClient.put(`/admin/namhoc/${MaNH}/thamso/upsert`, payload);
    return data.data || data;
  },

  // ========== Admin - Lop (Classes) ==========
  async createClass(payload: {
    TenLop: string;
    MaKhoiLop: string;
    MaNamHoc: string;
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/lop', payload);
    return data.data || data;
  },

  // ========== Reports ==========
  async getReportBySemesterAndClass(params: {
    MaHocKy: string;
    MaLop: string;
  }): Promise<any> {
    const { data } = await apiClient.get('/reports/semester-class', { params });
    return data.data || data;
  },

  async getReportBySubject(params: {
    MaHocKy: string;
    MaMonHoc: string;
  }): Promise<any> {
    const { data } = await apiClient.get('/reports/subject', { params });
    return data.data || data;
  },
};

