import express from "express";
import {
    createTask,
    deleteTask,
    filterTasks,
    getTasks,
    toggleComplete,
    updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/add", createTask);
router.get("/", getTasks);
console.log("✅ taskRoutes loaded successfully");

router.put("/:id/update", updateTask);   // ✅ correct
router.delete("/:id", deleteTask);
router.patch("/:id/complete", toggleComplete);
router.get("/filter", filterTasks);

export default router;
