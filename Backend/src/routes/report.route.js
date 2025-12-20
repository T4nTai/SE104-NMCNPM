import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";

const ReportRoute = Router();

ReportRoute.get("/semester-class", ReportController.reportBySemesterAndClass);
ReportRoute.get("/subject", ReportController.reportBySubject);

export default ReportRoute;
