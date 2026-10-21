import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployeeSkills,
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getEmployees);
router.patch("/:id/skills", updateEmployeeSkills);

export default router;