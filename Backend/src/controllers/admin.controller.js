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
      const id = Number(req.params.MaKL);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaKL không hợp lệ" };

      const row = await AdminService.updateKhoiLop(id, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteKhoiLop(req, res, next) {
    try {
      const id = Number(req.params.MaKL);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaKL không hợp lệ" };

      const result = await AdminService.deleteKhoiLop(id);
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
      const id = Number(req.params.MaMonHoc);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaMonHoc không hợp lệ" };

      const row = await AdminService.updateMonHoc(id, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteMonHoc(req, res, next) {
    try {
      const id = Number(req.params.MaMonHoc);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaMonHoc không hợp lệ" };

      const result = await AdminService.deleteMonHoc(id);
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
      // hỗ trợ filter:
      // /admin/hocky?NamHoc=2024-2025
      // /admin/hocky?MaNamHoc=1
      const MaNamHoc = req.query.MaNamHoc != null ? Number(req.query.MaNamHoc) : null;
      if (req.query.MaNamHoc != null && !Number.isInteger(MaNamHoc)) {
        throw { status: 400, message: "MaNamHoc không hợp lệ" };
      }

      const rows = await AdminService.listHocKy({
        MaNamHoc,
        NamHoc: req.query.NamHoc ?? null,
      });
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  static async updateHocKy(req, res, next) {
    try {
      const id = Number(req.params.MaHK);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaHK không hợp lệ" };

      const row = await AdminService.updateHocKy(id, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteHocKy(req, res, next) {
    try {
      const id = Number(req.params.MaHK);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaHK không hợp lệ" };

      const result = await AdminService.deleteHocKy(id);
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
      const id = Number(req.params.MaLHKT);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaLHKT không hợp lệ" };

      const row = await AdminService.updateLoaiHinhKiemTra(id, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteLoaiHinhKiemTra(req, res, next) {
    try {
      const id = Number(req.params.MaLHKT);
      if (!Number.isInteger(id)) throw { status: 400, message: "MaLHKT không hợp lệ" };

      const result = await AdminService.deleteLoaiHinhKiemTra(id);
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // ===== THAM SO (CRUD theo NAM HOC) =====

  // POST /admin/namhoc/:MaNH/thamso
  static async createThamSo(req, res, next) {
    try {
      const MaNamHoc = Number(req.params.MaNH);
      if (!Number.isInteger(MaNamHoc)) throw { status: 400, message: "MaNH không hợp lệ" };

      const row = await AdminService.createThamSo({ MaNamHoc, ...req.body });
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  // GET /admin/thamso?MaNamHoc=1
  static async listThamSo(req, res, next) {
    try {
      const MaNamHoc = req.query.MaNamHoc != null ? Number(req.query.MaNamHoc) : null;
      if (req.query.MaNamHoc != null && !Number.isInteger(MaNamHoc)) {
        throw { status: 400, message: "MaNamHoc không hợp lệ" };
      }

      const rows = await AdminService.listThamSo({ MaNamHoc });
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  // GET /admin/namhoc/:MaNH/thamso
  static async getThamSoByNamHoc(req, res, next) {
    try {
      const MaNamHoc = Number(req.params.MaNH);
      if (!Number.isInteger(MaNamHoc)) throw { status: 400, message: "MaNH không hợp lệ" };

      const row = await AdminService.getThamSoByNamHoc(MaNamHoc);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  // PUT /admin/namhoc/:MaNH/thamso
  static async updateThamSoByNamHoc(req, res, next) {
    try {
      const MaNamHoc = Number(req.params.MaNH);
      if (!Number.isInteger(MaNamHoc)) throw { status: 400, message: "MaNH không hợp lệ" };

      const row = await AdminService.updateThamSoByNamHoc(MaNamHoc, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  // DELETE /admin/namhoc/:MaNH/thamso
  static async deleteThamSoByNamHoc(req, res, next) {
    try {
      const MaNamHoc = Number(req.params.MaNH);
      if (!Number.isInteger(MaNamHoc)) throw { status: 400, message: "MaNH không hợp lệ" };

      const result = await AdminService.deleteThamSoByNamHoc(MaNamHoc);
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // UPSERT: PUT /admin/namhoc/:MaNH/thamso/upsert (hoặc route bạn đang dùng)
  static async upsertThamSo(req, res, next) {
    try {
      const MaNamHoc = Number(req.params.MaNH);
      if (!Number.isInteger(MaNamHoc)) throw { status: 400, message: "MaNH không hợp lệ" };

      const row = await AdminService.upsertThamSoByNamHoc(MaNamHoc, req.body);
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
