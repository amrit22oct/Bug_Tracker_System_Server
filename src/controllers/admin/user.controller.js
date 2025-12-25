import {
   getAllUsersService,
   getUserByIdService,
   getUsersByRoleService,
   getUserProjectsService,
   getUserTeamsService,
   getUserBugsService,
 } from "../../services/admin/user.service.js";
 
 /* ================= GET ALL USERS ================= */
 export const getAllUsers = async (req, res) => {
   try {
     const users = await getAllUsersService();
 
     res.status(200).json({
       success: true,
       message: "Users fetched successfully",
       data: users,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET USER BY ID ================= */
 export const getUserById = async (req, res) => {
   try {
     const user = await getUserByIdService(req.params.id);
 
     res.status(200).json({
       success: true,
       message: "User fetched successfully",
       data: user,
     });
   } catch (error) {
     res.status(404).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET USERS BY ROLE ================= */
 export const getUsersByRole = async (req, res) => {
   try {
     const users = await getUsersByRoleService(req.params.role);
 
     res.status(200).json({
       success: true,
       message: "Users fetched by role successfully",
       data: users,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET USER PROJECTS ================= */
 export const getUserProjects = async (req, res) => {
   try {
     const projects = await getUserProjectsService(req.params.id);
 
     res.status(200).json({
       success: true,
       message: "User projects fetched successfully",
       data: projects,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET USER TEAMS ================= */
 export const getUserTeams = async (req, res) => {
   try {
     const teams = await getUserTeamsService(req.params.id);
 
     res.status(200).json({
       success: true,
       message: "User teams fetched successfully",
       data: teams,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 
 /* ================= GET USER BUGS ================= */
 export const getUserBugs = async (req, res) => {
   try {
     const bugs = await getUserBugsService(req.params.id);
 
     res.status(200).json({
       success: true,
       message: "User bugs fetched successfully",
       data: bugs,
     });
   } catch (error) {
     res.status(400).json({
       success: false,
       message: error.message,
     });
   }
 };
 