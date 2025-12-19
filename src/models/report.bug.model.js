// src/models/report.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const reportBugSchema = new Schema(
  {
    // Reporter
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Project context
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Linked bug (after approval)
    bugId: {
      type: Schema.Types.ObjectId,
      ref: "Bug",
    },

    /* ======================
       Bug Core Fields
    ====================== */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Duplicate"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    severity: {
      type: String,
      enum: ["Minor", "Major", "Critical"],
      default: "Minor",
    },

    tags: [{ type: String, trim: true, maxlength: 30 }],

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User", // optional reviewer/assignee
    },

    /* ======================
       Reproduction Details
    ====================== */

    stepsToReproduce: [{ type: String, trim: true }],
    expectedResult: String,
    actualResult: String,

    environment: {
      os: String,
      browser: String,
      device: String,
      appVersion: String,
    },

    reproducible: { type: Boolean, default: true },

    /* ======================
       Attachments & Comments
    ====================== */

    attachments: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    /* ======================
       Review & Moderation
    ====================== */

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewComment: {
      type: String,
      trim: true,
    },

    reviewedAt: Date,

    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: "ReportBug",
    },

    /* ======================
       Tracking & Meta
    ====================== */

    dueDate: Date,
    estimatedFixTime: Number,

    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    history: [
      {
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    /* ======================
       Soft Delete
    ====================== */

    deletedAt: Date,
  },
  { timestamps: true }
);

/* ======================
   Indexes
====================== */
reportBugSchema.index({ projectId: 1 });
reportBugSchema.index({ reportedBy: 1 });
reportBugSchema.index({ status: 1 });
reportBugSchema.index({ priority: 1, severity: 1 });

export default mongoose.model("ReportBug", reportBugSchema);
