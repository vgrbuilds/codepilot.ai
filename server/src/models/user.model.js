import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true
    },

    username: {
      type: String,
      required: true
    },

    email: {
      type: String
    },

    avatarUrl: {
      type: String
    },

    githubUsername: {
      type: String
    },

    githubAccessToken: {
      type: String
    },

    stats: {
      reposAnalyzed: {
        type: Number,
        default: 0
      },
      questionsAsked: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);