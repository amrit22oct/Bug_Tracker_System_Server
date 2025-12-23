import express from "express";
import {
  createBug,
  createBugAndReport,
  getAllBugs,
  getBugById,
  getBugByProjectId,
  updateBug,
  deleteBug,
} from "../../../controllers/admin/bugs.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-bug", protect, createBug);
router.post("/create-bug-report", protect, createBugAndReport);
router.get("/get-all-bugs", protect, getAllBugs);
router.get("/get-bug/:id", protect, getBugById);
router.get("/get-project-bug/:id", protect, getBugByProjectId);

router.put("/:id", protect, updateBug);
router.delete("/:id", protect, deleteBug);

export default router;
