import sequelize  from "../configs/sequelize.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

import { Lop, HocSinh, HocSinhLop } from "../models/student.model.js";
import { MonHoc, LoaiHinhKiemTra, KhoiLop } from "../models/academic.model.js";
import { ThamSo } from "../models/config.model.js";
import { NguoiDung, NhomNguoiDung } from "../models/auth.model.js";
import { BangDiemMon, CTBangDiemMonHocSinh, CTBangDiemMonLHKT } from "../models/gradebook.model.js";

export class TeacherService {
  // ===== XEM DS LOP =====
  static async listClasses({ MaNamHoc = null, MaKhoiLop = null, MaHocKy = null } = {}) {
    const where = {};
    if (MaNamHoc != null) where.MaNamHoc = MaNamHoc;
    if (MaKhoiLop != null) where.MaKhoiLop = MaKhoiLop;
    
    const classes = await Lop.findAll({
      where,
      include: [{
        model: KhoiLop,
        as: "KhoiLop",
        attributes: ["TenKL"],
      }],
      order: [["MaLop", "ASC"]],
    });

    // Count students for each class if MaHocKy is provided
    if (MaHocKy) {
      const classesWithCount = await Promise.all(
        classes.map(async (cls) => {
          const count = await HocSinhLop.count({
            where: { MaLop: cls.MaLop, MaHocKy },
          });
          return {
            ...cls.toJSON(),
            SoLuongHocSinh: count,
            TenKhoiLop: cls.KhoiLop?.TenKL || null,
          };
        })
      );
      return classesWithCount;
    }

    return classes.map(cls => ({
      ...cls.toJSON(),
      TenKhoiLop: cls.KhoiLop?.TenKL || null,
    }));
  }

  // ===== LAY DS HOC SINH THEO LOP VA HOC KY =====
  static async getStudentsByClass({ MaLop, MaHocKy }) {
    if (!MaLop || !MaHocKy) throw { status: 400, message: "MaLop and MaHocKy are required" };
    
    const enrollments = await HocSinhLop.findAll({
      where: { MaLop, MaHocKy },
      include: [{
        model: HocSinh,
        as: "HocSinh",
      }],
      order: [["MaHocSinh", "ASC"]],
    });

    return enrollments.map(e => ({
      ...e.HocSinh?.toJSON(),
      DiemTBHK: e.DiemTBHK,
    }));
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

      // Enroll student to class/semester
      const enroll = await HocSinhLop.create({ MaLop, MaHocSinh, MaHocKy }, { transaction: t });

      // Auto-create student account if missing and email provided
      // Do inside transaction for DB, but email will be sent after commit.
      let createdAccount = null;
      if (Email) {
        const existedAcc = await NguoiDung.findOne({ where: { MaHocSinh }, transaction: t });
        if (!existedAcc) {
          const studentGroup = await NhomNguoiDung.findOne({ where: { TenNhomNguoiDung: "student" }, transaction: t });
          if (!studentGroup) throw { status: 500, message: "Chưa có nhóm 'student' trong NHOMNGUOIDUNG" };

          // username pattern: hs{MaHocSinh} (ensure unique by fallback with suffix)
          let TenDangNhap = `${MaHocSinh}`;
          const existedUsername = await NguoiDung.findOne({ where: { TenDangNhap }, transaction: t });
          if (existedUsername) {
            TenDangNhap = `hs${MaHocSinh}_${Date.now().toString().slice(-4)}`;
          }

          // generate random temporary password
          const tempPass = Math.random().toString(36).slice(-10);
          const MatKhau = await bcrypt.hash(tempPass, 10);

          const user = await NguoiDung.create(
            {
              TenDangNhap,
              MatKhau,
              HoVaTen: HoTen,
              Email,
              MaNhomNguoiDung: studentGroup.MaNhomNguoiDung,
              MaHocSinh,
            },
            { transaction: t }
          );

          createdAccount = { TenDangNhap, tempPass, Email, HoTen };
        }
      }

      // Attach meta to return (email will be sent after commit externally)
      return { enroll, createdAccount };
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

      // Xoá tài khoản người dùng gắn với học sinh để tránh lỗi FK
      await NguoiDung.destroy({ where: { MaHocSinh }, transaction: t });

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
  static async lookupScoresOfStudent({ MaHocSinh, MaHocKy = null, MaMon = null }) {
    // trả về điểm TB HK + chi tiết từng loại hình kiểm tra theo môn
    const whereEnroll = { MaHocSinh };
    if (MaHocKy != null) whereEnroll.MaHocKy = MaHocKy;

    const enrolls = await HocSinhLop.findAll({ where: whereEnroll, order: [["MaHocKy", "ASC"]] });

    // preload LoaiHinhKiemTra + helper map
    const lhktList = await LoaiHinhKiemTra.findAll();
    const lhktMap = new Map(lhktList.map((x) => [x.MaLHKT, x.TenLHKT]));

    const classify = (ma, ten) => {
      const name = (ten || '').toLowerCase();
      if (name.includes('miệng') || name.includes('mieng')) return 'mieng';
      if (name.includes('15')) return '15p';
      if (name.includes('1 tiết') || name.includes('1t') || name.includes('tiết')) return '1tiet';
      if (name.includes('giữa') || name.includes('giuaki')) return 'giuaky';
      if (name.includes('cuối') || name.includes('cuoiki')) return 'cuoiky';
      // fallback numeric mapping if TenLHKT không rõ
      if (Number(ma) === 1) return 'mieng';
      if (Number(ma) === 2) return '15p';
      if (Number(ma) === 3) return '1tiet';
      if (Number(ma) === 4) return 'giuaky';
      if (Number(ma) === 5) return 'cuoiky';
      return null;
    };

    const avg = (arr) => {
      const vals = arr.filter((x) => x != null && !Number.isNaN(Number(x))).map(Number);
      if (!vals.length) return null;
      return Number((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2));
    };

    const result = [];
    for (const e of enrolls) {
      const bdmWhere = { MaLop: e.MaLop, MaHocKy: e.MaHocKy };
      if (MaMon != null) bdmWhere.MaMon = MaMon;

      const bdms = await BangDiemMon.findAll({ where: bdmWhere });
      const monIds = bdms.map((b) => b.MaMon);
      const monList = monIds.length ? await MonHoc.findAll({ where: { MaMonHoc: { [Op.in]: monIds } } }) : [];
      const monMap = new Map(monList.map((m) => [m.MaMonHoc, m.TenMonHoc]));

      const monScores = [];
      for (const bdm of bdms) {
        const ct = await CTBangDiemMonHocSinh.findOne({
          where: { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh },
        });

        const details = ct
          ? await CTBangDiemMonLHKT.findAll({ where: { MaCTBangDiemMon: ct.MaCTBangDiemMon } })
          : [];

        const enriched = details.map((d) => ({
          MaLHKT: d.MaLHKT,
          TenLHKT: lhktMap.get(d.MaLHKT) || null,
          Lan: d.Lan,
          Diem: d.Diem,
        }));

        const bucket = { mieng: [], '15p': [], '1tiet': [], giuaky: [], cuoiky: [] };
        for (const d of enriched) {
          const tag = classify(d.MaLHKT, d.TenLHKT);
          if (tag && d.Diem != null) bucket[tag].push(Number(d.Diem));
        }

        monScores.push({
          MaMon: bdm.MaMon,
          TenMonHoc: monMap.get(bdm.MaMon) || null,
          MaBangDiemMon: bdm.MaBangDiemMon,
          DiemTBMon: ct?.DiemTBMon ?? null,
          DiemMieng: avg(bucket.mieng),
          Diem15Phut: avg(bucket['15p']),
          Diem1Tiet: avg(bucket['1tiet']),
          DiemGiuaKy: avg(bucket.giuaky),
          DiemCuoiKy: avg(bucket.cuoiky),
          details: enriched,
        });
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
