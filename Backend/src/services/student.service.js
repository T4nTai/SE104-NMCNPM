import { Op } from "sequelize";
import { HocSinhLop, Lop } from "../models/student.model.js";
import { BangDiemMon, CTBangDiemMonHocSinh } from "../models/gradebook.model.js";
import { MonHoc } from "../models/academic.model.js";

export class StudentService {
  static async getMyClasses({ MaHocSinh, MaHocKy = null }) {
    const where = { MaHocSinh };
    if (MaHocKy != null) where.MaHocKy = MaHocKy;

    const enrolls = await HocSinhLop.findAll({ where, order: [["MaHocKy", "ASC"]] });
    const maLops = enrolls.map(e => e.MaLop);
    const lops = await Lop.findAll({ where: { MaLop: { [Op.in]: maLops } } });

    const map = new Map(lops.map(l => [l.MaLop, l]));
    return enrolls.map(e => ({
      MaHocKy: e.MaHocKy,
      MaLop: e.MaLop,
      TenLop: map.get(e.MaLop)?.TenLop ?? null,
      DiemTBHK: e.DiemTBHK ?? null,
    }));
  }

  static async getMyScoresBySemester({ MaHocSinh, MaHocKy }) {
    // lấy các lớp học trong học kỳ đó
    const enrolls = await HocSinhLop.findAll({ where: { MaHocSinh, MaHocKy } });

    const result = [];
    for (const e of enrolls) {
      const bdms = await BangDiemMon.findAll({ where: { MaLop: e.MaLop, MaHocKy } });

      const monScores = [];
      for (const bdm of bdms) {
        const ct = await CTBangDiemMonHocSinh.findOne({ where: { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh } });
        const mon = await MonHoc.findByPk(bdm.MaMon);

        monScores.push({
          MaMon: bdm.MaMon,
          TenMonHoc: mon?.TenMonHoc ?? null,
          DiemTBMon: ct?.DiemTBMon ?? null,
        });
      }

      result.push({
        MaLop: e.MaLop,
        MaHocKy,
        DiemTBHK: e.DiemTBHK ?? null,
        monScores,
      });
    }

    return result;
  }
}
