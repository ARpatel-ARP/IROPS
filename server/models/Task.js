import mongoose from "mongoose";

const requiredSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill reference is required"],
    },
    minimumProficiency: {
      type: Number,
      required: [true, "Minimum proficiency is required"],
      min: [1, "Minimum proficiency must be between 1 and 5"],
      max: [5, "Minimum proficiency must be between 1 and 5"],
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must contain at least 3 characters"],
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Task manager is required"],
    },

    requiredSkills: {
      type: [requiredSkillSchema],
      validate: {
        validator: (skills) => skills.length > 0,
        message: "At least one required skill must be specified",
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
    },

    teamSize: {
      type: Number,
      required: [true, "Team size is required"],
      min: [1, "Team size must be at least 1"],
      max: [100, "Team size cannot exceed 100"],
    },

    startDate: {
      type: Date,
    },

    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, department: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;