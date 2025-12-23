## Hệ thống quản lý học sinh (SE104-NMCNPM)

Đây là repo chứa một ứng dụng quản lý học sinh gồm Backend (API) và Frontend (UI) được phát triển cho môn học. Ứng dụng cho phép quản lý tài khoản người dùng (học sinh/giáo viên/admin), phân công giáo viên, import danh sách học sinh từ file CSV/XLSX và xuất báo cáo cơ bản.

### Cấu trúc chính
- `Backend/` — Node.js + Express API, các model Sequelize, controllers, routes, và tiện ích (upload, spreadsheet parser).
- `Frontend/` — React + TypeScript (Vite) giao diện người dùng, client API (`src/api/client.ts`) và các component quản trị.
- `Database.sql` — file schema (có thể chứa tên schema khác; kiểm tra khi import vào DB của bạn).

### Tính năng nổi bật
- Xác thực bằng JWT
- Quản lý người dùng: tạo/sửa/xóa tài khoản học sinh và giáo viên
- Giao diện cho giáo viên: phân công, quản lý tài khoản học sinh, import từ CSV/XLSX
- Import file: hiển thị báo cáo chi tiết (số bản ghi thành công/thất bại và lỗi theo hàng)

### Công nghệ và vai trò (chi tiết)
- Node.js: runtime cho backend, xử lý API và logic server.
- Express: framework HTTP, định nghĩa route/controller và middlewares.
- Sequelize (MySQL dialect): ORM quản lý model, truy vấn và migrations đến MySQL.
- MySQL: cơ sở dữ liệu quan hệ lưu trữ dữ liệu ứng dụng (bảng người dùng, học sinh, nhóm người dùng, tham số...).
- React + TypeScript: frontend SPA, component hóa giao diện, type-safety cho client.
- Vite: công cụ build/dev server cho frontend (nhanh, HMR).
- Axios: client HTTP trong `Frontend/src/api/client.ts` để gọi API backend và xử lý lỗi chung.
- JWT (JSON Web Token): xác thực và phân quyền API (middleware kiểm tra token).
- Multer (hoặc middleware tương tự): xử lý multipart/form-data để upload file trên backend (upload middleware có trong `Backend/src/middlewares`).
- Parser spreadsheet: thư viện/parsers dùng để đọc CSV/Excel (có util xử lý file trong `Backend/src/ultis/spreadsheet.js`).
- Docker & docker-compose: file cấu hình có sẵn để triển khai nhanh (tùy chọn).

> Ghi chú: repo chứa các file middleware, util và routes để thực hiện đầy đủ luồng import và quản lý tài khoản. Nếu bạn muốn, tôi có thể liệt kê các gói npm chính cụ thể đang sử dụng (ví dụ `express`, `sequelize`, `mysql2`, `react`, `vite`, `axios`, `multer`, `xlsx`) sau khi bạn cho phép đọc `package.json`.

### Yêu cầu hệ thống
- Node.js 16+ (hoặc phiên bản tương thích với dự án)
- npm hoặc yarn
- MySQL server (phiên bản tương thích với `mysql2`/Sequelize)
- (Tuỳ chọn) Docker

### Cài đặt nhanh (local)

1) Backend

- Tạo file env: sao chép `Backend/.env.example` → `Backend/.env` và cập nhật thông tin DB. Ví dụ:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Admin123
DB_NAME=QLHS_WEB
NODE_ENV=development
```

- Cài đặt và chạy server:

```bash
cd Backend
npm install
npm run dev
```

2) Database

- Tạo database (ví dụ `QLHS_WEB`) và import `Backend/Database.sql` nếu cần. Kiểm tra các tên cột (ví dụ `Tuoi_Toi_Da`) để tránh lỗi trường không tồn tại.

3) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Mở trình duyệt vào `http://localhost:5173` (mặc định của Vite) và đăng nhập bằng tài khoản admin/teacher.

### Chạy bằng Docker

- Có file `docker-compose.yml` ở thư mục gốc và `Backend/` để chạy dịch vụ theo container. Trước khi chạy, cập nhật biến môi trường trong file `.env` hoặc docker-compose.

### Gợi ý test nhanh tính năng import học sinh
1. Khởi động backend và frontend.
2. Đăng nhập bằng tài khoản có role `teacher`.
3. Vào **Teacher Dashboard → Quản lý tài khoản HS** → upload file CSV/XLSX.
4. Quan sát báo cáo import (tổng, thành công, thất bại; lỗi theo hàng).


```
