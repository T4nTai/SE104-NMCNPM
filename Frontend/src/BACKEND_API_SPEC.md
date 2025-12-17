# Backend API Specification - Hệ thống Quản lý Học sinh

## Base URL
```
http://localhost:3000/api
```

## Authentication

### POST /auth/login
Đăng nhập vào hệ thống

**Request:**
```json
{
  "tenDangNhap": "string",
  "matKhau": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "maNguoiDung": number,
    "tenDangNhap": "string",
    "hoVaTen": "string",
    "email": "string",
    "maNhomNguoiDung": number,
    "role": "admin" | "teacher" | "student"
  }
}
```

---

## User Management (Quản lý người dùng)

### GET /users
Lấy danh sách tất cả người dùng

**Response:**
```json
[
  {
    "maNguoiDung": number,
    "tenDangNhap": "string",
    "matKhau": "string",
    "hoVaTen": "string",
    "email": "string",
    "maNhomNguoiDung": number,
    "tenNhomNguoiDung": "string"
  }
]
```

### GET /users/:id
Lấy thông tin người dùng theo ID

### POST /users
Tạo người dùng mới

**Request:**
```json
{
  "tenDangNhap": "string",
  "matKhau": "string",
  "hoVaTen": "string",
  "email": "string",
  "maNhomNguoiDung": number
}
```

### PUT /users/:id
Cập nhật người dùng

### DELETE /users/:id
Xóa người dùng

---

## User Groups (Nhóm người dùng)

### GET /user-groups
Lấy danh sách nhóm người dùng kèm quyền

**Response:**
```json
[
  {
    "maNhomNguoiDung": number,
    "tenNhomNguoiDung": "string",
    "maQuyen": number,
    "permission": {
      "maQuyen": number,
      "phanQuyenHeThong": 0 | 1,
      "thayDoiThamSo": 0 | 1,
      "thayDoiQuyDinh": 0 | 1,
      "dieuChinhNghiepVu": 0 | 1,
      "traCuuDiemVaLopHoc": 0 | 1,
      "traCuuHocSinh": 0 | 1
    }
  }
]
```

### POST /user-groups
### PUT /user-groups/:id
### DELETE /user-groups/:id

---

## Permissions (Quyền)

### GET /permissions
### POST /permissions
### PUT /permissions/:id
### DELETE /permissions/:id

---

## Semesters (Học kỳ)

### GET /semesters
Lấy danh sách học kỳ

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "startDate": "string (YYYY-MM-DD)",
    "endDate": "string (YYYY-MM-DD)",
    "year": "string"
  }
]
```

### POST /semesters
**Request:**
```json
{
  "name": "string",
  "startDate": "string",
  "endDate": "string",
  "year": "string"
}
```

### PUT /semesters/:id
### DELETE /semesters/:id

---

## Subjects (Môn học)

### GET /subjects
**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "code": "string",
    "heSoMon": number,
    "description": "string"
  }
]
```

### POST /subjects
### PUT /subjects/:id
### DELETE /subjects/:id

---

## Grades (Khối lớp)

### GET /grades
**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "classCount": number
  }
]
```

### POST /grades
### PUT /grades/:id
### DELETE /grades/:id

---

## Parameters (Tham số)

### GET /parameters
**Response:**
```json
{
  "tuoiToiThieu": number,
  "tuoiToiDa": number,
  "siSoToiDa": number,
  "diemToiThieu": number,
  "diemToiDa": number,
  "diemDat": number
}
```

### PUT /parameters
**Request:**
```json
{
  "tuoiToiThieu": number,
  "tuoiToiDa": number,
  "siSoToiDa": number,
  "diemToiThieu": number,
  "diemToiDa": number,
  "diemDat": number
}
```

---

## Classes (Lớp học)

### GET /classes
Lấy danh sách tất cả lớp

**Response:**
```json
[
  {
    "maLop": number,
    "tenLop": "string",
    "khoi": number,
    "namHoc": "string",
    "siSo": number,
    "giaoVienChuNhiem": "string"
  }
]
```

### GET /classes/grade/:grade
Lấy danh sách lớp theo khối

### POST /classes
**Request:**
```json
{
  "tenLop": "string",
  "khoi": number,
  "namHoc": "string",
  "giaoVienChuNhiem": "string"
}
```

### PUT /classes/:id
### DELETE /classes/:id

---

## Students (Học sinh)

### GET /students
Lấy danh sách tất cả học sinh

**Response:**
```json
[
  {
    "maHocSinh": number,
    "hoTen": "string",
    "gioiTinh": "Nam" | "Nữ",
    "ngaySinh": "string (YYYY-MM-DD)",
    "diaChi": "string",
    "email": "string",
    "soDienThoai": "string",
    "maLop": number,
    "tenLop": "string"
  }
]
```

### GET /students/class/:classId
Lấy danh sách học sinh theo lớp

### GET /students/search?q=keyword
Tìm kiếm học sinh

### POST /students
**Request:**
```json
{
  "hoTen": "string",
  "gioiTinh": "Nam" | "Nữ",
  "ngaySinh": "string",
  "diaChi": "string",
  "email": "string",
  "soDienThoai": "string",
  "maLop": number
}
```

### PUT /students/:id
### DELETE /students/:id

---

## Scores (Điểm số)

### GET /scores/student/:studentId
Lấy điểm của một học sinh

**Response:**
```json
[
  {
    "maDiem": number,
    "maHocSinh": number,
    "maMonHoc": number,
    "tenMonHoc": "string",
    "maHocKy": number,
    "tenHocKy": "string",
    "diemMieng": number[],
    "diem15Phut": number[],
    "diem1Tiet": number[],
    "diemGiuaKy": number | null,
    "diemCuoiKy": number | null,
    "diemTrungBinh": number
  }
]
```

### GET /scores/class/:classId?subjectId=:id&semesterId=:id
Lấy bảng điểm của lớp theo môn học và học kỳ

**Response:**
```json
[
  {
    "maHocSinh": number,
    "hoTen": "string",
    "diemMieng": number[],
    "diem15Phut": number[],
    "diem1Tiet": number[],
    "diemGiuaKy": number | null,
    "diemCuoiKy": number | null,
    "diemTrungBinh": number
  }
]
```

### POST /scores/bulk
Nhập điểm hàng loạt

**Request:**
```json
[
  {
    "maHocSinh": number,
    "maMonHoc": number,
    "maHocKy": number,
    "loaiDiem": "mieng" | "15phut" | "1tiet" | "giuaky" | "cuoiky",
    "diem": number
  }
]
```

### PUT /scores/:id
Cập nhật điểm

---

## Reports (Báo cáo)

### GET /reports/semester/:semesterId
Báo cáo tổng kết học kỳ

**Response:**
```json
{
  "tenHocKy": "string",
  "namHoc": "string",
  "tongSoLop": number,
  "danhSachLop": [
    {
      "tenLop": "string",
      "siSo": number,
      "soLuongDat": number,
      "tiLeDat": number
    }
  ]
}
```

### GET /reports/subject/:subjectId?semesterId=:id
Báo cáo môn học theo học kỳ

**Response:**
```json
{
  "tenMonHoc": "string",
  "tenHocKy": "string",
  "tongSoHocSinh": number,
  "danhSachLop": [
    {
      "tenLop": "string",
      "siSo": number,
      "soLuongDat": number,
      "tiLeDat": number,
      "diemTrungBinh": number
    }
  ]
}
```

---

## Error Responses

Tất cả endpoints đều có thể trả về các lỗi sau:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Mô tả lỗi cụ thể"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token không hợp lệ hoặc hết hạn"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Không có quyền truy cập"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Không tìm thấy dữ liệu"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Lỗi hệ thống"
}
```

---

## Authentication Header

Tất cả các API (trừ /auth/login) đều cần gửi kèm token trong header:

```
Authorization: Bearer <token>
```

---

## Validation Rules

### Người dùng:
- tenDangNhap: required, unique, min 3 characters
- matKhau: required, min 6 characters
- hoVaTen: required
- email: required, valid email format

### Học sinh:
- hoTen: required
- ngaySinh: required, tuổi từ 15-20 (theo tham số)
- email: valid email format
- soDienThoai: 10 digits

### Điểm:
- Giá trị từ 0-10
- Tối đa 2 chữ số thập phân
- Điểm đạt: >= 5 (theo tham số)

### Lớp học:
- Sĩ số tối đa: 40 (theo tham số)
- Khối: 10, 11, hoặc 12
