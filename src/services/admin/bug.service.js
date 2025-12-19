// src/services/admin/bug.service.js
import Bug from "../../models/bug.model.js";
import User from "../../models/user.model.js";
import Project from "../../models/project.model.js";
import {
  validateBugCreateInput,
  buildBugStatsPipeline,
} from "../../helpers/bug/bug.helper.js";

/* ================= CREATE BUG ================= */
export const createBugService = async (data, userId) => {
  validateBugCreateInput(data);

  const { projectId, title, assignedTo } = data;

  /* ================= PROJECT CHECK ================= */
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");
  if (project.archived) throw new Error("Project is archived");

  /* ================= DUPLICATE BUG CHECK ================= */
  const existingBug = await Bug.findOne({
    projectId,
    title: { $regex: `^${title}$`, $options: "i" },
    deletedAt: null,
  });

  if (existingBug) {
    throw new Error("Bug with same title already exists in this project");
  }

  /* ================= ASSIGNED USER CHECK ================= */
  if (assignedTo) {
    const user = await User.findById(assignedTo);
    if (!user) throw new Error("Assigned user not found");
  }

  /* ================= CREATE BUG ================= */
  const bug = await Bug.create({
    ...data,
    reportedBy: userId,
  });

  /* ================= UPDATE PROJECT ================= */
  project.bugs.push(bug._id);
  project.stats.totalBugs += 1;
  project.stats.openBugs += 1;
  await project.save();

  return bug;
};


/* ================= GET ALL BUGS ================= */
export const getAllBugsService = async () =>
  Bug.find({ deletedAt: null })
    .populate("reportedBy", "name email")
    .populate("assignedTo", "name email")
    .populate("projectId", "name");

/* ================= GET BUG BY ID ================= */
export const getBugByIdService = async (id) => {
  const bug = await Bug.findById(id)
    .populate("reportedBy", "name email")
    .populate("assignedTo", "name email")
    .populate("projectId", "name");

  if (!bug || bug.deletedAt) throw new Error("Bug not found");
  return bug;
};

/* ================= UPDATE BUG ================= */
export const updateBugService = async (id, updates) => {
  const bug = await Bug.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!bug) throw new Error("Bug not found");
  return bug;
};

/* ================= SOFT DELETE BUG ================= */
export const deleteBugService = async (id) => {
  const bug = await Bug.findById(id);
  if (!bug) throw new Error("Bug not found");

  bug.deletedAt = new Date();
  await bug.save();

  // Optionally update project stats
  const project = await Project.findById(bug.projectId);
  if (project) {
    project.stats.totalBugs = Math.max(0, project.stats.totalBugs - 1);
    if (bug.status === "Open")
      project.stats.openBugs = Math.max(0, project.stats.openBugs - 1);
    else if (bug.status === "Resolved")
      project.stats.resolvedBugs = Math.max(0, project.stats.resolvedBugs - 1);
    await project.save();
  }

  return true;
};

/* ================= ASSIGN BUG ================= */
export const assignBugService = async (id, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Assigned user not found");

  const bug = await Bug.findByIdAndUpdate(
    id,
    { assignedTo: userId },
    { new: true }
  ).populate("assignedTo", "name email");

  if (!bug) throw new Error("Bug not found");
  return bug;
};

/* ================= UPDATE BUG STATUS ================= */
export const updateBugStatusService = async (id, status) => {
  const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
  if (!validStatuses.includes(status)) throw new Error("Invalid status");

  const bug = await Bug.findById(id);
  if (!bug || bug.deletedAt) throw new Error("Bug not found");

  const oldStatus = bug.status;
  bug.status = status;
  await bug.save();

  // Update project stats
  const project = await Project.findById(bug.projectId);
  if (project) {
    if (oldStatus === "Open") project.stats.openBugs--;
    if (oldStatus === "Resolved") project.stats.resolvedBugs--;

    if (status === "Open") project.stats.openBugs++;
    if (status === "Resolved") project.stats.resolvedBugs++;

    await project.save();
  }

  return bug;
};

/* ================= LINK BUGS ================= */
export const linkRelatedBugsService = async (id, relatedBugId) => {
  const bug = await Bug.findById(id);
  const relatedBug = await Bug.findById(relatedBugId);

  if (!bug || bug.deletedAt || !relatedBug || relatedBug.deletedAt)
    throw new Error("Bug not found");

  if (!bug.linkedBugs.includes(relatedBugId)) bug.linkedBugs.push(relatedBugId);
  if (!relatedBug.linkedBugs.includes(bug._id)) relatedBug.linkedBugs.push(bug._id);

  await bug.save();
  await relatedBug.save();

  return { bug, relatedBug };
};

/* ================= CREATE SUB BUG ================= */
export const createSubBugService = async (parentId, data, userId) => {
  const parent = await Bug.findById(parentId);
  if (!parent || parent.deletedAt) throw new Error("Parent bug not found");

  const childBug = await Bug.create({
    ...data,
    projectId: parent.projectId,
    parentBug: parent._id,
    reportedBy: userId,
  });

  parent.linkedBugs.push(childBug._id);
  await parent.save();

  return childBug;
};

/* ================= ADD BUG HISTORY ================= */
export const addBugHistoryService = async (id, log) => {
  const bug = await Bug.findById(id);
  if (!bug || bug.deletedAt) throw new Error("Bug not found");

  bug.history.push(log);
  await bug.save();
  return bug.history;
};

/* ================= GET BUG STATS ================= */
export const getBugStatsService = async (projectId) => {
  return Bug.aggregate(buildBugStatsPipeline(projectId));
};
