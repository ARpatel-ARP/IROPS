import mongoose from "mongoose";
import Task from "../models/Task.js";
import Skill from "../models/Skill.js";
import Employee from "../models/Employee.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      createdBy,
      requiredSkills,
      teamSize,
      startDate,
      deadline,
      status,
    } = req.body;

    // Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof department !== "string" ||
      !department.trim() ||
      !createdBy ||
      !Array.isArray(requiredSkills) ||
      requiredSkills.length === 0 ||
      !Number.isInteger(teamSize) ||
      teamSize < 1 ||
      teamSize > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, department, task manager, required skills, and a valid team size are required.",
      });
    }

    // Validate task manager ID
    if (!mongoose.isValidObjectId(createdBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task manager ID.",
      });
    }

    // Validate status
    const allowedStatuses = [
      "DRAFT",
      "OPEN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status.",
      });
    }

    // Validate dates
    const parsedStartDate =
      startDate === undefined ? undefined : new Date(startDate);
    const parsedDeadline =
      deadline === undefined ? undefined : new Date(deadline);

    if (
      (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) ||
      (parsedDeadline && Number.isNaN(parsedDeadline.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date or deadline is invalid.",
      });
    }

    if (
      parsedStartDate &&
      parsedDeadline &&
      parsedDeadline < parsedStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be earlier than the start date.",
      });
    }

    // Validate each required skill
    const seenSkillIds = new Set();

    for (const item of requiredSkills) {
      if (
        !item ||
        !mongoose.isValidObjectId(item.skill) ||
        !Number.isInteger(item.minimumProficiency) ||
        item.minimumProficiency < 1 ||
        item.minimumProficiency > 5 ||
        (item.isMandatory !== undefined &&
          typeof item.isMandatory !== "boolean")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each required skill must have a valid skill ID, proficiency from 1 to 5, and an optional boolean isMandatory value.",
        });
      }

      if (seenSkillIds.has(String(item.skill))) {
        return res.status(400).json({
          success: false,
          message: "A skill cannot be listed more than once in a task.",
        });
      }

      seenSkillIds.add(String(item.skill));
    }

    // Confirm that the task manager exists
    const taskManager = await Employee.findById(createdBy);

    if (!taskManager) {
      return res.status(400).json({
        success: false,
        message: "The specified task manager does not exist.",
      });
    }

    // Confirm that the employee has the task manager role
    if (!taskManager.roles.includes("TASK_MANAGER")) {
      return res.status(403).json({
        success: false,
        message: "The specified employee is not a task manager.",
      });
    }

    // Confirm that all referenced skills exist
    const skillIds = requiredSkills.map((item) => item.skill);
    const existingSkills = await Skill.find({
      _id: { $in: skillIds },
    }).select("_id");

    if (existingSkills.length !== skillIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more required skills do not exist.",
      });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      department: department.trim(),
      createdBy,
      requiredSkills,
      teamSize,
      ...(parsedStartDate && { startDate: parsedStartDate }),
      ...(parsedDeadline && { deadline: parsedDeadline }),
      ...(status && { status }),
    });

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "employeeId name email department team roles")
      .populate("requiredSkills.skill", "name category");

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: populatedTask,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create task.",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "employeeId name department team roles")
      .populate("requiredSkills.skill", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks.",
    });
  }
};