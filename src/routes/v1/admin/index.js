import express from "express";
import authRouter from "./auth.routes.js";
import projectRouter from "./project.routes.js"
import bugRouter from "./bug.routes.js"
import reportbugRouter from "./report.bug.routes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/project", projectRouter)
router.use("/bug", bugRouter)
router.use("/report-bug", reportbugRouter)

export default router;
