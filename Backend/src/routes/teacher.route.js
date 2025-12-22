import { Router } from "express";
import { TeacherController } from "../controllers/teacher.controller.js";

const TeacherRoute = Router();

TeacherRoute.get("/classes", TeacherController.listClasses);
TeacherRoute.get("/classes/:MaLop/semesters/:MaHocKy/students", TeacherController.getStudentsByClass);

TeacherRoute.post("/classes/:MaLop/semesters/:MaHocKy/students", TeacherController.addStudentToClass);

TeacherRoute.put("/students/:MaHocSinh", TeacherController.updateStudent);
TeacherRoute.patch("/students/:MaHocSinh", TeacherController.updateStudent);
TeacherRoute.delete("/students/:MaHocSinh", TeacherController.deleteStudent);

TeacherRoute.post("/gradebooks/enter", TeacherController.enterGradebook);

TeacherRoute.get("/students/:MaHocSinh/scores", TeacherController.lookupScoresOfStudent);
TeacherRoute.get("/students/search", TeacherController.searchStudents);

export default TeacherRoute;
