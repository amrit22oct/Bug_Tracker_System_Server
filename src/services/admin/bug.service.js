import Bug from "../../models/bugModel.js";
import User from "../../models/userModel.js";
import Project from "../../models/projectModel.js";
import { validateBugCreateInput, buildBugStatsPipeline } from "../../helpers/bug/bug.helper.js";

/* ================= CREATE BUG ================= */
export const createBugService = async (data, userId) => {
  validateBugCreateInput(data);

  const project = await Project.findById(data.projectId);
  if (!project) throw new Error("Project not found");

  if (data.assignedTo) {
    const user = await User.findById(data.assignedTo);
    if (!user) throw new Error("Assigned user not found");
  }

  const bug = await Bug.create({
    ...data,
    reportedBy: userId,
  });

  project.stats.totalBugs += 1;
  project.stats.openBugs += 1;
  await project.save();

  return bug;
};

/* ================= GET ALL BUGS ================= */
export const getAllBugsService = async () =>
  Bug.find()
    .populate("reportedBy", "name email")
    .populate("assignedTo", "name email")
    .populate("projectId", "name")
    .populate("relatedBugs", "title status")
    .populate("parentBug", "title");

/* ================= GET BUG BY ID ================= */
export const getBugByIdService = async (id) => {
  const bug = await Bug.findById(id)
    .populate("reportedBy", "name email")
    .populate("assignedTo", "name email")
    .populate("projectId", "name")
    .populate("relatedBugs", "title status")
    .populate("parentBug", "title");

  if (!bug) throw new Error("Bug not found");
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

/* ================= DELETE BUG ================= */
export const deleteBugService = async (id) => {
  const bug = await Bug.findByIdAndDelete(id);
  if (!bug) throw new Error("Bug not found");

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
  const bug = await Bug.findByIdAndUpdate(
    id,
    { assignedTo: userId },
    { new: true }
  ).populate("assignedTo", "name email");

  if (!bug) throw new Error("Bug not found");
  return bug;
};

/* ================= UPDATE STATUS ================= */
export const updateBugStatusService = async (id, status) => {
  const bug = await Bug.findById(id);
  if (!bug) throw new Error("Bug not found");

  bug.status = status;
  await bug.save();
  return bug;
};

/* ================= LINK BUGS ================= */
export const linkRelatedBugsService = async (id, relatedBugId) => {
  const bug = await Bug.findById(id);
  const relatedBug = await Bug.findById(relatedBugId);

  if (!bug || !relatedBug) throw new Error("Bug not found");

  if (!bug.relatedBugs.includes(relatedBugId))
    bug.relatedBugs.push(relatedBugId);

  if (!relatedBug.relatedBugs.includes(bug._id))
    relatedBug.relatedBugs.push(bug._id);

  await bug.save();
  await relatedBug.save();

  return { bug, relatedBug };
};

/* ================= CREATE SUB BUG ================= */
export const createSubBugService = async (parentId, data, userId) => {
  const parent = await Bug.findById(parentId);
  if (!parent) throw new Error("Parent bug not found");

  const childBug = await Bug.create({
    ...data,
    projectId: parent.projectId,
    parentBug: parent._id,
    reportedBy: userId,
  });

  parent.relatedBugs.push(childBug._id);
  await parent.save();

  return childBug;
};

/* ================= BUG HISTORY ================= */
export const addBugHistoryService = async (id, log) => {
  const bug = await Bug.findById(id);
  if (!bug) throw new Error("Bug not found");

  bug.history.push(log);
  await bug.save();
  return bug.history;
};

/* ================= BUG STATS ================= */
export const getBugStatsService = async (projectId) => {
  return Bug.aggregate(buildBugStatsPipeline(projectId));
};
