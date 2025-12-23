import Team from "../../models/team.model.js";
import Project from "../../models/project.model.js";
import User from "../../models/user.model.js";

/* ================= CREATE TEAM ================= */
export const createTeamService = async (data) => {
   const { name, lead, members = [] } = data;
 
   /* ===== Duplicate team name check ===== */
   const existingTeam = await Team.findOne({
     name: { $regex: `^${name}$`, $options: "i" },
     deletedAt: null,
   });
 
   if (existingTeam) {
     throw new Error("Team with this name already exists");
   }
 
   /* ===== Lead validation ===== */
   if (lead) {
     const leadUser = await User.findById(lead);
     if (!leadUser) throw new Error("Team lead not found");
   }
 
   /* ===== Members validation ===== */
   if (members.length) {
     const usersCount = await User.countDocuments({
       _id: { $in: members },
     });
 
     if (usersCount !== members.length) {
       throw new Error("One or more team members not found");
     }
   }
 
   /* ===== Create team ===== */
   const team = await Team.create({
     name,
     description: data.description,
     lead,
     members,
   });
 
   return team;
 };

 /* ================= GET TEAM BY ID ================= */
export const getTeamByIdService = async (teamId) => {
   const team = await Team.findOne({
     _id: teamId,
     deletedAt: null,
   })
     .populate("lead", "name email")
     .populate("members", "name email");
 
   if (!team) {
     throw new Error("Team not found");
   }
 
   return team;
 };
 
 /* ================= GET ALL TEAMS ================= */
 export const getAllTeamsService = async () => {
   const teams = await Team.find({ deletedAt: null })
     .populate("lead", "name email")
     .populate("members", "name email")
     .populate("projects", "name description") // multiple projects now
     .sort({ createdAt: -1 });
 
   return teams;
 };
 
 
 

 export const assignProjectToTeamService = async (teamId, projectId) => {
   if (!teamId || !projectId) {
     throw new Error("Team ID and Project ID are required");
   }
 
   // Check project exists
   const projectExists = await Project.exists({ _id: projectId });
   if (!projectExists) {
     throw new Error("Project not found");
   }
 
   // Check team exists
   const team = await Team.findById(teamId);
   if (!team) {
     throw new Error("Team not found");
   }
 
   // Prevent duplicate assignment
   if (team.projects.includes(projectId)) {
     throw new Error("This project is already assigned to the team");
   }
 
   // Add project to the array
   team.projects.push(projectId);
   await team.save();
 
   // Populate for returning
   return await team.populate("projects");
 };
 