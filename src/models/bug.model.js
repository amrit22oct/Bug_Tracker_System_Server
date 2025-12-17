// src/models/bug.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const bugSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true },
    status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
    severity: { type: String, enum: ["Minor", "Major", "Critical"], default: "Minor" },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },

    // Attachments
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Comments
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Review & workflow
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isReviewed: { type: Boolean, default: false },

    // New fields
    history: [
      {
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    dueDate: Date,
    resolutionDate: Date,
    linkedBugs: [{ type: Schema.Types.ObjectId, ref: "Bug" }],
    environment: String,
    reproducible: { type: Boolean, default: true },
    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    estimatedFixTime: Number,
    severityScore: Number,
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes
bugSchema.index({ status: 1, priority: 1 });
bugSchema.index({ projectId: 1 });
bugSchema.index({ assignedTo: 1 });

// Title validation
bugSchema.pre("save", function (next) {
  if (!this.title.trim()) return next(new Error("Bug title cannot be empty"));
  next();
});

export default mongoose.model("Bug", bugSchema);
