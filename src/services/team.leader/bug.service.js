import Bug from "../../models/bug.model.js";
import Team from "../../models/team.model.js";

/* ================= GET BUGS BY TEAM ================= */
export const getBugsByTeamService = async (teamId, options = {}) => {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

  // Get all projects linked to the team
  const team = await Team.findById(teamId).populate("projects");
  if (!team) throw new Error("Team not found");

  const projectIds = team.projects.map((p) => p._id);

  return Bug.find({ projectId: { $in: projectIds }, deletedAt: null })
    .populate({
      path: "reportedBy assignedTo watchers comments.user reviewedBy",
      select: "_id name email role avatar",
    })
    .populate("projectId")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/* ================= GET BUGS BY TEAM LEADER ================= */
export const getBugsByTeamLeaderService = async (teamLeaderId, options = {}) => {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

  // Find all teams led by the team leader
  const teams = await Team.find({ lead: teamLeaderId }).populate("projects");
  const projectIds = teams.flatMap((t) => t.projects.map((p) => p._id));

  return Bug.find({ projectId: { $in: projectIds }, deletedAt: null })
    .populate({
      path: "reportedBy assignedTo watchers comments.user reviewedBy",
      select: "_id name email role avatar",
    })
    .populate("projectId")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};
