import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { StudentController } from "../controllers/student.controller.js";

const router = Router();

router.get("/students/me/classes", authenticateJWT, authorizeRoles("student"), StudentController.meClasses);
router.get("/students/me/scores", authenticateJWT, authorizeRoles("student"), StudentController.meScores);

export default router;
