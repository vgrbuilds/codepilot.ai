import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    project_name: {
      type: String,
      required: true
    },
    summary: {
      type: String
    },
    ingestionStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending"
    },
    github: {
      name: { type: String, required: true },
      fullName: { type: String, required: true },
      url: { type: String, required: true },
      branch: { type: String, default: "main" }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Project", projectSchema);
