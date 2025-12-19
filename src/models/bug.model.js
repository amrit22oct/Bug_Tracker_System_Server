// src/models/bug.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const bugSchema = new Schema(
  {
    /* ======================
       Core Bug Info
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
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
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

    type: {
      type: String,
      enum: ["UI", "Backend", "Performance", "Security", "Crash", "Logic"],
    },

    tags: [{ type: String, trim: true, maxlength: 30 }],

    /* ======================
       Ownership & Relations
    ====================== */
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    parentBug: {
      type: Schema.Types.ObjectId,
      ref: "Bug",
    },
    
    linkedBugs: [{ type: Schema.Types.ObjectId, ref: "Bug" }],
    

    /* ======================
       Environment & Repro
    ====================== */
    environment: {
      os: String,
      browser: String,
      device: String,
      appVersion: String,
    },

    reproducible: {
      type: Boolean,
      default: true,
    },

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
       Review & Workflow
    ====================== */
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isReviewed: { type: Boolean, default: false },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Open", "In Progress", "Resolved", "Closed"],
        },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],

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
       Resolution & Analysis
    ====================== */
    resolutionSummary: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    rootCause: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    dueDate: Date,
    resolutionDate: Date,

    /* ======================
       Metrics & Tracking
    ====================== */
    estimatedFixTime: Number,
    actualFixTime: Number,

    severityScore: {
      type: Number,
      min: 1,
      max: 10,
    },

    reopenCount: {
      type: Number,
      default: 0,
    },

    source: {
      type: String,
      enum: ["Manual", "Automated Test", "Customer", "Monitoring", "QA"],
      default: "Manual",
    },

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
bugSchema.index({ projectId: 1 });
bugSchema.index({ status: 1, priority: 1 });
bugSchema.index({ assignedTo: 1 });
bugSchema.index({ reportedBy: 1 });
bugSchema.index({ severity: 1 });
bugSchema.index({ createdAt: -1 });

/* ======================
   Hooks
====================== */

// Title validation
bugSchema.pre("save", function (next) {
  if (!this.title.trim()) {
    return next(new Error("Bug title cannot be empty"));
  }
  next();
});

// Auto-set resolution date
bugSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Resolved") {
    this.resolutionDate = new Date();
  }
  next();
});

export default mongoose.model("Bug", bugSchema);
