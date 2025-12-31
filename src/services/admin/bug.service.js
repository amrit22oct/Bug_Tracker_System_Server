// src/services/admin/bug.service.js
import Bug from "../../models/bug.model.js";
import User from "../../models/user.model.js";
import Project from "../../models/project.model.js";
import ReportBug from "../../models/report.bug.model.js";
import {
  validateBugCreateInput,
  buildBugStatsPipeline,
} from "../../helpers/bug/bug.helper.js";
import { updateBugStats, recalculateProgressFromBugs } from "../../helpers/project/project.stats.helper.js";
import mongoose from "mongoose";

/* ================= CREATE BUG ================= */


export const createBugService = async (data, userId) => {
  validateBugCreateInput(data);

  const { projectId, title, assignedTo } = data;

  /* ================= PROJECT VALIDATION ================= */
  const project = await Project.findById(projectId).select("archived bugs");
  if (!project) throw new Error("Project not found");
  if (project.archived) throw new Error("Project is archived");

  /* ================= DUPLICATE BUG CHECK ================= */
  const existingBug = await Bug.findOne({
    projectId,
    title: { $regex: `^${title}$`, $options: "i" },
    deletedAt: null,
  }).lean();

  if (existingBug) {
    throw new Error("Bug with same title already exists in this project");
  }

  /* ================= ASSIGNEE VALIDATION ================= */
  if (assignedTo) {
    const userExists = await User.exists({ _id: assignedTo });
    if (!userExists) throw new Error("Assigned user not found");
  }

  /* ================= CREATE BUG ================= */
  const bug = await Bug.create({
    ...data,
    reportedBy: userId,
    status: "Open",
  });

  /* ================= UPDATE PROJECT ================= */
  await Project.findByIdAndUpdate(projectId, {
    $addToSet: { bugs: bug._id }, // prevents duplicates
  });

  /* ================= UPDATE STATS & PROGRESS ================= */
  await Promise.all([
    updateBugStats(projectId),
    recalculateProgressFromBugs(projectId),
  ]);

  return bug;
};





/* ================ CREATE AND REPORT BUG==================*/
export const createBugAndReportService = async (data, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    validateBugCreateInput(data);
    const { projectId, title, assignedTo } = data;

    const project = await Project.findById(projectId).session(session);
    if (!project) throw new Error("Project not found");
    if (project.archived) throw new Error("Project is archived");

    const existingBug = await Bug.findOne({
      projectId,
      title: { $regex: `^${title}$`, $options: "i" },
      deletedAt: null,
    }).session(session);

    if (existingBug) {
      throw new Error("Bug with same title already exists in this project");
    }

    if (assignedTo) {
      const user = await User.findById(assignedTo).session(session);
      if (!user) throw new Error("Assigned user not found");
    }

    /* ================= CREATE BUG ================= */
    const [bug] = await Bug.create(
      [
        {
          ...data,
          reportedBy: userId,
          status: "Open",
          statusHistory: [{ status: "Open", changedBy: userId }],
        },
      ],
      { session }
    );

    /* ================= CREATE REPORT ================= */
    await ReportBug.create(
      [
        {
          reportedBy: userId,
          projectId,
          bugId: bug._id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          severity: data.severity,
          tags: data.tags,
          assignedTo: data.assignedTo,
          environment: data.environment,
          reproducible: data.reproducible,
          attachments: data.attachments,
          dueDate: data.dueDate,
          estimatedFixTime: data.estimatedFixTime,
        },
      ],
      { session }
    );

    /* ================= UPDATE PROJECT ================= */
    project.bugs.push(bug._id);

    // 🔴 SAVE FIRST
    await project.save({ session });

    // 🔥 FORCE STATUS & PROGRESS
    await project.updateBugStats();
    await project.recalculateProgress();

    await session.commitTransaction();
    session.endSession();

    return bug;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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

/* ===================== GET BUG BY PROJECT ID ===============*/

export const getBugByProjectIdService = async (projectId) => {
  // Populate the 'bugs' field to get full bug documents
  const project = await Project.findById(projectId).populate('bugs');
  if (!project) {
    throw new Error('Project not found');
  }
  return project.bugs; // now returns full bug details
};

/* ==============get bug by projct manager ===============*/

export const getBugsByProjectManagerService = async (
  projectManagerId,
  options = {}
) => {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

  // 1️⃣ Find projects managed by this project manager
  const projects = await Project.find({
    manager: projectManagerId,
    deletedAt: null,
  }).select("_id");

  if (!projects.length) return [];

  const projectIds = projects.map((p) => p._id);

  // 2️⃣ Find bugs for those projects
  return Bug.find({
    projectId: { $in: projectIds },
    deletedAt: null,
  })
    .populate({
      path: "reportedBy assignedTo watchers comments.user reviewedBy",
      select: "_id name email role avatar",
    })
    .populate("projectId") // full project data
    .sort(sort)
    .skip(skip)
    .limit(limit);
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
