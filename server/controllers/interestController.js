import Interest from "../models/Interest.js";
import Task from "../models/Task.js";
import Employee from "../models/Employee.js";

export const createInterest = async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    // Find the task
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "You can only apply for open tasks.",
      });
    }

    // Prevent task creator from applying to their own task
    if (task.createdBy.equals(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply for your own task.",
      });
    }

    // Find the employee's assigned Team Manager
    if (!req.employee.teamManager) {
      return res.status(400).json({
        success: false,
        message: "No Team Manager is assigned to your account.",
      });
    }

    const teamManager = await Employee.findOne({
      _id: req.employee.teamManager,
      isActive: true,
      roles: "TEAM_MANAGER",
    });

    if (!teamManager) {
      return res.status(400).json({
        success: false,
        message: "Your assigned Team Manager is unavailable.",
      });
    }

    // Create interest request
    const interest = await Interest.create({
      employee: employeeId,
      task: taskId,
      teamManager: teamManager._id,
    });

    return res.status(201).json({
      success: true,
      message: "Interest submitted successfully.",
      data: interest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already expressed interest in this task.",
      });
    }

    console.error("Interest creation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to submit interest.",
    });
  }
};