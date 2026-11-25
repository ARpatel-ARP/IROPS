import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
    },

    teamManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Team Manager reference is required"],
    },

    managerStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    managerRemarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },

    taskManagerStatus: {
      type: String,
      enum: ["PENDING", "SELECTED", "DECLINED"],
      default: "PENDING",
    },

    taskManagerRemarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: [
        "PENDING_MANAGER_APPROVAL",
        "PENDING_TASK_MANAGER_DECISION",
        "REJECTED_BY_MANAGER",
        "SELECTED",
        "DECLINED_BY_TASK_MANAGER",
        "WITHDRAWN",
      ],
      default: "PENDING_MANAGER_APPROVAL",
    },
  },
  { timestamps: true }
);

// An employee can express interest in a particular task only once.
interestSchema.index(
  { employee: 1, task: 1 },
  { unique: true }
);

const Interest = mongoose.model("Interest", interestSchema);

export default Interest;