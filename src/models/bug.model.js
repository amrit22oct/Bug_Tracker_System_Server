import mongoose from "mongoose";
const { Schema } = mongoose;

const bugSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Bug title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
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
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Each tag cannot exceed 30 characters"],
      },
    ],

    // 🧑‍💻 Assignment
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ReportedBy field is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
    },

    // 📎 File Attachments (images, PDFs, etc.)
    attachments: [
      {
        fileName: { type: String },
        fileType: { type: String },
        fileUrl: { type: String }, // Cloud or local storage path
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // 💬 Discussion / Comments on bug
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // 👁️ Review by manager/admin
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Performance indexes
bugSchema.index({ status: 1, priority: 1 });
bugSchema.index({ projectId: 1 });
bugSchema.index({ assignedTo: 1 });

// Title check
bugSchema.pre("save", function (next) {
  if (!this.title.trim()) return next(new Error("Bug title cannot be empty"));
  next();
});

export default mongoose.model("Bug", bugSchema);
