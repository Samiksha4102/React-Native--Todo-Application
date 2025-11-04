import Task from "../models/Task.js";

// ➕ Create Task
export const createTask = async (req, res) => {
    try {
        const { taskName, date, time, priority, category, repeat } = req.body;
        if (!taskName || !time) {
            return res.status(400).json({ success: false, message: "Task name and time are required" });
        }
        const newTask = new Task({ taskName, date, time, priority, category, repeat });
        await newTask.save();
        res.status(201).json({ success: true, message: "Task added successfully", task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📋 Get All Tasks
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✏️ Update Task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating task:", id, req.body); // ✅ Debug log
    console.log("🛠 Update route hit:", req.params.id);

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTask)
      return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ❌ Delete Task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Task.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Mark as Complete / Incomplete
export const toggleComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        task.completed = !task.completed;
        await task.save();
        res.json({ success: true, message: "Task completion toggled", task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔍 Filter by Category
export const filterTasks = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const tasks = await Task.find(filter);
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
