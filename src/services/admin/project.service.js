import Project from "../../models/project.model.js";
import Bug from "../../models/bug.model.js";
import { calculateCompletionRatio } from "../../helpers/project/project.helper.js";

/* ------------------------ CRUD OPERATIONS ------------------------ */

export const createProject = async (data, userId) => {
  return await Project.create({ ...data, createdBy: userId });
};

export const getAllProjects = async () => {
  return await Project.find()
    .populate("members", "name email")
    .populate("createdBy", "name email");
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate({ path: "bugs", select: "title status priority severity" });

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
  if (project.members.includes(memberId))
    throw new Error("User is already a member");

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

export const syncProjectBugStats = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  const total = await Bug.countDocuments({ projectId: project._id });
  const open = await Bug.countDocuments({
    projectId: project._id,
    status: "Open",
  });
  const resolved = await Bug.countDocuments({
    projectId: project._id,
    status: "Resolved",
  });

  project.stats = { totalBugs: total, openBugs: open, resolvedBugs: resolved };
  await project.save();
  return project.stats;
};
