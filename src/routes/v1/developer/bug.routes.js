import express from "express";
import { protect } from "../../../middlewares/authMiddleware.js";
import { getDeveloperBugs } from "../../../controllers/developer/bugs.controller.js";


const router = express.Router();

// GET bugs assigned to a developer
router.get("/get-developer-bug/:developerId", protect, getDeveloperBugs);

export default router;
