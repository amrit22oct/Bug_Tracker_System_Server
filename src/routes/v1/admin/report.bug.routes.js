import express from "express";
import {
  createReport,
  getReportsByProject,
  getReportById,
  reviewReport,
  deleteReport,
} from "../../../controllers/admin/report.bug.controller.js";

import {
  protect,
  authorisedRoles,
} from "../../../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= USER ================= */
router.post("/", protect, createReport);

/* ================= ADMIN / MANAGER ================= */
router.get(
  "/project/:projectId",
  protect,
  authorisedRoles("admin", "manager"),
  getReportsByProject
);

router.get(
  "/:id",
  protect,
//   authorisedRoles("admin", "manager"),
  getReportById
);

router.patch(
  "/:id",
  protect,
//   authorisedRoles("admin", "manager"),
  reviewReport
);

router.delete(
  "/:id",
  protect,
  authorisedRoles("admin", "manager"),
  deleteReport
);

export default router;
