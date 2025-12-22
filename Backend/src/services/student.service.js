import { Op } from "sequelize";
import { HocSinhLop, Lop } from "../models/student.model.js";
import { BangDiemMon, CTBangDiemMonHocSinh, CTBangDiemMonLHKT } from "../models/gradebook.model.js";
import { LoaiHinhKiemTra, MonHoc } from "../models/academic.model.js";

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

    // preload LoaiHinhKiemTra for labeling + grouping
    const lhktList = await LoaiHinhKiemTra.findAll();
    const lhktMap = new Map(lhktList.map((x) => [x.MaLHKT, x.TenLHKT]));

    const classify = (ma, ten) => {
      const name = (ten || '').toLowerCase();
      if (name.includes('miệng') || name.includes('mieng')) return 'mieng';
      if (name.includes('15')) return '15p';
      if (name.includes('1 tiết') || name.includes('1t') || name.includes('tiết')) return '1tiet';
      if (name.includes('giữa') || name.includes('giuaki')) return 'giuaky';
      if (name.includes('cuối') || name.includes('cuoiki')) return 'cuoiky';
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
      const bdms = await BangDiemMon.findAll({ where: { MaLop: e.MaLop, MaHocKy } });

      const monScores = [];
      for (const bdm of bdms) {
        const ct = await CTBangDiemMonHocSinh.findOne({ where: { MaBangDiemMon: bdm.MaBangDiemMon, MaHocSinh } });
        const mon = await MonHoc.findByPk(bdm.MaMon);

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
          TenMonHoc: mon?.TenMonHoc ?? null,
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
        MaHocKy,
        DiemTBHK: e.DiemTBHK ?? null,
        monScores,
      });
    }

    return result;
  }
}
