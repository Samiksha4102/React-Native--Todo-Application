import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js"; // 👈 import the routes

dotenv.config();
const app = express();

// ✅ CORS setup
app.use(cors({
  origin: ["http://localhost:8081", "http://192.168.1.13:8081"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Task Routes
app.use("/api/tasks", taskRoutes); // 👈 use routes here

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));

