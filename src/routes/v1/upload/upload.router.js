import express from "express";
import upload from "../../../config/multer.config.js";
import { uploadDocumentController } from "../../../controllers/upload/upload.controller.js";

const router = express.Router();

router.post(
  "/upload-document",
  upload.single("file"), // must match frontend field name
  uploadDocumentController
);

export default router;
