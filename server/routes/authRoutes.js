import express from "express";
import { loginEmployee } from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/login", loginEmployee);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    employee: req.employee,
  });
});
router.get(
  "/task-manager-check",
  protect,
  authorizeRoles("TASK_MANAGER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Task Manager access granted.",
      employee: req.employee.name,
    });
  }
);

export default router;
