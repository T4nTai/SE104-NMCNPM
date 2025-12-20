import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";

const AdminRoute = Router();

// Khoi Lop
AdminRoute.post("/khoilop", AdminController.createKhoiLop);
AdminRoute.get("/khoilop", AdminController.listKhoiLop);
AdminRoute.put("/khoilop/:MaKL", AdminController.updateKhoiLop);
AdminRoute.patch("/khoilop/:MaKL", AdminController.updateKhoiLop);
AdminRoute.delete("/khoilop/:MaKL", AdminController.deleteKhoiLop);

// Mon Hoc
AdminRoute.post("/monhoc", AdminController.createMonHoc);
AdminRoute.get("/monhoc", AdminController.listMonHoc);
AdminRoute.put("/monhoc/:MaMonHoc", AdminController.updateMonHoc);
AdminRoute.patch("/monhoc/:MaMonHoc", AdminController.updateMonHoc);
AdminRoute.delete("/monhoc/:MaMonHoc", AdminController.deleteMonHoc);

// Hoc Ky
AdminRoute.post("/hocky", AdminController.createHocKy);
AdminRoute.get("/hocky", AdminController.listHocKy);
AdminRoute.put("/hocky/:MaHK", AdminController.updateHocKy);
AdminRoute.patch("/hocky/:MaHK", AdminController.updateHocKy);
AdminRoute.delete("/hocky/:MaHK", AdminController.deleteHocKy);

// Loai Hinh Kiem Tra
AdminRoute.post("/lhkt", AdminController.createLoaiHinhKiemTra);
AdminRoute.get("/lhkt", AdminController.listLoaiHinhKiemTra);
AdminRoute.put("/lhkt/:MaLHKT", AdminController.updateLoaiHinhKiemTra);
AdminRoute.patch("/lhkt/:MaLHKT", AdminController.updateLoaiHinhKiemTra);
AdminRoute.delete("/lhkt/:MaLHKT", AdminController.deleteLoaiHinhKiemTra);

// Tham so theo nam hoc
AdminRoute.put("/namhoc/:MaNH/thamso", AdminController.upsertThamSo);
AdminRoute.patch("/namhoc/:MaNH/thamso", AdminController.upsertThamSo);

// Them lop
AdminRoute.post("/lop", AdminController.createLop);

export default AdminRoute;
