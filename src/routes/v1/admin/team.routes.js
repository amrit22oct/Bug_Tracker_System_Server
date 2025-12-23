import express from "express";
import {
   createTeam,
   getTeamById,
  getAllTeams,
  assignProjectToTeam,
 
} from "../../../controllers/admin/team.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-team", protect, createTeam);
router.get("/get-all-team", protect, getAllTeams);        
router.get("/get-team/:teamId", protect, getTeamById); 
router.put(
   "/assign-project/:teamId",protect,
   assignProjectToTeam
 );



export default router;
