import {
   getBugsByTeamService,
   getBugsByTeamLeaderService,
 } from "../../services/team.leader/bug.service.js";
 
 export const getBugsByTeam = async (req, res) => {
   try {
     const { teamId } = req.params;
     const { limit, skip } = req.query;
 
     const bugs = await getBugsByTeamService(teamId, {
       limit: parseInt(limit) || 50,
       skip: parseInt(skip) || 0,
     });
 
     res.status(200).json({
       success: true,
       message: "🐞 Bugs fetched for team successfully",
       data: bugs,
     });
   } catch (e) {
     res.status(400).json({ success: false, message: e.message });
   }
 };
 
 export const getBugsByTeamLeader = async (req, res) => {
   try {
     const { teamLeaderId } = req.params;
     const { limit, skip } = req.query;
 
     const bugs = await getBugsByTeamLeaderService(teamLeaderId, {
       limit: parseInt(limit) || 50,
       skip: parseInt(skip) || 0,
     });
 
     res.status(200).json({
       success: true,
       message: "🐞 Bugs fetched for team leader successfully",
       data: bugs,
     });
   } catch (e) {
     res.status(400).json({ success: false, message: e.message });
   }
 };
 