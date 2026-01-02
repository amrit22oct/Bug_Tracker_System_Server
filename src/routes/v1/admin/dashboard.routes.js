// src/routes/user.routes.js
import express from "express";
import { getDashboardData } from "../../../controllers/admin/dashboard.controller.js";
import { protect } from "../../../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/get-dashboard-details",protect, getDashboardData);

export default router;
