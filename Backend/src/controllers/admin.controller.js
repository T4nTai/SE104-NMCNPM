import { AdminService } from "../services/admin.service.js";

export class AdminController {
  // ===== KHOI LOP =====
  static async createKhoiLop(req, res, next) {
    try {
      const row = await AdminService.createKhoiLop(req.body);
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  static async listKhoiLop(req, res, next) {
    try {
      const includeClasses = String(req.query.includeClasses || "false") === "true";
      const rows = await AdminService.listKhoiLop({ includeClasses });
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  static async updateKhoiLop(req, res, next) {
    try {
      const { MaKL } = req.params;
      const row = await AdminService.updateKhoiLop(Number(MaKL), req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteKhoiLop(req, res, next) {
    try {
      const { MaKL } = req.params;
      const result = await AdminService.deleteKhoiLop(Number(MaKL));
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // ===== MON HOC =====
  static async createMonHoc(req, res, next) {
    try {
      const row = await AdminService.createMonHoc(req.body);
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  static async listMonHoc(req, res, next) {
    try {
      const rows = await AdminService.listMonHoc();
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  static async updateMonHoc(req, res, next) {
    try {
      const { MaMonHoc } = req.params;
      const row = await AdminService.updateMonHoc(Number(MaMonHoc), req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteMonHoc(req, res, next) {
    try {
      const { MaMonHoc } = req.params;
      const result = await AdminService.deleteMonHoc(Number(MaMonHoc));
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // ===== HOC KY =====
  static async createHocKy(req, res, next) {
    try {
      const row = await AdminService.createHocKy(req.body);
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  static async listHocKy(req, res, next) {
    try {
      const rows = await AdminService.listHocKy();
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  static async updateHocKy(req, res, next) {
    try {
      const { MaHK } = req.params;
      const row = await AdminService.updateHocKy(Number(MaHK), req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteHocKy(req, res, next) {
    try {
      const { MaHK } = req.params;
      const result = await AdminService.deleteHocKy(Number(MaHK));
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // ===== LOAI HINH KIEM TRA =====
  static async createLoaiHinhKiemTra(req, res, next) {
    try {
      const row = await AdminService.createLoaiHinhKiemTra(req.body);
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  static async listLoaiHinhKiemTra(req, res, next) {
    try {
      const rows = await AdminService.listLoaiHinhKiemTra();
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  static async updateLoaiHinhKiemTra(req, res, next) {
    try {
      const { MaLHKT } = req.params;
      const row = await AdminService.updateLoaiHinhKiemTra(Number(MaLHKT), req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteLoaiHinhKiemTra(req, res, next) {
    try {
      const { MaLHKT } = req.params;
      const result = await AdminService.deleteLoaiHinhKiemTra(Number(MaLHKT));
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // ===== THAM SO THEO NAM HOC (UPSERT) =====
  static async upsertThamSo(req, res, next) {
    try {
      const { MaNH } = req.params; // MaNamHoc
      const row = await AdminService.upsertThamSoByNamHoc(Number(MaNH), req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  // ===== THEM LOP =====
  static async createLop(req, res, next) {
    try {
      const row = await AdminService.createLop(req.body);
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }
}
