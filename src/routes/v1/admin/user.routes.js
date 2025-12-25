// src/routes/user.routes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  getUsersByRole,
  getUserProjects,
  getUserTeams,
  getUserBugs,
} from "../../../controllers/admin/user.controller.js";

const router = express.Router();

router.get("/get-all-users", getAllUsers);
router.get("/get-user/:id", getUserById);
router.get("/get-user-by-role/:role", getUsersByRole);
router.get("/get-user-project/:id", getUserProjects);
router.get("/get-user-team/:id", getUserTeams);
router.get("/get-user-bug/:id", getUserBugs);

export default router;
