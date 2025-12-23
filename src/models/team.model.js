import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true, // ✅ global unique team name
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    lead: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
   // Old
// projectId:{type:Schema.Types.ObjectId, ref: "Project"},

// New → multiple projects
projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],


    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: Date,
  },
  { timestamps: true }
);

/* ================= Indexes ================= */
teamSchema.index({ name: 1 }, { unique: true });
teamSchema.index({ lead: 1 });

export default mongoose.model("Team", teamSchema);
