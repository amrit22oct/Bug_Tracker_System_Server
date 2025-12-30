import Team from "../../models/team.model.js";
import Project from "../../models/project.model.js";
import Bug from "../../models/bug.model.js";
import ReportBug from "../../models/report.bug.model.js";

export const getTeamLeaderDashboardService = async (teamLeaderId) => {
  /* =========================
     1️⃣ Find Team
  ========================= */
  const team = await Team.findOne({
    lead: teamLeaderId,
    isActive: true,
    deletedAt: null,
  })
    .populate("lead", "name email role")
    .populate("members", "name email role")
    .populate({
      path: "projects",
      select: "name status progressPercentage stats",
    })
    .lean();

  if (!team) {
    throw {
      statusCode: 404,
      message: "No team assigned to this Team Leader",
    };
  }

  /* =========================
     2️⃣ Get Project IDs
  ========================= */
  const projectIds = team.projects.map((project) => project._id);

  /* =========================
     3️⃣ Fetch Projects
  ========================= */
  const projects = await Project.find({
    _id: { $in: projectIds },
    deletedAt: null,
  })
    .select("name status progressPercentage stats teamLeader manager")
    .populate("teamLeader", "name email")
    .populate("manager", "name email")
    .lean();

  /* =========================
     4️⃣ Fetch Bugs
  ========================= */
  const bugs = await Bug.find({
    projectId: { $in: projectIds },
    deletedAt: null,
  })
    .select("title status priority severity projectId assignedTo reportedBy createdAt")
    .populate("assignedTo", "name email role")
    .populate("reportedBy", "name email role")
    .lean();

  /* =========================
     5️⃣ Fetch Bug Reports
  ========================= */
  const reports = await ReportBug.find({
    projectId: { $in: projectIds },
    deletedAt: null,
  })
    .select("title status priority severity projectId createdAt")
    .populate("reportedBy", "name email")
    .lean();

  /* =========================
     6️⃣ Group Bugs by Project
  ========================= */
  const bugsByProject = {};
  for (const bug of bugs) {
    const pid = bug.projectId.toString();
    if (!bugsByProject[pid]) bugsByProject[pid] = [];
    bugsByProject[pid].push(bug);
  }

  /* =========================
     7️⃣ Attach Bugs to Projects
  ========================= */
  const projectsWithBugs = projects.map((project) => ({
    ...project,
    bugs: bugsByProject[project._id.toString()] || [],
  }));

  /* =========================
     8️⃣ Final Response
  ========================= */
  return {
    team: {
      id: team._id,
      name: team.name,
      lead: team.lead,
      members: team.members,
    },
    projects: projectsWithBugs,
    stats: {
      totalProjects: projects.length,
      totalBugs: bugs.length,
      totalReports: reports.length,
    },
  };
};
