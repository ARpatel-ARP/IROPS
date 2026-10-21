import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      department,
      team,
      jobTitle,
      skills,
      roles,
    } = req.body;

    // Validate required fields
    if (
      !employeeId?.trim() ||
      !name?.trim() ||
      !email?.trim() ||
      !department?.trim() ||
      !team?.trim() ||
      !jobTitle?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, name, email, department, team, and job title are required.",
      });
    }

    // Validate skills
    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array.",
      });
    }

    // Validate roles
    const allowedRoles = ["EMPLOYEE", "TEAM_MANAGER", "TASK_MANAGER"];

    if (
      roles !== undefined &&
      (!Array.isArray(roles) ||
        roles.length === 0 ||
        !roles.every((role) => allowedRoles.includes(role)))
    ) {
      return res.status(400).json({
        success: false,
        message: `Roles must be an array containing only: ${allowedRoles.join(", ")}.`,
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing employee
    const existingEmployee = await Employee.findOne({
      $or: [
        { employeeId: employeeId.trim() },
        { email: normalizedEmail },
      ],
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message:
          "An employee with this employee ID or email already exists.",
      });
    }

    // Create employee
    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: normalizedEmail,
      department: department.trim(),
      team: team.trim(),
      jobTitle: jobTitle.trim(),
      skills: skills ?? [],
      roles: roles ?? ["EMPLOYEE"],
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or email already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create employee.",
    });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("skills.skill", "name category")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employees.",
    });
  }
};

export const updateEmployeeSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array.",
      });
    }

    for (const item of skills) {
      if (
        !item.skill ||
        !/^[0-9a-fA-F]{24}$/.test(String(item.skill)) ||
        !Number.isInteger(item.proficiency) ||
        item.proficiency < 1 ||
        item.proficiency > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each skill must have a valid skill ID and proficiency between 1 and 5.",
        });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: { skills } },
      {
        new: true,
        runValidators: true,
      }
    ).populate("skills.skill", "name category");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee skills updated successfully.",
      data: employee,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update employee skills error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee skills.",
    });
  }
};