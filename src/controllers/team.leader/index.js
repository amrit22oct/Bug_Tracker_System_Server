import { getTeamLeaderDashboardService } from "../../services/team.leader/index.js";

export const getTeamLeaderDashboard = async (req, res, next) => {
  try {
    const teamLeaderId = req.user._id;

    const data = await getTeamLeaderDashboardService(teamLeaderId);

    res.status(200).json({
      success: true,
      message: "Team leader dashboard data fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
