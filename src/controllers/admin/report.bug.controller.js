import {
   createReportService,
   getReportsByProjectService,
   getReportByIdService,
   reviewReportService,
   deleteReportService,
 } from "../../services/admin/report.bug.service.js";
 
 /* ================= CREATE REPORT ================= */
 export const createReport = async (req, res) => {
   try {
     const report = await createReportService(req.body, req.user._id);
     res.status(201).json({
       success: true,
       message: "🐞 Bug report submitted",
       data: report,
     });
   } catch (e) {
     res.status(400).json({ success: false, message: e.message });
   }
 };
 
 /* ================= GET REPORTS BY PROJECT ================= */
 export const getReportsByProject = async (req, res) => {
   try {
     const reports = await getReportsByProjectService(req.params.projectId);
     res.json({ success: true, count: reports.length, data: reports });
   } catch (e) {
     res.status(500).json({ success: false, message: e.message });
   }
 };
 
 /* ================= GET REPORT BY ID ================= */
 export const getReportById = async (req, res) => {
   try {
     const report = await getReportByIdService(req.params.id);
     res.json({ success: true, data: report });
   } catch (e) {
     res.status(404).json({ success: false, message: e.message });
   }
 };
 
 /* ================= REVIEW REPORT ================= */
 export const reviewReport = async (req, res) => {
   try {
     const report = await reviewReportService(
       req.params.id,
       req.body,
       req.user._id
     );
 
     res.json({
       success: true,
       message: "📋 Report reviewed successfully",
       data: report,
     });
   } catch (e) {
     res.status(400).json({ success: false, message: e.message });
   }
 };
 
 /* ================= DELETE REPORT ================= */
 export const deleteReport = async (req, res) => {
   try {
     await deleteReportService(req.params.id);
     res.json({ success: true, message: "🗑️ Report deleted" });
   } catch (e) {
     res.status(404).json({ success: false, message: e.message });
   }
 };
 