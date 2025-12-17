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
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // 🌐 External references
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

    // 📂 Optional project files (like specs, PDFs, etc.)
    files: [
      {
        name: { type: String },
        fileType: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: ["Active", "On Hold", "Completed", "Archived"],
      default: "Active",
    },

    // 🔗 Related bugs (optional for fast lookup)
    bugs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bug",
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],

    archived: {
      type: Boolean,
      default: false,
    },

    // 📊 Project bug stats
    stats: {
      totalBugs: { type: Number, default: 0 },
      openBugs: { type: Number, default: 0 },
      resolvedBugs: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-update bug stats when bugs are added or removed
projectSchema.methods.updateBugStats = async function () {
  const Bug = mongoose.model("Bug");
  const total = await Bug.countDocuments({ projectId: this._id });
  const open = await Bug.countDocuments({ projectId: this._id, status: "Open" });
  const resolved = await Bug.countDocuments({ projectId: this._id, status: "Resolved" });

  this.stats = { totalBugs: total, openBugs: open, resolvedBugs: resolved };
  await this.save();
};

export default mongoose.model("Project", projectSchema);
