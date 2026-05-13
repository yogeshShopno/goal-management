const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    actionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Action",
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
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

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
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    order: {
      type: Number,
      default: 0,
    },
    /** checkbox: single done flag; numeric: count toward targetValue (labelled by targetType). */
    taskType: {
      type: String,
      enum: ["checkbox", "numeric"],
      default: "checkbox",
    },
    /** Goal amount for numeric tasks (e.g. 100). */
    targetValue: {
      type: Number,
      default: null,
    },
    /** What each unit represents, e.g. "call" for 100 calls. */
    targetType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

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
taskSchema.index({ actionId: 1, order: 1 });
taskSchema.index({ assignedUserId: 1 });
taskSchema.index({ assignedStaffId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ actionId: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
