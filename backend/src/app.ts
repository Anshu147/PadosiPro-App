import "dotenv/config";

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(helmet());
app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "PadosiPro API is running"
    })
})
app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/user", userRoutes);
export default app;