import express from "express";
import {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug,
  assignBug, // ✅ import assignBug controller
} from "../../../controllers/developer/bug.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBug);
router.get("/", protect, getAllBugs);
router.get("/:id", protect, getBugById);
router.put("/:id", protect, updateBug);
router.delete("/:id", protect, deleteBug);

// ------------------ ASSIGN BUG ------------------
router.patch("/assign/:id", protect, assignBug); 

export default router;
