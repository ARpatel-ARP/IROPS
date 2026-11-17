import express from "express";
import { matchEmployeesToTask } from "../controllers/matchController.js";

const router = express.Router();

router.get("/task/:taskId", matchEmployeesToTask);

export default router;