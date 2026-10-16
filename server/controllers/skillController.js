import Skill from "../models/Skill.js";

// CREATE : 
export const createSkill = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (
      typeof name !== "string" ||
      typeof category !== "string" ||
      !name.trim() ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill name and category are required.",
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Skill created successfully.",
      data: skill,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A skill with this name already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create skill error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create skill.",
    });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Get skills error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve skills.",
    });
  }
};