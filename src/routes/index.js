import express from "express";
import adminRouter from "./v1/admin/index.js";
import developerRouter from "./v1/developer/index.js";
import publicRouter from "./v1/public/index.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: true,
    message: "Mern Bug Tracker System API is running",
  });
});

router.use("/v1/admin", adminRouter);
router.use("/v1/developer", developerRouter);
router.use("/v1", publicRouter);

export default router;
