import { Op } from "sequelize";
import { KhoiLop, MonHoc, HocKy, NamHoc, LoaiHinhKiemTra } from "../models/academic.model.js";
import { Lop } from "../models/student.model.js";
import { ThamSo } from "../models/config.model.js";
import sequelize from "../configs/sequelize.js";

// ===================== Helpers: NAMHOC =====================
function parseNamHoc(namHocText) {
  if (namHocText == null) return null;

  const s = String(namHocText).trim();
  const m = s.match(/^(\d{4})\s*[-/–—]\s*(\d{4})$/);
  if (!m) {
    throw { status: 400, message: "NamHoc phải có dạng YYYY-YYYY (vd: 2024-2025)" };
  }

  const Nam1 = Number(m[1]);
  const Nam2 = Number(m[2]);

  if (!Number.isInteger(Nam1) || !Number.isInteger(Nam2)) {
    throw { status: 400, message: "NamHoc không hợp lệ" };
  }
  if (Nam2 !== Nam1 + 1) {
    throw { status: 400, message: "NamHoc phải là 2 năm liên tiếp (vd: 2024-2025)" };
  }

  return { Nam1, Nam2 };
}

async function findOrCreateNamHoc({ Nam1, Nam2 }, t) {
  const [row] = await NamHoc.findOrCreate({
    where: { Nam1, Nam2 },
    defaults: { Nam1, Nam2 },
    transaction: t,
  });
  return row; // row.MaNH
}

// ===================== Helpers: THAMSO =====================
function mapThamSoPayload(payload = {}) {
  // Hỗ trợ cả camelCase (FE) lẫn PascalCase (DB/service cũ)
  return {
    TuoiToiThieu: payload.tuoiToiThieu ?? payload.TuoiToiThieu ?? null,
    TuoiToiDa: payload.tuoiToiDa ?? payload.TuoiToiDa ?? null,
    SiSoToiDa: payload.soHocSinhToiDa1Lop ?? payload.SiSoToiDa ?? null,

    DiemToiThieu: payload.diemToiThieu ?? payload.DiemToiThieu ?? null,
    DiemToiDa: payload.diemToiDa ?? payload.DiemToiDa ?? null,

    DiemDatMon: payload.diemDatToiThieu ?? payload.DiemDatMon ?? null,
    DiemDat: payload.diemToiThieuHocKy ?? payload.DiemDat ?? null,
  };
}

function validateThamSo(data) {
  const isIntOrNull = (v) =>
    v == null || (Number.isInteger(v) && Number.isFinite(v));

  // int check
  for (const k of [
    "TuoiToiThieu",
    "TuoiToiDa",
    "SiSoToiDa",
    "DiemToiThieu",
    "DiemToiDa",
    "DiemDatMon",
    "DiemDat",
  ]) {
    if (!isIntOrNull(data[k])) {
      throw { status: 400, message: `${k} phải là số nguyên (hoặc null)` };
    }
  }

  // range check
  if (data.TuoiToiThieu != null && data.TuoiToiDa != null && data.TuoiToiThieu > data.TuoiToiDa) {
    throw { status: 400, message: "TuoiToiThieu phải <= TuoiToiDa" };
  }
  if (data.DiemToiThieu != null && data.DiemToiDa != null && data.DiemToiThieu > data.DiemToiDa) {
    throw { status: 400, message: "DiemToiThieu phải <= DiemToiDa" };
  }

  // nếu bạn muốn enforce điểm 0..10 thì bật đoạn này
  // const in0to10 = (v) => v == null || (v >= 0 && v <= 10);
  // for (const k of ["DiemToiThieu","DiemToiDa","DiemDatMon","DiemDat"]) {
  //   if (!in0to10(data[k])) throw { status: 400, message: `${k} phải trong [0..10]` };
  // }
}

export class AdminService {
  // ===== KHOI LOP =====
  static async createKhoiLop({ TenKL, SoLop = null }) {
    if (!TenKL) throw { status: 400, message: "TenKL is required" };
    return await KhoiLop.create({ TenKL, SoLop });
  }

  static async updateKhoiLop(MaKL, { TenKL, SoLop }) {
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
    const maKls = khois.map((k) => k.MaKL);
    const lops = await Lop.findAll({
      where: { MaKhoiLop: { [Op.in]: maKls } },
      order: [["MaLop", "ASC"]],
    });

    const map = new Map();
    for (const lop of lops) {
      const key = lop.MaKhoiLop;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(lop);
    }
    return khois.map((k) => ({ ...k.toJSON(), danhSachLop: map.get(k.MaKL) || [] }));
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
  static async createHocKy({ TenHK, NamHoc: NamHocText, NgayBatDau = null, NgayKetThuc = null }) {
    if (!TenHK) throw { status: 400, message: "TenHK is required" };
    if (!NamHocText) throw { status: 400, message: "NamHoc is required (vd: 2024-2025)" };

    if (NgayBatDau && NgayKetThuc && new Date(NgayBatDau) > new Date(NgayKetThuc)) {
      throw { status: 400, message: "NgayBatDau phải <= NgayKetThuc" };
    }

    const years = parseNamHoc(NamHocText);

    return await sequelize.transaction(async (t) => {
      const nh = await findOrCreateNamHoc(years, t);

      const hk = await HocKy.create(
        { TenHK, MaNamHoc: nh.MaNH, NgayBatDau, NgayKetThuc },
        { transaction: t }
      );

      return hk;
    });
  }

  static async updateHocKy(MaHK, payload) {
    const row = await HocKy.findByPk(MaHK);
    if (!row) throw { status: 404, message: "HocKy not found" };

    const next = {
      TenHK: payload.TenHK ?? row.TenHK,
      NgayBatDau: payload.NgayBatDau ?? row.NgayBatDau,
      NgayKetThuc: payload.NgayKetThuc ?? row.NgayKetThuc,
      MaNamHoc: row.MaNamHoc,
    };

    if (next.NgayBatDau && next.NgayKetThuc && new Date(next.NgayBatDau) > new Date(next.NgayKetThuc)) {
      throw { status: 400, message: "NgayBatDau phải <= NgayKetThuc" };
    }

    const hasNamHocText = payload.NamHoc != null && String(payload.NamHoc).trim() !== "";
    const hasMaNamHoc = payload.MaNamHoc != null;

    return await sequelize.transaction(async (t) => {
      if (hasNamHocText) {
        const years = parseNamHoc(payload.NamHoc);
        const nh = await findOrCreateNamHoc(years, t);
        next.MaNamHoc = nh.MaNH;
      } else if (hasMaNamHoc) {
        next.MaNamHoc = payload.MaNamHoc;
      }

      await row.update(next, { transaction: t });
      return row;
    });
  }

  static async deleteHocKy(MaHK) {
    const row = await HocKy.findByPk(MaHK);
    if (!row) throw { status: 404, message: "HocKy not found" };
    await row.destroy();
    return { deleted: true };
  }

  static async listHocKy({ MaNamHoc = null, NamHoc: NamHocText = null } = {}) {
    const where = {};

    if (NamHocText) {
      const years = parseNamHoc(NamHocText);
      const nh = await NamHoc.findOne({ where: years });
      if (!nh) return [];
      where.MaNamHoc = nh.MaNH;
    } else if (MaNamHoc != null) {
      where.MaNamHoc = MaNamHoc;
    }

    return await HocKy.findAll({
      where,
      order: [["MaHK", "ASC"]],
      include: [
        {
          model: NamHoc,
          as: "namHoc", // cần initAssociations có HocKy.belongsTo(NamHoc,{as:"namHoc"})
          attributes: ["MaNH", "Nam1", "Nam2"],
          required: false,
        },
      ],
    });
  }

  // ===== THAM SO (CRUD) =====

  // CREATE (theo năm học): nếu đã có rồi thì báo 409
  static async createThamSo({ MaNamHoc, ...payload }) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    const existed = await ThamSo.findOne({ where: { MaNamHoc } });
    if (existed) throw { status: 409, message: "ThamSo của năm học này đã tồn tại (dùng update/upsert)" };

    const data = { ...mapThamSoPayload(payload), MaNamHoc };
    validateThamSo(data);

    return await ThamSo.create(data);
  }

  // UPSERT (theo năm học): đã có thì update, chưa có thì create
  static async upsertThamSoByNamHoc(MaNamHoc, payload) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    const data = { ...mapThamSoPayload(payload), MaNamHoc };
    validateThamSo(data);

    const existed = await ThamSo.findOne({ where: { MaNamHoc } });
    if (!existed) return await ThamSo.create(data);

    await existed.update(data);
    return existed;
  }

  // READ ONE theo MaNamHoc
  static async getThamSoByNamHoc(MaNamHoc) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    const row = await ThamSo.findOne({
      where: { MaNamHoc },
      include: [
        {
          model: NamHoc,
          as: "namHoc", // cần initAssociations ThamSo.belongsTo(NamHoc,{as:"namHoc"})
          attributes: ["MaNH", "Nam1", "Nam2"],
          required: false,
        },
      ],
    });

    if (!row) throw { status: 404, message: "ThamSo not found" };
    return row;
  }

  // READ ONE theo MaThamSo (nếu bạn cần)
  static async getThamSoById(MaThamSo) {
    const row = await ThamSo.findByPk(MaThamSo, {
      include: [
        { model: NamHoc, as: "namHoc", attributes: ["MaNH", "Nam1", "Nam2"], required: false },
      ],
    });
    if (!row) throw { status: 404, message: "ThamSo not found" };
    return row;
  }

  // LIST
  static async listThamSo({ MaNamHoc = null } = {}) {
    const where = {};
    if (MaNamHoc != null) where.MaNamHoc = MaNamHoc;

    return await ThamSo.findAll({
      where,
      order: [["MaNamHoc", "ASC"]],
      include: [
        { model: NamHoc, as: "namHoc", attributes: ["MaNH", "Nam1", "Nam2"], required: false },
      ],
    });
  }

  // UPDATE theo MaNamHoc
  static async updateThamSoByNamHoc(MaNamHoc, payload) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    const row = await ThamSo.findOne({ where: { MaNamHoc } });
    if (!row) throw { status: 404, message: "ThamSo not found" };

    const mapped = mapThamSoPayload(payload);

    const next = {
      TuoiToiThieu: mapped.TuoiToiThieu ?? row.TuoiToiThieu,
      TuoiToiDa: mapped.TuoiToiDa ?? row.TuoiToiDa,
      SiSoToiDa: mapped.SiSoToiDa ?? row.SiSoToiDa,
      DiemToiThieu: mapped.DiemToiThieu ?? row.DiemToiThieu,
      DiemToiDa: mapped.DiemToiDa ?? row.DiemToiDa,
      DiemDatMon: mapped.DiemDatMon ?? row.DiemDatMon,
      DiemDat: mapped.DiemDat ?? row.DiemDat,
      MaNamHoc: row.MaNamHoc,
    };

    validateThamSo(next);

    await row.update(next);
    return row;
  }

  // UPDATE theo MaThamSo (nếu bạn cần)
  static async updateThamSoById(MaThamSo, payload) {
    const row = await ThamSo.findByPk(MaThamSo);
    if (!row) throw { status: 404, message: "ThamSo not found" };

    const mapped = mapThamSoPayload(payload);
    const next = {
      TuoiToiThieu: mapped.TuoiToiThieu ?? row.TuoiToiThieu,
      TuoiToiDa: mapped.TuoiToiDa ?? row.TuoiToiDa,
      SiSoToiDa: mapped.SiSoToiDa ?? row.SiSoToiDa,
      DiemToiThieu: mapped.DiemToiThieu ?? row.DiemToiThieu,
      DiemToiDa: mapped.DiemToiDa ?? row.DiemToiDa,
      DiemDatMon: mapped.DiemDatMon ?? row.DiemDatMon,
      DiemDat: mapped.DiemDat ?? row.DiemDat,
      MaNamHoc: row.MaNamHoc,
    };

    validateThamSo(next);

    await row.update(next);
    return row;
  }

  // DELETE theo MaNamHoc
  static async deleteThamSoByNamHoc(MaNamHoc) {
    if (MaNamHoc == null) throw { status: 400, message: "MaNamHoc is required" };

    const row = await ThamSo.findOne({ where: { MaNamHoc } });
    if (!row) throw { status: 404, message: "ThamSo not found" };

    await row.destroy();
    return { deleted: true };
  }

  // DELETE theo MaThamSo (nếu bạn cần)
  static async deleteThamSoById(MaThamSo) {
    const row = await ThamSo.findByPk(MaThamSo);
    if (!row) throw { status: 404, message: "ThamSo not found" };
    await row.destroy();
    return { deleted: true };
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

  // ===== LOP =====
  static async createLop({ TenLop, MaKhoiLop, MaNamHoc, SiSo = null }) {
    if (!TenLop) throw { status: 400, message: "TenLop is required" };
    if (MaKhoiLop == null || MaNamHoc == null) throw { status: 400, message: "MaKhoiLop & MaNamHoc are required" };
    return await Lop.create({ TenLop, MaKhoiLop, MaNamHoc, SiSo });
  }
}
