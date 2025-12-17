import { TeacherService } from "../services/teacher.service.js";

export class TeacherController {
  static async listClasses(req, res, next) {
    try {
      const rows = await TeacherService.listClasses({
        MaNamHoc: req.query.MaNamHoc ? Number(req.query.MaNamHoc) : null,
        MaKhoiLop: req.query.MaKhoiLop ? Number(req.query.MaKhoiLop) : null,
      });
      res.json({ data: rows });
    } catch (e) { next(e); }
  }

  // POST /teacher/classes/:MaLop/semesters/:MaHocKy/students
  static async addStudentToClass(req, res, next) {
    try {
      const { MaLop, MaHocKy } = req.params;
      const row = await TeacherService.addStudentToClass({
        MaLop: Number(MaLop),
        MaHocKy: Number(MaHocKy),
        student: req.body,
      });
      res.status(201).json({ data: row });
    } catch (e) { next(e); }
  }

  static async updateStudent(req, res, next) {
    try {
      const { MaHocSinh } = req.params;
      const row = await TeacherService.updateStudent(MaHocSinh, req.body);
      res.json({ data: row });
    } catch (e) { next(e); }
  }

  static async deleteStudent(req, res, next) {
    try {
      const { MaHocSinh } = req.params;
      const result = await TeacherService.deleteStudent(MaHocSinh);
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // POST /teacher/gradebooks/enter
  static async enterGradebook(req, res, next) {
    try {
      const result = await TeacherService.enterGradebook(req.body);
      res.json({ data: result });
    } catch (e) { next(e); }
  }

  // GET /teacher/students/:MaHocSinh/scores?MaHocKy=
  static async lookupScoresOfStudent(req, res, next) {
    try {
      const { MaHocSinh } = req.params;
      const data = await TeacherService.lookupScoresOfStudent({
        MaHocSinh,
        MaHocKy: req.query.MaHocKy ? Number(req.query.MaHocKy) : null,
      });
      res.json({ data });
    } catch (e) { next(e); }
  }

  // GET /teacher/students/search?q=...
  static async searchStudents(req, res, next) {
    try {
      const data = await TeacherService.searchStudents({ q: req.query.q });
      res.json({ data });
    } catch (e) { next(e); }
  }
}
