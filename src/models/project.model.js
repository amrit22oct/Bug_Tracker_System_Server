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

    // Links
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

    // Optional project files
    files: [
      {
        name: String,
        fileType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Project members & management
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" }, // optional PM

    startDate: Date,
    endDate: Date,
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    category: String,
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

    status: { type: String, enum: ["Active", "On Hold", "Completed", "Archived"], default: "Active" },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    archived: { type: Boolean, default: false },
    deletedAt: Date,

    // Bugs
    bugs: [{ type: Schema.Types.ObjectId, ref: "Bug" }],

    // Project stats
    stats: {
      totalBugs: { type: Number, default: 0 },
      openBugs: { type: Number, default: 0 },
      resolvedBugs: { type: Number, default: 0 },
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

projectSchema.methods.updateBugStats = async function () {
  const Bug = mongoose.model("Bug");
  const total = await Bug.countDocuments({ projectId: this._id });
  const open = await Bug.countDocuments({ projectId: this._id, status: "Open" });
  const resolved = await Bug.countDocuments({ projectId: this._id, status: "Resolved" });

  this.stats = { totalBugs: total, openBugs: open, resolvedBugs: resolved };
  await this.save();
};

export default mongoose.model("Project", projectSchema);
