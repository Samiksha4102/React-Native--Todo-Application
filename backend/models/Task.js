import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    date: { type: String, default: "" },
    time: { type: String, required: true },
    priority: { type: String, enum: ["", "Low", "High", "Very High"], default: "" },
    category: { type: String, enum: ["", "Work", "Personal", "Wishlist"], default: "" },
    repeat: { type: String, enum: ["", "Hours", "Daily", "Weekly", "Yearly"], default: "" },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Task", taskSchema);
