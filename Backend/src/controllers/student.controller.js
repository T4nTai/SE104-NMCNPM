import { StudentService } from "../services/student.service.js";

export class StudentController {
  static async meClasses(req, res, next) {
    try {
      const MaHocSinh = req.user?.MaHocSinh;
      if (!MaHocSinh) throw { status: 403, message: "Tài khoản không liên kết học sinh" };

      const data = await StudentService.getMyClasses({
        MaHocSinh,
        MaHocKy: req.query.MaHocKy ? Number(req.query.MaHocKy) : null,
      });
      res.json({ data });
    } catch (e) { next(e); }
  }

  static async meScores(req, res, next) {
    try {
      const MaHocSinh = req.user?.MaHocSinh;
      if (!MaHocSinh) throw { status: 403, message: "Tài khoản không liên kết học sinh" };

      const { MaHocKy } = req.query;
      if (!MaHocKy) throw { status: 400, message: "MaHocKy is required" };

      const data = await StudentService.getMyScoresBySemester({
        MaHocSinh,
        MaHocKy: Number(MaHocKy),
      });
      res.json({ data });
    } catch (e) { next(e); }
  }
}
