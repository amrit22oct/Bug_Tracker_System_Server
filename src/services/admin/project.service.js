import Project from "../../models/project.model.js";
import Bug from "../../models/bug.model.js";
import Team from "../../models/team.model.js";
import ReportBug from "../../models/report.bug.model.js";
import { calculateCompletionRatio } from "../../helpers/project/project.helper.js";

/* ------------------------ CRUD OPERATIONS ------------------------ */

export const createProject = async (data, userId) => {
  return await Project.create({ ...data, createdBy: userId });
};

export const getAllProjects = async () => {
  return await Project.find()
    .populate("members", "name email role")
    .populate("createdBy", "name email role")
    .populate("manager", "name email role")
    .populate({
      path: "bugs",
      select: "title status priority severity assignedTo reportedBy",
      populate: [
        { path: "assignedTo", select: "name email" },
        { path: "reportedBy", select: "name email" },
      ],
    })
    .populate({
      path: "reports",
      select: "title status reportedBy reviewedBy",
      populate: [
        { path: "reportedBy", select: "name email" },
        { path: "reviewedBy", select: "name email" },
      ],
    })
    .lean();
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate({
      path: "bugs",
      select: "title status priority severity",
    })
    .populate({
      path: "reports",
      select: "title status",
    });

  if (!project) throw new Error("Project not found");
  return project;
};

export const updateProject = async (id, data) => {
  const project = await Project.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!project) throw new Error("Project not found");
  return project;
};

export const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new Error("Project not found");
};

/* ------------------------ MEMBER MANAGEMENT ------------------------ */

export const addMemberToProject = async (projectId, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");
  if (project.members.includes(memberId)) throw new Error("User is already a member");

  project.members.push(memberId);
  await project.save();
  return project.members;
};

export const removeMemberFromProject = async (projectId, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.members = project.members.filter((id) => id.toString() !== memberId);
  await project.save();
  return project.members;
};

/* ================= ASSIGN TEAMS TO PROJECT ================= */
export const assignTeamsToProjectService = async (projectId, teamIds) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");
  if (project.archived) throw new Error("Project is archived");

  const teamsCount = await Team.countDocuments({
    _id: { $in: teamIds },
    deletedAt: null,
  });

  if (teamsCount !== teamIds.length) {
    throw new Error("One or more teams not found");
  }

  project.teams = [...new Set([...project.teams, ...teamIds])];
  await project.save();

  return project;
};

/* ------------------------ PROJECT MANAGEMENT ------------------------ */

export const toggleArchiveProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  project.archived = !project.archived;
  await project.save();
  return project;
};

export const transferProjectOwnership = async (id, newOwnerId) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  project.createdBy = newOwnerId;
  await project.save();
  return project;
};

export const searchProjects = async (keyword) => {
  return await Project.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
    ],
  });
};

/* ------------------------ FILE & DOCUMENTS ------------------------ */

export const addProjectFiles = async (projectId, files) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");
  if (!files || files.length === 0) throw new Error("No files uploaded");

  const newFiles = files.map((file) => ({
    name: file.originalname,
    fileType: file.mimetype,
    fileUrl: `/uploads/projects/${file.filename}`,
  }));

  project.files.push(...newFiles);
  await project.save();
  return project.files;
};

export const removeProjectFile = async (projectId, fileUrl) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.files = project.files.filter((file) => file.fileUrl !== fileUrl);
  await project.save();
  return project.files;
};

/* ------------------------ ANALYTICS ------------------------ */

export const getProjectStats = async () => {
  const total = await Project.countDocuments();
  const active = await Project.countDocuments({ status: "Active" });
  const onHold = await Project.countDocuments({ status: "On Hold" });
  const completed = await Project.countDocuments({ status: "Completed" });
  const archived = await Project.countDocuments({ archived: true });

  return { total, active, onHold, completed, archived };
};

export const getProjectCompletionRatio = async () => {
  const total = await Project.countDocuments();
  const completed = await Project.countDocuments({ status: "Completed" });
  return calculateCompletionRatio(total, completed);
};

/* ------------------------ ADVANCED UTILITIES ------------------------ */

export const filterProjects = async (query) => {
  const { status, tag, member } = query;
  const filter = {};
  if (status) filter.status = status;
  if (tag) filter.tags = { $in: [tag] };
  if (member) filter.members = member;

  return await Project.find(filter)
    .populate("members", "name email")
    .populate("createdBy", "name email");
};

export const cloneProject = async (id, userId) => {
  const original = await Project.findById(id);
  if (!original) throw new Error("Original project not found");

  const clone = await Project.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    members: original.members,
    createdBy: userId,
    tags: original.tags,
    files: original.files,
    projectLink: original.projectLink,
    documentationLink: original.documentationLink,
  });

  return clone;
};

/* ------------------------ SYNC BUG & REPORT STATS ------------------------ */

export const syncProjectStats = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const totalBugs = await Bug.countDocuments({ projectId });
  const openBugs = await Bug.countDocuments({ projectId, status: "Open" });
  const resolvedBugs = await Bug.countDocuments({ projectId, status: "Resolved" });

  const pendingReports = await ReportBug.countDocuments({ projectId, status: "Pending" });
  const approvedReports = await ReportBug.countDocuments({ projectId, status: "Approved" });

  project.stats = {
    totalBugs,
    openBugs,
    resolvedBugs,
    pendingReports,
    approvedReports,
  };

  await project.save();
  return project.stats;
};
