import * as projectService from "../../services/admin/project.service.js";

/* -------------------------------------------------------------------------- */
/*                              🧱 CRUD OPERATIONS                            */
/* -------------------------------------------------------------------------- */

export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ CREATE PROJECT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ GET ALL PROJECTS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("❌ GET PROJECT BY ID ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ UPDATE PROJECT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE PROJECT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                          👥 MEMBER MANAGEMENT                              */
/* -------------------------------------------------------------------------- */

export const addMemberToProject = async (req, res) => {
  try {
    const members = await projectService.addMemberToProject(req.params.id, req.body.memberId);
    res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: members,
    });
  } catch (error) {
    console.error("❌ ADD MEMBER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const removeMemberFromProject = async (req, res) => {
  try {
    const members = await projectService.removeMemberFromProject(req.params.id, req.body.memberId);
    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: members,
    });
  } catch (error) {
    console.error("❌ REMOVE MEMBER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                            ⚙️ PROJECT MANAGEMENT                           */
/* -------------------------------------------------------------------------- */

export const toggleArchiveProject = async (req, res) => {
  try {
    const project = await projectService.toggleArchiveProject(req.params.id);
    res.status(200).json({
      success: true,
      message: `Project ${project.archived ? "archived" : "unarchived"} successfully`,
      data: project,
    });
  } catch (error) {
    console.error("❌ ARCHIVE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const transferProjectOwnership = async (req, res) => {
  try {
    const project = await projectService.transferProjectOwnership(req.params.id, req.body.newOwnerId);
    res.status(200).json({
      success: true,
      message: "Project ownership transferred successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ TRANSFER OWNERSHIP ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const projects = await projectService.searchProjects(req.query.keyword);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ SEARCH PROJECTS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                         📂 FILE & DOCUMENT MANAGEMENT                      */
/* -------------------------------------------------------------------------- */

export const addProjectFiles = async (req, res) => {
  try {
    const files = await projectService.addProjectFiles(req.params.id, req.files);
    res.status(200).json({
      success: true,
      message: "Files added successfully",
      data: files,
    });
  } catch (error) {
    console.error("❌ ADD FILES ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const removeProjectFile = async (req, res) => {
  try {
    const files = await projectService.removeProjectFile(req.params.id, req.body.fileUrl);
    res.status(200).json({
      success: true,
      message: "File removed successfully",
      data: files,
    });
  } catch (error) {
    console.error("❌ REMOVE FILE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                        📊 ANALYTICS & REPORTING                            */
/* -------------------------------------------------------------------------- */

export const getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("❌ PROJECT STATS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getProjectCompletionRatio = async (req, res) => {
  try {
    const ratio = await projectService.getProjectCompletionRatio();
    res.status(200).json({ success: true, ...ratio });
  } catch (error) {
    console.error("❌ COMPLETION RATIO ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                           🧩 ADVANCED UTILITIES                            */
/* -------------------------------------------------------------------------- */

export const filterProjects = async (req, res) => {
  try {
    const projects = await projectService.filterProjects(req.query);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ FILTER PROJECTS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const cloneProject = async (req, res) => {
  try {
    const clone = await projectService.cloneProject(req.params.id, req.user._id);
    res.status(201).json({
      success: true,
      message: "Project cloned successfully",
      data: clone,
    });
  } catch (error) {
    console.error("❌ CLONE PROJECT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const syncProjectBugStats = async (req, res) => {
  try {
    const stats = await projectService.syncProjectBugStats(req.params.id);
    res.status(200).json({
      success: true,
      message: "Project bug stats updated successfully",
      stats,
    });
  } catch (error) {
    console.error("❌ SYNC BUG STATS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
