const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ownerStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    assignedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedStaffIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "pending"],
      default: "todo",
    },
    updates: [
      {
        assignedUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedStaffId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff",
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 2000,
        },
        actionText: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient queries
actionSchema.index({ goalId: 1 });
actionSchema.index({ ownerId: 1 });
actionSchema.index({ status: 1 });
actionSchema.index({ goalId: 1, status: 1 });

module.exports = mongoose.model("Action", actionSchema);
