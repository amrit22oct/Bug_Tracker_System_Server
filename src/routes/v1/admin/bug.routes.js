import express from "express";
import {
  createBug,
  createBugAndReport,
  getAllBugs,
  getBugById,
  getBugByProjectId,
  updateBug,
  deleteBug,
  assignBug,
  updateBugStatus,
  getBugsByProjectManager,
  createSubBug,
} from "../../../controllers/admin/bugs.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-bug", protect, createBug);
router.post(
  "/create-sub-bugs/:parentBugId",
  protect,
  createSubBug
);

router.post("/create-bug-report", protect, createBugAndReport);
router.get("/get-all-bugs", protect, getAllBugs);
router.get("/get-bug/:id", protect, getBugById);
router.get("/get-project-bug/:id", protect, getBugByProjectId);

// GET bugs by project manager
router.get(
  "/get-bug-project-manager/:projectManagerId",protect,
  getBugsByProjectManager
);

router.patch("/assign/:id", protect, assignBug); 

router.put("/:id", protect, updateBug);

router.patch("/:id/status", protect, updateBugStatus);
router.delete("/:id", protect, deleteBug);

export default router;
