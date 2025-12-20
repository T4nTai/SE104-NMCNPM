// Subject grades for student transcript
export interface GradeRecord {
  MaMon: string;
  TenMon: string;
  DiemGiuaKy?: number;
  DiemCuoiKy?: number;
  DiemTBMon?: number;
  HeSo?: number;
  XepLoai?: string; // Xuất sắc, Giỏi, Khá, Yếu, Kém
}

// Semester average for a student in a class
export interface SemesterAverage {
  MaLop: string;
  TenLop: string;
  MaKhoiLop: string;
  MaHocKy: string;
  TenHK: string;
  DiemTBHocKy?: number;
  DiemTBHocKyQuy?: string;
}

// Student in a class (teacher view)
export interface StudentInClass {
  MaHocSinh: string;
  HoTen: string;
  GioiTinh: string;
  NgaySinh: string;
  Email?: string;
  SoDienThoai?: string;
  DiaChi?: string;
  DiemTBHocKy?: number;
}

// Class summary (teacher view)
export interface ClassInfo {
  MaLop: string;
  TenLop: string;
  MaKhoiLop: string;
  TenKhoiLop?: string;
  MaNamHoc?: string;
  SiSo?: number;
  DanhSachHocSinh?: StudentInClass[];
}

// Score detail for gradebook entry
export interface ScoreDetail {
  MaLHKT: string; // Loại hình kiểm tra (1=Miệng, 2=15 phút, 3=1 tiết, 4=Giữa kỳ, 5=Cuối kỳ)
  Lan: number; // Attempt/round
  Diem: number;
}

export interface StudentScore {
  MaHocSinh: string;
  HoTen?: string;
  DiemGiuaKy?: number;
  DiemCuoiKy?: number;
  DiemTBMon?: number;
  details?: ScoreDetail[];
}

export interface StudentSearchResult {
  MaHocSinh: string;
  HoTen: string;
  GioiTinh: string;
  NgaySinh: string;
  Email?: string;
  SoDienThoai?: string;
  DiaChi?: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    MaNguoiDung?: string;
    id?: string;
    TenDangNhap?: string;
    TenNguoiDung?: string;
    HoVaTen?: string;
    Email?: string;
    role?: 'admin' | 'teacher' | 'student';
    VaiTro?: 'admin' | 'teacher' | 'student';
  };
}

