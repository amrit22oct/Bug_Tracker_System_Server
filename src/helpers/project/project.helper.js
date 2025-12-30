
 
//  import mongoose from "mongoose";

// const Bug = mongoose.model("Bug");
// const ReportBug = mongoose.model("ReportBug");
// const Project = mongoose.model("Project");

// export const calculateCompletionRatio = (total, completed) => {
//   const ratio = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
//   return {
//     total,
//     completed,
//     completionRate: `${ratio}%`,
//   };
// };

// /* ============================
//    BUG STATS
// ============================ */
// export const updateBugStats = async (projectId) => {
//   const [total, open, resolved] = await Promise.all([
//     Bug.countDocuments({ projectId }),
//     Bug.countDocuments({ projectId, status: "Open" }),
//     Bug.countDocuments({ projectId, status: { $in: ["Resolved", "Closed"] } }),
//   ]);

//   return Project.findByIdAndUpdate(
//     projectId,
//     {
//       "stats.totalBugs": total,
//       "stats.openBugs": open,
//       "stats.resolvedBugs": resolved,
//     },
//     { new: true }
//   );
// };

// /* ============================
//    REPORT STATS
// ============================ */
// export const updateReportStats = async (projectId) => {
//   const [pending, approved] = await Promise.all([
//     ReportBug.countDocuments({ projectId, status: "Pending" }),
//     ReportBug.countDocuments({ projectId, status: "Approved" }),
//   ]);

//   return Project.findByIdAndUpdate(
//     projectId,
//     {
//       "stats.pendingReports": pending,
//       "stats.approvedReports": approved,
//     },
//     { new: true }
//   );
// };

// /* ============================
//    PROGRESS FROM MILESTONES
// ============================ */
// export const updateProgressFromMilestones = async (project) => {
//   if (!project.milestones?.length) return project;

//   const completed = project.milestones.filter(
//     (m) => m.status === "Completed"
//   ).length;

//   project.progressPercentage = Math.round(
//     (completed / project.milestones.length) * 100
//   );

//   return project.save();
// };

// /* ============================
//    FORCE PROGRESS FROM BUGS
// ============================ */
// export const recalculateProgressFromBugs = async (projectId) => {
//   const [totalBugs, resolvedBugs] = await Promise.all([
//     Bug.countDocuments({ projectId }),
//     Bug.countDocuments({
//       projectId,
//       status: { $in: ["Resolved", "Closed"] },
//     }),
//   ]);

//   let update = {
//     progressPercentage: 0,
//     status: "Planned",
//     actualEndDate: null,
//   };

//   if (totalBugs > 0) {
//     const openBugs = totalBugs - resolvedBugs;
//     update.progressPercentage = Math.round(
//       (resolvedBugs / totalBugs) * 100
//     );

//     if (openBugs > 0) {
//       update.status = "In Progress";
//     } else {
//       update.status = "Completed";
//       update.actualEndDate = new Date();
//     }
//   }

//   return Project.findByIdAndUpdate(projectId, update, { new: true });
// };


// export const computeProjectView = (project) => {
//   const bugs = project.bugs || [];
//   const reports = project.reports || [];

//   const totalBugs = bugs.length;
//   const resolvedBugs = bugs.filter(
//     (b) => b.status === "Resolved" || b.status === "Closed"
//   ).length;

//   const openBugs = totalBugs - resolvedBugs;

//   const pendingReports = reports.filter(
//     (r) => r.status === "Pending"
//   ).length;

//   const approvedReports = reports.filter(
//     (r) => r.status === "Approved"
//   ).length;

//   let progressPercentage = 0;
//   let status = "Planned";

//   if (totalBugs > 0) {
//     progressPercentage = Math.round((resolvedBugs / totalBugs) * 100);
//     status = openBugs > 0 ? "In Progress" : "Completed";
//   }

//   return {
//     ...project,
//     stats: {
//       totalBugs,
//       openBugs,
//       resolvedBugs,
//       pendingReports,
//       approvedReports,
//     },
//     progressPercentage,
//     status,
//   };
// };
