
import { Lop, HocSinhLop } from "../models/student.model.js";
import { MonHoc } from "../models/academic.model.js";
import { ThamSo } from "../models/config.model.js";
import { BangDiemMon, CTBangDiemMonHocSinh } from "../models/gradebook.model.js";

import { BaoCaoTKHK, BaoCaoTKMon, CTBaoCaoTKMon } from "../models/report.model.js";

export class ReportService {
  // ===== báo cáo HK theo lớp =====
  static async reportBySemesterAndClass({ MaHocKy, MaNamHoc, MaLop }) {
    const lop = await Lop.findByPk(MaLop);
    if (!lop) throw { status: 404, message: "Lop not found" };
    if (lop.MaNamHoc !== MaNamHoc) {
      // không bắt buộc, nhưng giúp đúng dữ liệu
    }

    const ts = await ThamSo.findOne({ where: { MaNamHoc } });
    const diemDatHK = ts?.Diem_Dat ?? 5;

    const enrolls = await HocSinhLop.findAll({ where: { MaLop, MaHocKy } });
    const total = enrolls.length;
    const soLuongDat = enrolls.filter(e => (e.DiemTBHK ?? -1) >= diemDatHK).length;
    const tiLeDat = total > 0 ? Number(((soLuongDat / total) * 100).toFixed(2)) : 0;

    // lưu vào BAOCAOTKHK (PK composite)
    const existed = await BaoCaoTKHK.findOne({ where: { MaHocKy, MaNamHoc, MaLop } });
    if (!existed) {
      await BaoCaoTKHK.create({ MaHocKy, MaNamHoc, MaLop, SoLuongDat: soLuongDat, TiLeDat: tiLeDat });
    } else {
      await existed.update({ SoLuongDat: soLuongDat, TiLeDat: tiLeDat });
    }

    return { MaHocKy, MaNamHoc, MaLop, SoLuongDat: soLuongDat, TiLeDat: tiLeDat };
  }

  // ===== báo cáo theo môn (một môn, một HK, một năm học) =====
  static async reportBySubject({ MaMon, MaHocKy, MaNamHoc }) {
    const ts = await ThamSo.findOne({ where: { MaNamHoc } });
    const diemDatMon = ts?.Diem_Dat_Mon ?? 5;

    // tìm tất cả lớp của năm học
    const lops = await Lop.findAll({ where: { MaNamHoc } });

    // đảm bảo bản ghi BAOCAOTKMON
    let bc = await BaoCaoTKMon.findOne({ where: { MaMon, MaHocKy, MaNamHoc } });
    if (!bc) bc = await BaoCaoTKMon.create({ MaMon, MaHocKy, MaNamHoc });

    // tính theo từng lớp: số lượng đạt môn trong HK
    for (const lop of lops) {
      const bdm = await BangDiemMon.findOne({ where: { MaLop: lop.MaLop, MaHocKy, MaMon } });
      if (!bdm) continue;

      const cts = await CTBangDiemMonHocSinh.findAll({ where: { MaBangDiemMon: bdm.MaBangDiemMon } });
      const total = cts.length;
      const soLuongDat = cts.filter(x => (x.DiemTBMon ?? -1) >= diemDatMon).length;
      const tiLeDat = total > 0 ? Number(((soLuongDat / total) * 100).toFixed(2)) : 0;

      const existed = await CTBaoCaoTKMon.findOne({ where: { MaBCTKMon: bc.MaBCTKMon, MaLop: lop.MaLop } });
      if (!existed) {
        await CTBaoCaoTKMon.create({ MaBCTKMon: bc.MaBCTKMon, MaLop: lop.MaLop, SoLuongDat: soLuongDat, TiLeDat: tiLeDat });
      } else {
        await existed.update({ SoLuongDat: soLuongDat, TiLeDat: tiLeDat });
      }
    }

    return { MaBCTKMon: bc.MaBCTKMon, MaMon, MaHocKy, MaNamHoc };
  }
}
