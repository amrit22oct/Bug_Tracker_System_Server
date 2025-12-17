import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
  toggleArchiveProject,
  transferProjectOwnership,
  searchProjects,
  addProjectFiles,
  removeProjectFile,
  getProjectStats,
  getProjectCompletionRatio,
  filterProjects,
  cloneProject,
  syncProjectBugStats,
} from "../../../controllers/admin/project.controller.js"; // ✅ singular, matches your file

import { protect, authorisedRoles } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               🧱 CRUD ROUTES                               */
/* -------------------------------------------------------------------------- */

// Create
router.post(
  "/",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  createProject
);

// Get all
router.get("/", protect, getAllProjects);

// Get by ID
router.get("/:id", protect, getProjectById);

// Update
router.put(
  "/:id",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  updateProject
);

// Delete
router.delete("/:id", protect, authorisedRoles("Admin"), deleteProject);

/* -------------------------------------------------------------------------- */
/*                           👥 MEMBER MANAGEMENT                             */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/add-member",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  addMemberToProject
);
router.patch(
  "/:id/remove-member",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  removeMemberFromProject
);

/* -------------------------------------------------------------------------- */
/*                           ⚙️ PROJECT SETTINGS                              */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/archive",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  toggleArchiveProject
);
router.patch(
  "/:id/transfer",
  protect,
  authorisedRoles("Admin"),
  transferProjectOwnership
);
router.get("/search", protect, searchProjects);

/* -------------------------------------------------------------------------- */
/*                           📂 FILE MANAGEMENT                               */
/* -------------------------------------------------------------------------- */

router.post(
  "/:id/files",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  addProjectFiles
);
router.delete(
  "/:id/files",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  removeProjectFile
);

/* -------------------------------------------------------------------------- */
/*                        📊 ANALYTICS & REPORTING                            */
/* -------------------------------------------------------------------------- */

router.get(
  "/stats/overview",
  protect,
  authorisedRoles("Admin"),
  getProjectStats
);
router.get(
  "/stats/completion",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  getProjectCompletionRatio
);

/* -------------------------------------------------------------------------- */
/*                           🧩 UTILITIES & SYNC                              */
/* -------------------------------------------------------------------------- */

router.get("/filter", protect, filterProjects);
router.post(
  "/:id/clone",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  cloneProject
);
router.patch(
  "/:id/sync-bugs",
  protect,
  authorisedRoles("Admin", "Project Manager"),
  syncProjectBugStats
);

export default router;
