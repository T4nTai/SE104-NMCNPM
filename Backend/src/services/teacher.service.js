import sequelize  from "../configs/sequelize.js";
import { Op } from "sequelize";

import { Lop, HocSinh, HocSinhLop } from "../models/student.model.js";
import { MonHoc, LoaiHinhKiemTra } from "../models/academic.model.js";
import { ThamSo } from "../models/config.model.js";
import { BangDiemMon, CTBangDiemMonHocSinh, CTBangDiemMonLHKT } from "../models/gradebook.model.js";

export class TeacherService {
  // ===== XEM DS LOP =====
  static async listClasses({ MaNamHoc = null, MaKhoiLop = null } = {}) {
    const where = {};
    if (MaNamHoc != null) where.MaNamHoc = MaNamHoc;
    if (MaKhoiLop != null) where.MaKhoiLop = MaKhoiLop;
    return await Lop.findAll({ where, order: [["MaLop", "ASC"]] });
  }

  // ===== THEM HOC SINH VAO LOP =====
  static async addStudentToClass({
    MaLop,
    MaHocKy,
    student: { MaHocSinh, HoTen, GioiTinh, NgaySinh, Email = null, SDT = null, DiaChi = null, NgayTiepNhan = null, GhiChu = null },
  }) {
    if (MaLop == null || MaHocKy == null) throw { status: 400, message: "MaLop & MaHocKy are required" };
    if (MaHocSinh == null) throw { status: 400, message: "MaHocSinh is required (not auto)" };

    return await sequelize.transaction(async (t) => {
      const existed = await HocSinh.findByPk(MaHocSinh, { transaction: t });
      if (!existed) {
        if (!HoTen || !GioiTinh || !NgaySinh) throw { status: 400, message: "HoTen/GioiTinh/NgaySinh are required" };
        await HocSinh.create(
          { MaHocSinh, HoTen, GioiTinh, NgaySinh, Email, SDT, DiaChi, NgayTiepNhan, GhiChu },
          { transaction: t }
        );
      }

      const duplicated = await HocSinhLop.findOne({ where: { MaLop, MaHocSinh, MaHocKy }, transaction: t });
      if (duplicated) throw { status: 400, message: "Học sinh đã có trong lớp ở học kỳ này" };


      const lop = await Lop.findByPk(MaLop, { transaction: t });
      if (lop?.MaNamHoc) {
        const ts = await ThamSo.findOne({ where: { MaNamHoc: lop.MaNamHoc }, transaction: t });
        if (ts?.Si_So_Toi_Da) {
          const current = await HocSinhLop.count({ where: { MaLop, MaHocKy }, transaction: t });
          if (current + 1 > ts.Si_So_Toi_Da) throw { status: 400, message: "Vượt sĩ số tối đa của lớp" };
        }
      }

      return await HocSinhLop.create({ MaLop, MaHocSinh, MaHocKy }, { transaction: t });
    });
  }

  // ===== SUA / XOA HOC SINH =====
  static async updateStudent(MaHocSinh, payload) {
    const hs = await HocSinh.findByPk(MaHocSinh);
    if (!hs) throw { status: 404, message: "HocSinh not found" };
    await hs.update(payload);
    return hs;
  }

  static async deleteStudent(MaHocSinh) {
    // cẩn thận FK: xoá join + điểm trước
    return await sequelize.transaction(async (t) => {
      await CTBangDiemMonLHKT.destroy({ where: { }, transaction: t, individualHooks: false }); // nếu bạn có FK cascade thì bỏ dòng này
      await CTBangDiemMonHocSinh.destroy({ where: { MaHocSinh }, transaction: t });
      await HocSinhLop.destroy({ where: { MaHocSinh }, transaction: t });

      const hs = await HocSinh.findByPk(MaHocSinh, { transaction: t });
      if (!hs) throw { status: 404, message: "HocSinh not found" };
      await hs.destroy({ transaction: t });
      return { deleted: true };
    });
  }

  // ===== NHAP BANG DIEM (Lop + Mon + HocKy) =====
  /**
   * input ví dụ:
   * {
   *   MaLop, MaHocKy, MaMon,
   *   scores: [
   *     { MaHocSinh: 1001, details: [ { MaLHKT: 1, Lan: 1, Diem: 7.5 }, ... ] },
   *     ...
   *   ]
   * }
   */
  static async enterGradebook({ MaLop, MaHocKy, MaMon, scores }) {
    if (MaLop == null || MaHocKy == null || MaMon == null) throw { status: 400, message: "MaLop/MaHocKy/MaMon are required" };
    if (!Array.isArray(scores)) throw { status: 400, message: "scores must be array" };

    return await sequelize.transaction(async (t) => {
      // 1) ensure BangDiemMon exists
      let bdm = await BangDiemMon.findOne({ where: { MaLop, MaHocKy, MaMon }, transaction: t });
      if (!bdm) bdm = await BangDiemMon.create({ MaLop, MaHocKy, MaMon }, { transaction: t });

      // 2) preload weights
      const lhktList = await LoaiHinhKiemTra.findAll({ transaction: t });
      const weightMap = new Map(lhktList.map(x => [x.MaLHKT, Number(x.HeSo)]));

      // 3) upsert each student
      for (const s of scores) {
        const MaHocSinh = s.MaHocSinh;
        if (MaHocSinh == null) continue;

        let ct = await CTBangDiemMonHocSinh.findOne({
          where: { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh },
          transaction: t,
        });
        if (!ct) {
          ct = await CTBangDiemMonHocSinh.create(
            { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh, DiemTBMon: null },
            { transaction: t }
          );
        }

        // 4) upsert detail scores
        const details = Array.isArray(s.details) ? s.details : [];
        for (const d of details) {
          if (d.MaLHKT == null || d.Lan == null) continue;
          const existed = await CTBangDiemMonLHKT.findOne({
            where: { MaCTBangDiemMon: ct.MaCTBangDiemMon, MaLHKT: d.MaLHKT, Lan: d.Lan },
            transaction: t,
          });

          if (!existed) {
            await CTBangDiemMonLHKT.create(
              { MaCTBangDiemMon: ct.MaCTBangDiemMon, MaLHKT: d.MaLHKT, Lan: d.Lan, Diem: d.Diem ?? null },
              { transaction: t }
            );
          } else {
            await existed.update({ Diem: d.Diem ?? existed.Diem }, { transaction: t });
          }
        }

        // 5) compute DiemTBMon (weighted)
        const all = await CTBangDiemMonLHKT.findAll({
          where: { MaCTBangDiemMon: ct.MaCTBangDiemMon },
          transaction: t,
        });

        let sum = 0, wsum = 0;
        for (const r of all) {
          const w = weightMap.get(r.MaLHKT) ?? 1;
          if (r.Diem == null) continue;
          sum += Number(r.Diem) * w;
          wsum += w;
        }
        const DiemTBMon = wsum > 0 ? Number((sum / wsum).toFixed(2)) : null;
        await ct.update({ DiemTBMon }, { transaction: t });
      }

      // 6) cập nhật DiemTBHK cho từng học sinh trong lớp/học kỳ (gộp theo hệ số môn)
      await this.recalculateSemesterAverages({ MaLop, MaHocKy }, t);

      return { ok: true, MaBangDiemMon: bdm.MaBangDiemMon };
    });
  }

  static async recalculateSemesterAverages({ MaLop, MaHocKy }, transaction) {
    // lấy tất cả bảng điểm môn của lớp/học kỳ
    const bdms = await BangDiemMon.findAll({ where: { MaLop, MaHocKy }, transaction });
    if (bdms.length === 0) return;

    const monIds = bdms.map(x => x.MaMon);
    const monList = await MonHoc.findAll({ where: { MaMonHoc: { [Op.in]: monIds } }, transaction });
    const monHeSo = new Map(monList.map(m => [m.MaMonHoc, Number(m.HeSoMon)]));

    // lấy chi tiết điểm TB môn theo học sinh
    const ctList = await CTBangDiemMonHocSinh.findAll({
      where: { MaBangDiemMon: { [Op.in]: bdms.map(b => b.MaBangDiemMon) } },
      transaction,
    });

    // group by MaHocSinh
    const acc = new Map(); // MaHocSinh -> {sum, wsum}
    for (const ct of ctList) {
      const bdm = bdms.find(b => b.MaBangDiemMon === ct.MaBangDiemMon);
      const w = monHeSo.get(bdm.MaMon) ?? 1;
      if (ct.DiemTBMon == null) continue;

      if (!acc.has(ct.MaHocSinh)) acc.set(ct.MaHocSinh, { sum: 0, wsum: 0 });
      const cur = acc.get(ct.MaHocSinh);
      cur.sum += Number(ct.DiemTBMon) * w;
      cur.wsum += w;
    }

    for (const [MaHocSinh, v] of acc.entries()) {
      const DiemTBHK = v.wsum > 0 ? Number((v.sum / v.wsum).toFixed(2)) : null;
      const hsLop = await HocSinhLop.findOne({ where: { MaLop, MaHocSinh, MaHocKy }, transaction });
      if (hsLop) await hsLop.update({ DiemTBHK }, { transaction });
    }
  }

  // ===== TRA CUU DIEM =====
  static async lookupScoresOfStudent({ MaHocSinh, MaHocKy = null }) {
    // trả về điểm TB HK + các môn
    const whereEnroll = { MaHocSinh };
    if (MaHocKy != null) whereEnroll.MaHocKy = MaHocKy;

    const enrolls = await HocSinhLop.findAll({ where: whereEnroll, order: [["MaHocKy", "ASC"]] });

    // lấy BANGDIEMMON + CT theo học sinh
    const result = [];
    for (const e of enrolls) {
      const bdms = await BangDiemMon.findAll({ where: { MaLop: e.MaLop, MaHocKy: e.MaHocKy } });
      const monScores = [];

      for (const bdm of bdms) {
        const ct = await CTBangDiemMonHocSinh.findOne({
          where: { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh },
        });
        monScores.push({ MaMon: bdm.MaMon, MaBangDiemMon: bdm.MaBangDiemMon, DiemTBMon: ct?.DiemTBMon ?? null });
      }

      result.push({
        MaLop: e.MaLop,
        MaHocKy: e.MaHocKy,
        DiemTBHK: e.DiemTBHK ?? null,
        monScores,
      });
    }

    return result;
  }

  // ===== TRA CUU HOC SINH =====
  static async searchStudents({ q }) {
    if (!q) return [];
    return await HocSinh.findAll({
      where: {
        [Op.or]: [
          { HoTen: { [Op.like]: `%${q}%` } },
          { MaHocSinh: q },
          { Email: { [Op.like]: `%${q}%` } },
          { SDT: { [Op.like]: `%${q}%` } },
        ],
      },
      limit: 50,
    });
  }
}
