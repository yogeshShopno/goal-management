const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
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
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    responsibleStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "pending"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
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

// Compound index for efficient queries
goalSchema.index({ ownerId: 1, createdAt: -1 });
goalSchema.index({ responsibleId: 1 });
goalSchema.index({ status: 1 });

module.exports = mongoose.model("Goal", goalSchema);
