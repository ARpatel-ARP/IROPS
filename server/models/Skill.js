import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Skill name must contain at least 2 characters"],
      maxlength: [100, "Skill name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Skill category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;