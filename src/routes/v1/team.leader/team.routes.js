import express from "express";
import { getTeamLeaderDashboard } from "../../../controllers/team.leader/index.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-details", protect, getTeamLeaderDashboard);



export default router;
