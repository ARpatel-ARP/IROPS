import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findById(decoded.id).select(
      "-passwordHash"
    );

    if (!employee || !employee.isActive) {
      return res.status(401).json({
        success: false,
        message: "Employee account not found or inactive.",
      });
    }

    req.employee = employee;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.employee || !req.employee.roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const hasPermission = req.employee.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};