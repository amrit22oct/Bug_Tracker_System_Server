import express from "express";
import authRouter from "./auth.routes.js";
import projectRouter from "./project.routes.js"
import teamRouter from "./team.routes.js"
import bugRouter from "./bug.routes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/project", projectRouter)
router.use("/team", teamRouter)
router.use("/bug", bugRouter)

export default router;
