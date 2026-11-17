import mongoose from "mongoose";
import Task from "../models/Task.js";
import Employee from "../models/Employee.js";

export const matchEmployeesToTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate task ID
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    // Find the task and populate required skills
    const task = await Task.findById(taskId).populate(
      "requiredSkills.skill",
      "name category"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Only open tasks can be matched with employees.",
      });
    }

    // Retrieve active employees
    const employees = await Employee.find({
      isActive: true,
    }).populate("skills.skill", "name category");

    const mandatorySkills = task.requiredSkills.filter(
      (item) => item.isMandatory
    );

    const optionalSkills = task.requiredSkills.filter(
      (item) => !item.isMandatory
    );

    const qualifiedEmployees = [];

    for (const employee of employees) {
      // Prevent the task creator from being automatically suggested
      // as a candidate for their own task.
      if (employee._id.equals(task.createdBy._id || task.createdBy)) {
        continue;
      }

      const employeeSkillMap = new Map();

      for (const employeeSkill of employee.skills) {
        if (employeeSkill.skill?._id) {
          employeeSkillMap.set(
            employeeSkill.skill._id.toString(),
            {
              name: employeeSkill.skill.name,
              proficiency: employeeSkill.proficiency,
            }
          );
        }
      }

      const matchedMandatorySkills = [];
      const missingMandatorySkills = [];

      for (const requirement of mandatorySkills) {
        const skillId = requirement.skill._id.toString();
        const employeeSkill = employeeSkillMap.get(skillId);

        if (
          employeeSkill &&
          employeeSkill.proficiency >= requirement.minimumProficiency
        ) {
          matchedMandatorySkills.push({
            skillId,
            skillName: requirement.skill.name,
            requiredProficiency: requirement.minimumProficiency,
            employeeProficiency: employeeSkill.proficiency,
          });
        } else {
          missingMandatorySkills.push({
            skillId,
            skillName: requirement.skill.name,
            requiredProficiency: requirement.minimumProficiency,
            employeeProficiency: employeeSkill
              ? employeeSkill.proficiency
              : null,
            reason: employeeSkill
              ? "PROFICIENCY_TOO_LOW"
              : "SKILL_NOT_FOUND",
          });
        }
      }

      // An employee qualifies only if every mandatory skill is satisfied.
      if (missingMandatorySkills.length > 0) {
        continue;
      }

      const matchedOptionalSkills = [];

      for (const requirement of optionalSkills) {
        const skillId = requirement.skill._id.toString();
        const employeeSkill = employeeSkillMap.get(skillId);

        if (
          employeeSkill &&
          employeeSkill.proficiency >= requirement.minimumProficiency
        ) {
          matchedOptionalSkills.push({
            skillId,
            skillName: requirement.skill.name,
            requiredProficiency: requirement.minimumProficiency,
            employeeProficiency: employeeSkill.proficiency,
          });
        }
      }

      qualifiedEmployees.push({
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          department: employee.department,
          team: employee.team,
          jobTitle: employee.jobTitle,
        },
        matchedMandatorySkills,
        matchedOptionalSkills,
        mandatorySkillsSatisfied: true,
      });
    }

    return res.status(200).json({
      success: true,
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        teamSize: task.teamSize,
      },
      matchingCriteria: {
        mandatorySkillCount: mandatorySkills.length,
        optionalSkillCount: optionalSkills.length,
        rule: "All mandatory skills must meet or exceed their required proficiency.",
      },
      count: qualifiedEmployees.length,
      data: qualifiedEmployees,
    });
  } catch (error) {
    console.error("Employee matching error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to match employees to task.",
    });
  }
};