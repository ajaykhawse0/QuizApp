const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    maxParticipants: {
      type: Number,
      default: null, // null means unlimited
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        hasCompleted: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    prizeInfo: {
      first: String,
      second: String,
      third: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ "participants.user": 1 });

// Virtual for participant count
contestSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Method to check if contest is full
contestSchema.methods.isFull = function () {
  if (!this.maxParticipants) return false;
  return this.participants.length >= this.maxParticipants;
};

// Method to check if user has joined
contestSchema.methods.hasUserJoined = function (userId) {
  return this.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
};

// Method to update contest status based on time
contestSchema.methods.updateStatus = function () {
  const now = new Date();
  if (now < this.startTime) {
    this.status = "upcoming";
  } else if (now >= this.startTime && now < this.endTime) {
    this.status = "live";
  } else {
    this.status = "completed";
  }
  return this.status;
};

// Static method to update all contest statuses
contestSchema.statics.updateAllStatuses = async function () {
  const now = new Date();
  
  await this.updateMany(
    { startTime: { $gt: now }, status: { $ne: "upcoming" } },
    { status: "upcoming" }
  );
  
  await this.updateMany(
    { startTime: { $lte: now }, endTime: { $gt: now }, status: { $ne: "live" } },
    { status: "live" }
  );
  
  await this.updateMany(
    { endTime: { $lte: now }, status: { $ne: "completed" } },
    { status: "completed" }
  );
};

module.exports = mongoose.model("Contest", contestSchema);
