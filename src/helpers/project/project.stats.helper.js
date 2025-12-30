import mongoose from "mongoose";

const Bug = mongoose.model("Bug");
const ReportBug = mongoose.model("ReportBug");
const Project = mongoose.model("Project");

/* ============================
   BUG STATS
============================ */
export const updateBugStats = async (projectId) => {
  const [total, open, resolved] = await Promise.all([
    Bug.countDocuments({ projectId }),
    Bug.countDocuments({ projectId, status: "Open" }),
    Bug.countDocuments({ projectId, status: { $in: ["Resolved", "Closed"] } }),
  ]);

  return Project.findByIdAndUpdate(
    projectId,
    {
      "stats.totalBugs": total,
      "stats.openBugs": open,
      "stats.resolvedBugs": resolved,
    },
    { new: true }
  );
};

/* ============================
   REPORT STATS
============================ */
export const updateReportStats = async (projectId) => {
  const [pending, approved] = await Promise.all([
    ReportBug.countDocuments({ projectId, status: "Pending" }),
    ReportBug.countDocuments({ projectId, status: "Approved" }),
  ]);

  return Project.findByIdAndUpdate(
    projectId,
    {
      "stats.pendingReports": pending,
      "stats.approvedReports": approved,
    },
    { new: true }
  );
};

/* ============================
   FORCE PROGRESS FROM BUGS
============================ */
export const recalculateProgressFromBugs = async (projectId) => {
  const [total, resolved] = await Promise.all([
    Bug.countDocuments({ projectId }),
    Bug.countDocuments({
      projectId,
      status: { $in: ["Resolved", "Closed"] },
    }),
  ]);

  const open = total - resolved;

  return Project.findByIdAndUpdate(
    projectId,
    {
      progressPercentage: total ? Math.round((resolved / total) * 100) : 0,
      status:
        total === 0
          ? "Planned"
          : open > 0
          ? "In Progress"
          : "Completed",
      actualEndDate:
        total && open === 0 ? new Date() : null,
    },
    { new: true }
  );
};
