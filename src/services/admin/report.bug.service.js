import ReportBug from "../../models/report.bug.model.js";
import Bug from "../../models/bug.model.js";
import Project from "../../models/project.model.js";
import User from "../../models/user.model.js";
import { createBugService } from "../../services/admin/bug.service.js"; 

/* ================= CREATE REPORT ================= */
export const createReportService = async (data, userId) => {
   const { projectId, bugId } = data;
 
   const project = await Project.findById(projectId);
   if (!project) throw new Error("Project not found");
 
   let bug;
 
   /* ================= BUG HANDLING ================= */
   if (bugId) {
     bug = await Bug.findById(bugId);
     if (!bug) throw new Error("Bug not found");
   } else {
     /* ---------- Dynamically extract bug fields ---------- */
     const bugFields = [
       "title",
       "description",
       "priority",
       "severity",
       "type",
       "tags",
       "environment",
       "reproducible",
       "attachments",
       "parentBug",
       "linkedBugs",
       "dueDate",
       "estimatedFixTime",
       "severityScore",
       "source",
       "assignedTo",
     ];
 
     const bugPayload = {};
 
     for (const field of bugFields) {
       if (data[field] !== undefined) {
         bugPayload[field] = data[field];
       }
     }
 
     bugPayload.projectId = projectId;
 
     bug = await createBugService(bugPayload, userId);
   }
 
   /* ================= REPORT HANDLING ================= */
   const reportFields = [
     "title",
     "stepsToReproduce",
     "expectedResult",
     "actualResult",
     "attachments",
   ];
 
   const reportPayload = {};
 
   for (const field of reportFields) {
     if (data[field] !== undefined) {
       reportPayload[field] = data[field];
     }
   }
 
   /* ================= CREATE REPORT ================= */
   const report = await ReportBug.create({
     ...reportPayload,
     title: reportPayload.title || bug.title,
     projectId,
     bugId: bug._id,
     reportedBy: userId,
     status: "Pending",
   });
 
   return report;
 };
 


/* ================= GET REPORTS BY PROJECT ================= */
export const getReportsByProjectService = async (projectId) => {
  return ReportBug.find({ projectId, deletedAt: null })
    .populate("reportedBy", "name email")
    .populate("reviewedBy", "name email")
    .populate("projectId", "name")
    .populate("bugId")
    .sort({ createdAt: -1 });
};

/* ================= GET REPORT BY ID ================= */
export const getReportByIdService = async (id) => {
  const report = await ReportBug.findById(id)
    .populate("reportedBy", "name email")
    .populate("reviewedBy", "name email")
    .populate("projectId", "name")
    .populate("bugId");

  if (!report) throw new Error("Report not found");
  return report;
};

/* ================= REVIEW REPORT ================= */
export const reviewReportService = async (id, payload, reviewerId) => {
  const report = await ReportBug.findById(id);
  if (!report) throw new Error("Report not found");

  const { status, reviewComment, assignedTo } = payload;

  if (!["Approved", "Rejected", "Duplicate"].includes(status)) {
    throw new Error("Invalid review status");
  }

  if (status === "Approved") {
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) throw new Error("Assigned user not found");
    }

    const bug = await Bug.create({
      title: report.title,
      description: report.description,
      priority: report.priority,
      severity: report.severity,
      projectId: report.projectId,
      reportedBy: report.reportedBy,
      assignedTo,
      attachments: report.attachments,
      environment: report.environment,
    });

    const project = await Project.findById(report.projectId);
    if (project) {
      project.stats.totalBugs += 1;
      project.stats.openBugs += 1;
      await project.save();
    }

    report.bugId = bug._id;
  }

  report.status = status;
  report.reviewComment = reviewComment;
  report.reviewedBy = reviewerId;
  report.reviewedAt = new Date();

  await report.save();
  return report;
};

/* ================= DELETE REPORT ================= */
export const deleteReportService = async (id) => {
  const report = await ReportBug.findById(id);
  if (!report) throw new Error("Report not found");

  report.deletedAt = new Date();
  await report.save();
  return true;
};
