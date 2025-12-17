// controllers/projectController.js
import Project from "../../models/project.model.js";
import Bug from "../../models/bug.model.js";

/* -------------------------------------------------------------------------- */
/*                              🧱 CRUD OPERATIONS                            */
/* -------------------------------------------------------------------------- */

// 🆕 Create Project
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      members,
      tags,
      startDate,
      endDate,
      projectLink,
      documentationLink,
    } = req.body;

    const project = await Project.create({
      name,
      description,
      members,
      createdBy: req.user._id,
      startDate,
      endDate,
      tags,
      projectLink,
      documentationLink,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ CREATE PROJECT ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📄 Get All Projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("members", "name email")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ GET ALL PROJECTS ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 Get Single Project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate({
        path: "bugs",
        select: "title status priority severity",
      });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("❌ GET PROJECT BY ID ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✏️ Update Project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ UPDATE PROJECT ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🗑️ Delete Project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE PROJECT ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                          👥 MEMBER MANAGEMENT                              */
/* -------------------------------------------------------------------------- */

// ➕ Add Member to Project
export const addMemberToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { memberId } = req.body;
    if (project.members.includes(memberId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push(memberId);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: project.members,
    });
  } catch (error) {
    console.error("❌ ADD MEMBER ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ➖ Remove Member
export const removeMemberFromProject = async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.members = project.members.filter(
      (id) => id.toString() !== memberId
    );
    await project.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: project.members,
    });
  } catch (error) {
    console.error("❌ REMOVE MEMBER ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            ⚙️ PROJECT MANAGEMENT                           */
/* -------------------------------------------------------------------------- */

// 🗃️ Archive / Unarchive
export const toggleArchiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.archived = !project.archived;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project ${project.archived ? "archived" : "unarchived"} successfully`,
      data: project,
    });
  } catch (error) {
    console.error("❌ ARCHIVE ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔄 Transfer Ownership
export const transferProjectOwnership = async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.createdBy = newOwnerId;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project ownership transferred successfully",
      data: project,
    });
  } catch (error) {
    console.error("❌ TRANSFER OWNERSHIP ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔍 Search Projects by Name / Tag
export const searchProjects = async (req, res) => {
  try {
    const { keyword } = req.query;
    const projects = await Project.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ SEARCH PROJECTS ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                         📂 FILE & DOCUMENT MANAGEMENT                      */
/* -------------------------------------------------------------------------- */

export const addProjectFiles = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const newFiles = req.files.map((file) => ({
      name: file.originalname,
      fileType: file.mimetype,
      fileUrl: `/uploads/projects/${file.filename}`,
    }));

    project.files.push(...newFiles);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Files added successfully",
      data: project.files,
    });
  } catch (error) {
    console.error("❌ ADD FILES ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeProjectFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.files = project.files.filter((file) => file.fileUrl !== fileUrl);
    await project.save();

    res.status(200).json({
      success: true,
      message: "File removed successfully",
      data: project.files,
    });
  } catch (error) {
    console.error("❌ REMOVE FILE ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                        📊 ANALYTICS & REPORTING                            */
/* -------------------------------------------------------------------------- */

export const getProjectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const active = await Project.countDocuments({ status: "Active" });
    const onHold = await Project.countDocuments({ status: "On Hold" });
    const completed = await Project.countDocuments({ status: "Completed" });
    const archived = await Project.countDocuments({ archived: true });

    res.status(200).json({
      success: true,
      stats: { total, active, onHold, completed, archived },
    });
  } catch (error) {
    console.error("❌ PROJECT STATS ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProjectCompletionRatio = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const completed = await Project.countDocuments({ status: "Completed" });
    const ratio = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      total,
      completed,
      completionRate: `${ratio}%`,
    });
  } catch (error) {
    console.error("❌ COMPLETION RATIO ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                           🧩 ADVANCED UTILITIES                            */
/* -------------------------------------------------------------------------- */

export const filterProjects = async (req, res) => {
  try {
    const { status, tag, member } = req.query;
    const query = {};
    if (status) query.status = status;
    if (tag) query.tags = { $in: [tag] };
    if (member) query.members = member;

    const projects = await Project.find(query)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ FILTER PROJECTS ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cloneProject = async (req, res) => {
  try {
    const original = await Project.findById(req.params.id);
    if (!original)
      return res.status(404).json({ message: "Original project not found" });

    const clone = await Project.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      members: original.members,
      createdBy: req.user._id,
      tags: original.tags,
      files: original.files,
      projectLink: original.projectLink,
      documentationLink: original.documentationLink,
    });

    res.status(201).json({
      success: true,
      message: "Project cloned successfully",
      data: clone,
    });
  } catch (error) {
    console.error("❌ CLONE PROJECT ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const syncProjectBugStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const total = await Bug.countDocuments({ projectId: project._id });
    const open = await Bug.countDocuments({
      projectId: project._id,
      status: "Open",
    });
    const resolved = await Bug.countDocuments({
      projectId: project._id,
      status: "Resolved",
    });

    project.stats = {
      totalBugs: total,
      openBugs: open,
      resolvedBugs: resolved,
    };
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project bug stats updated successfully",
      stats: project.stats,
    });
  } catch (error) {
    console.error("❌ SYNC BUG STATS ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
