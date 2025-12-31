import express from "express";
import { getBugsByTeam, getBugsByTeamLeader } from "../../../controllers/team.leader/bug.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";


const router = express.Router();

// GET bugs by team
router.get("/team/:teamId",protect, getBugsByTeam);

// GET bugs by team leader
router.get("/get-team-leader-bug/:teamLeaderId", protect, getBugsByTeamLeader);

export default router;
