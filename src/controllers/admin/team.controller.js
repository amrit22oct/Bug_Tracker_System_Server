import {
   createTeamService,
   getTeamByIdService,
   getAllTeamsService,
   assignProjectToTeamService,
 } from "../../services/admin/team.service.js";
 

  

 
 /* ================= CREATE TEAM ================= */
 export const createTeam = async (req, res) => {
   try {
     const team = await createTeamService(req.body);
 
     res.status(201).json({
       success: true,
       message: "Team created successfully",
       data: team,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET TEAM BY ID ================= */
 export const getTeamById = async (req, res) => {
   try {
     const { teamId } = req.params;
 
     const team = await getTeamByIdService(teamId);
 
     res.status(200).json({
       success: true,
       data: team,
     });
   } catch (error) {
     res.status(404).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET ALL TEAMS ================= */
 export const getAllTeams = async (req, res) => {
   try {
     const teams = await getAllTeamsService();
 
     res.status(200).json({
       success: true,
       data: teams,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };

 export const assignProjectToTeam = async (req, res) => {
   try {
     const { teamId } = req.params;
     const { projectId } = req.body;
 
     const team = await assignProjectToTeamService(teamId, projectId);
 
     res.status(200).json({
       success: true,
       message: "Project assigned to team successfully",
       data: team,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 