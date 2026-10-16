import mongoose from "mongoose";

const employeeSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill reference is required"],
    },
    proficiency: {
      type: Number,
      required: [true, "Proficiency level is required"],
      min: [1, "Proficiency must be between 1 and 5"],
      max: [5, "Proficiency must be between 1 and 5"],
    },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    team: {
      type: String,
      required: [true, "Team is required"],
      trim: true,
    },

    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    skills: {
      type: [employeeSkillSchema],
      default: [],
    },

    roles: {
      type: [
        {
          type: String,
          enum: ["EMPLOYEE", "TEAM_MANAGER", "TASK_MANAGER"],
        },
      ],
      default: ["EMPLOYEE"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;