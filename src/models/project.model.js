// src/models/project.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: ["Planned", "In Progress", "On Hold", "Completed", "Archived", "Cancelled"],
      default: "Planned",
    },

    projectLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid project link (http/https)"],
    },
    documentationLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid documentation link"],
    },

    files: [
      {
        name: String,
        fileType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    teamLeader: { type: Schema.Types.ObjectId, ref: "User" },

    startDate: { type: Date, default: Date.now },
    endDate: Date,

    estimatedStartDate: Date,
    estimatedEndDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,

    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    category: String,
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      
    },
    
    
    milestones: [
      {
        name: String,
        dueDate: Date,
        status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
      },
    ],
    progressPercentage: { type: Number, default: 0 },
    budget: Number,
    client: String,
    tags: [{ type: String, trim: true, maxlength: 30 }],
    archived: { type: Boolean, default: false },
    deletedAt: Date,

    bugs: [{ type: Schema.Types.ObjectId, ref: "Bug" }],
    reports: [{ type: Schema.Types.ObjectId, ref: "ReportBug" }],

    stats: {
      totalBugs: { type: Number, default: 0 },
      openBugs: { type: Number, default: 0 },
      resolvedBugs: { type: Number, default: 0 },
      pendingReports: { type: Number, default: 0 },
      approvedReports: { type: Number, default: 0 },
    },

    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notifications: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* ================= METHODS ================= */

// Sync Bug Stats
projectSchema.methods.updateBugStats = async function () {
  const Bug = mongoose.model("Bug");
  const total = await Bug.countDocuments({ projectId: this._id });
  const open = await Bug.countDocuments({ projectId: this._id, status: "Open" });
  const resolved = await Bug.countDocuments({ projectId: this._id, status: "Resolved" });

  this.stats.totalBugs = total;
  this.stats.openBugs = open;
  this.stats.resolvedBugs = resolved;
  await this.save();
};

// Sync Report Stats
projectSchema.methods.updateReportStats = async function () {
  const ReportBug = mongoose.model("ReportBug");
  const pending = await ReportBug.countDocuments({ projectId: this._id, status: "Pending" });
  const approved = await ReportBug.countDocuments({ projectId: this._id, status: "Approved" });

  this.stats.pendingReports = pending;
  this.stats.approvedReports = approved;
  await this.save();
};

// Auto-update progress based on milestones
projectSchema.methods.updateProgress = async function () {
  if (!this.milestones || this.milestones.length === 0) return;
  const completed = this.milestones.filter((m) => m.status === "Completed").length;
  this.progressPercentage = Math.round((completed / this.milestones.length) * 100);
  await this.save();
};

export default mongoose.model("Project", projectSchema);
