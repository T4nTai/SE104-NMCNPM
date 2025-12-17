import { Op } from "sequelize";
import { KhoiLop, MonHoc, HocKy, NamHoc, LoaiHinhKiemTra } from "../models/academic.model.js";
import { Lop } from "../models/student.model.js";
import { ThamSo } from "../models/config.model.js";

export class AdminService {
  // ===== KHOI LOP =====
  static async createKhoiLop({ TenKL, SoLop = null }) {
    if (!TenKL) throw { status: 400, message: "TenKL is required" };
    return await KhoiLop.create({ TenKL, SoLop });
  }

  static async updateKhoiLop(MaKL, { TenKL,  SoLop }) {
    const row = await KhoiLop.findByPk(MaKL);
    if (!row) throw { status: 404, message: "KhoiLop not found" };
    await row.update({
      TenKL: TenKL ?? row.TenKL,
      SoLop: SoLop ?? row.SoLop,
    });
    return row;
  }

  static async deleteKhoiLop(MaKL) {
    const countLop = await Lop.count({ where: { MaKhoiLop: MaKL } });
    if (countLop > 0) throw { status: 400, message: "Không thể xoá khối vì đang có lớp thuộc khối" };
    const row = await KhoiLop.findByPk(MaKL);
    if (!row) throw { status: 404, message: "KhoiLop not found" };
    await row.destroy();
    return { deleted: true };
  }

  static async listKhoiLop({ includeClasses = false } = {}) {
    if (!includeClasses) return await KhoiLop.findAll({ order: [["MaKL", "ASC"]] });

    const khois = await KhoiLop.findAll({ order: [["MaKL", "ASC"]] });
    const maKls = khois.map(k => k.MaKL);
    const lops = await Lop.findAll({ where: { MaKhoiLop: { [Op.in]: maKls } }, order: [["MaLop", "ASC"]] });

    const map = new Map();
    for (const lop of lops) {
      const key = lop.MaKhoiLop;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(lop);
    }
    return khois.map(k => ({ ...k.toJSON(), danhSachLop: map.get(k.MaKL) || [] }));
  }

  // ===== MON HOC =====
  static async createMonHoc({ TenMonHoc, MaMon = null, HeSoMon, MoTa = null }) {
    if (!TenMonHoc) throw { status: 400, message: "TenMonHoc is required" };
    if (HeSoMon == null) throw { status: 400, message: "HeSoMon is required" };
    return await MonHoc.create({ TenMonHoc, MaMon, HeSoMon, MoTa });
  }

  static async updateMonHoc(MaMonHoc, payload) {
    const row = await MonHoc.findByPk(MaMonHoc);
    if (!row) throw { status: 404, message: "MonHoc not found" };
    await row.update({
      TenMonHoc: payload.TenMonHoc ?? row.TenMonHoc,
      MaMon: payload.MaMon ?? row.MaMon,
      HeSoMon: payload.HeSoMon ?? row.HeSoMon,
      MoTa: payload.MoTa ?? row.MoTa,
    });
    return row;
  }

  static async deleteMonHoc(MaMonHoc) {
    const row = await MonHoc.findByPk(MaMonHoc);
    if (!row) throw { status: 404, message: "MonHoc not found" };
    await row.destroy();
    return { deleted: true };
  }

  static async listMonHoc() {
    return await MonHoc.findAll({ order: [["MaMonHoc", "ASC"]] });
  }

  // ===== HOC KY =====
  static async createHocKy({ TenHK, MaNamHoc = null, NgayBatDau = null, NgayKetThuc = null }) {
    if (!TenHK) throw { status: 400, message: "TenHK is required" };
    return await HocKy.create({ TenHK, MaNamHoc, NgayBatDau, NgayKetThuc });
  }

  static async updateHocKy(MaHK, payload) {
    const row = await HocKy.findByPk(MaHK);
    if (!row) throw { status: 404, message: "HocKy not found" };
    await row.update({
      TenHK: payload.TenHK ?? row.TenHK,
      MaNamHoc: payload.MaNamHoc ?? row.MaNamHoc,
      NgayBatDau: payload.NgayBatDau ?? row.NgayBatDau,
      NgayKetThuc: payload.NgayKetThuc ?? row.NgayKetThuc
    });
    return row;
  }

  static async deleteHocKy(MaHK) {
    const row = await HocKy.findByPk(MaHK);
    if (!row) throw { status: 404, message: "HocKy not found" };
    await row.destroy();
    return { deleted: true };
  }

  static async listHocKy({ MaNamHoc = null } = {}) {
    const where = {};
    if (MaNamHoc != null) where.MaNamHoc = MaNamHoc;
    return await HocKy.findAll({ where, order: [["MaHK", "ASC"]] });
  }

  // ===== THAM SO THEO NAM HOC =====
  static async upsertThamSoByNamHoc(MaNamHoc, payload) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    // map yêu cầu -> cột THAMSO
    // - diem dat toi thieu -> Diem_Dat_Mon
    // - diem toi thieu hoc ky -> Diem_Dat
    // - so hoc sinh toi da 1 lop -> Si_So_Toi_Da
    // - tuoi toi thieu/toi da -> Tuoi_Toi_Thieu/Tuoi_Toi_Da
    const data = {
      Diem_Dat_Mon: payload.diemDatToiThieu ?? payload.Diem_Dat_Mon,
      Diem_Dat: payload.diemToiThieuHocKy ?? payload.Diem_Dat,
      Si_So_Toi_Da: payload.soHocSinhToiDa1Lop ?? payload.Si_So_Toi_Da,
      Tuoi_Toi_Thieu: payload.tuoiToiThieu ?? payload.Tuoi_Toi_Thieu,
      Tuoi_Toi_Da: payload.tuoiToiDa ?? payload.Tuoi_Toi_Da,
      MaNamHoc,
    };

    const existed = await ThamSo.findOne({ where: { MaNamHoc } });
    if (!existed) return await ThamSo.create(data);
    await existed.update(data);
    return existed;
  }


  // ===== TRONG SO DIEM (LOAIHINHKIEMTRA) =====
  static async createLoaiHinhKiemTra({ TenLHKT, HeSo }) {
    if (!TenLHKT) throw { status: 400, message: "TenLHKT is required" };
    if (HeSo == null) throw { status: 400, message: "HeSo is required" };
    return await LoaiHinhKiemTra.create({ TenLHKT, HeSo });
  }

  static async updateLoaiHinhKiemTra(MaLHKT, payload) {
    const row = await LoaiHinhKiemTra.findByPk(MaLHKT);
    if (!row) throw { status: 404, message: "LoaiHinhKiemTra not found" };
    await row.update({
      TenLHKT: payload.TenLHKT ?? row.TenLHKT,
      HeSo: payload.HeSo ?? row.HeSo,
    });
    return row;
  }

  static async deleteLoaiHinhKiemTra(MaLHKT) {
    const row = await LoaiHinhKiemTra.findByPk(MaLHKT);
    if (!row) throw { status: 404, message: "LoaiHinhKiemTra not found" };
    await row.destroy();
    return { deleted: true };
  }

  static async listLoaiHinhKiemTra() {
    return await LoaiHinhKiemTra.findAll({ order: [["MaLHKT", "ASC"]] });
  }

  static async createLop({ TenLop, MaKhoiLop, MaNamHoc, SiSo = null }) {
    if (!TenLop) throw { status: 400, message: "TenLop is required" };
    if (MaKhoiLop == null || MaNamHoc == null) throw { status: 400, message: "MaKhoiLop & MaNamHoc are required" };
    return await Lop.create({ TenLop, MaKhoiLop, MaNamHoc, SiSo });
  }
}
