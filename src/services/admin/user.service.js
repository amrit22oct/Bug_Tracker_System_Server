import User from "../../models/user.model.js";
import Project from "../../models/project.model.js";
import Team from "../../models/team.model.js";
import Bug from "../../models/bug.model.js";

/* ================= GET ALL USERS ================= */
export const getAllUsersService = async () => {
  return await User.find({ isActive: true, deletedAt: null })
    .select("-password -otp");
};

/* ================= GET USER BY ID ================= */
export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId).select("-password -otp");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/* ================= GET USERS BY ROLE ================= */
export const getUsersByRoleService = async (role) => {
  return await User.find({
    role,
    isActive: true,
    deletedAt: null,
  }).select("-password -otp");
};

/* ================= GET USER PROJECTS ================= */
export const getUserProjectsService = async (userId) => {
  return await Project.find({ members: userId });
};

/* ================= GET USER TEAMS ================= */
export const getUserTeamsService = async (userId) => {
  return await Team.find({ members: userId });
};

/* ================= GET USER BUGS ================= */
export const getUserBugsService = async (userId) => {
  return await Bug.find({
    $or: [{ assignedTo: userId }, { reportedBy: userId }],
  });
};
