import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: function () {
        return this.user;
      },
    },
    collaborators: [collaboratorSchema],
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ owner: 1, completed: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ "collaborators.user": 1, completed: 1 });
taskSchema.index({ "collaborators.user": 1, dueDate: 1 });
taskSchema.index({ "collaborators.status": 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
