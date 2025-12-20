import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";

const AdminRoute = Router();

// ===== Khoi Lop =====
AdminRoute.post("/khoilop", AdminController.createKhoiLop);
AdminRoute.get("/khoilop", AdminController.listKhoiLop);
AdminRoute.put("/khoilop/:MaKL", AdminController.updateKhoiLop);
AdminRoute.patch("/khoilop/:MaKL", AdminController.updateKhoiLop);
AdminRoute.delete("/khoilop/:MaKL", AdminController.deleteKhoiLop);

// ===== Mon Hoc =====
AdminRoute.post("/monhoc", AdminController.createMonHoc);
AdminRoute.get("/monhoc", AdminController.listMonHoc);
AdminRoute.put("/monhoc/:MaMonHoc", AdminController.updateMonHoc);
AdminRoute.patch("/monhoc/:MaMonHoc", AdminController.updateMonHoc);
AdminRoute.delete("/monhoc/:MaMonHoc", AdminController.deleteMonHoc);

// ===== Hoc Ky =====
AdminRoute.post("/hocky", AdminController.createHocKy);
AdminRoute.get("/hocky", AdminController.listHocKy); // hỗ trợ query ?NamHoc=2024-2025 hoặc ?MaNamHoc=1
AdminRoute.put("/hocky/:MaHK", AdminController.updateHocKy);
AdminRoute.patch("/hocky/:MaHK", AdminController.updateHocKy);
AdminRoute.delete("/hocky/:MaHK", AdminController.deleteHocKy);

// ===== Loai Hinh Kiem Tra =====
AdminRoute.post("/lhkt", AdminController.createLoaiHinhKiemTra);
AdminRoute.get("/lhkt", AdminController.listLoaiHinhKiemTra);
AdminRoute.put("/lhkt/:MaLHKT", AdminController.updateLoaiHinhKiemTra);
AdminRoute.patch("/lhkt/:MaLHKT", AdminController.updateLoaiHinhKiemTra);
AdminRoute.delete("/lhkt/:MaLHKT", AdminController.deleteLoaiHinhKiemTra);

// ===== ThamSo (CRUD theo NamHoc) =====

// list tất cả tham số (optional filter: ?MaNamHoc=1)
AdminRoute.get("/thamso", AdminController.listThamSo);

// CRUD theo năm học
AdminRoute.post("/namhoc/:MaNH/thamso", AdminController.createThamSo);
AdminRoute.get("/namhoc/:MaNH/thamso", AdminController.getThamSoByNamHoc);
AdminRoute.put("/namhoc/:MaNH/thamso", AdminController.updateThamSoByNamHoc);
AdminRoute.patch("/namhoc/:MaNH/thamso", AdminController.updateThamSoByNamHoc);
AdminRoute.delete("/namhoc/:MaNH/thamso", AdminController.deleteThamSoByNamHoc);

// upsert riêng (để không “đánh đồng” PUT = upsert)
AdminRoute.put("/namhoc/:MaNH/thamso/upsert", AdminController.upsertThamSo);
AdminRoute.patch("/namhoc/:MaNH/thamso/upsert", AdminController.upsertThamSo);

// ===== Them lop =====
AdminRoute.post("/lop", AdminController.createLop);

export default AdminRoute;
