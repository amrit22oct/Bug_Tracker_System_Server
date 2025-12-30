import { calculatePercentage } from "./math.helper.js";

export const computeProjectView = (project) => {
  const bugs = project.bugs ?? [];
  const reports = project.reports ?? [];

  const totalBugs = bugs.length;
  const resolvedBugs = bugs.filter(
    (b) => b.status === "Resolved" || b.status === "Closed"
  ).length;

  const openBugs = totalBugs - resolvedBugs;

  const pendingReports = reports.filter((r) => r.status === "Pending").length;
  const approvedReports = reports.filter((r) => r.status === "Approved").length;

  const progressPercentage = calculatePercentage(resolvedBugs, totalBugs);

  const status =
    totalBugs === 0
      ? "Planned"
      : openBugs > 0
      ? "In Progress"
      : "Completed";

  return {
    ...project,
    stats: {
      totalBugs,
      openBugs,
      resolvedBugs,
      pendingReports,
      approvedReports,
    },
    progressPercentage,
    status,
  };
};
