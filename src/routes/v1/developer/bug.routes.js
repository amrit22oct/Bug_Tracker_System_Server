import express from "express";
import {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug,
} from "../../../controllers/developer/bug.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBug);
router.get("/", protect, getAllBugs);
router.get("/:id", protect, getBugById);
router.put("/:id", protect, updateBug);
router.delete("/:id", protect, deleteBug);

export default router;
