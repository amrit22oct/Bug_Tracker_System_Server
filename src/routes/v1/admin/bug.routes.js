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
} from "../../../controllers/admin/bugs.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-bug", protect, createBug);
router.post("/create-bug-report", protect, createBugAndReport);
router.get("/get-all-bugs", protect, getAllBugs);
router.get("/get-bug/:id", protect, getBugById);
router.get("/get-project-bug/:id", protect, getBugByProjectId);

router.patch("/assign/:id", protect, assignBug); 

router.put("/:id", protect, updateBug);
router.delete("/:id", protect, deleteBug);

export default router;
