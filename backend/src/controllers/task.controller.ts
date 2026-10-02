import { Request, Response } from "express";
import { getCategories, getTasks } from "../services/task.service.js";
import { getSelectedTasks, saveSelectedTasks } from "../services/task-selection.service.js";
import { selectedTasksSchema } from "../validators/task.validator.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const listTasks = async (req: Request, res: Response) => {
    try {
        const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
        const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
        const tasks = await getTasks({ category, search })
        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        })
    } catch (error) {
        console.error("List tasks error", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
        })
    }
}


export const listCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await getCategories();

        return res.status(200).json({
            succes: true,
            coutn: categories.length,
            categories
        })
    } catch (error) {
        console.error("List categories error", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categoriess "
        })
    }
}
export const listSelectedTasks = async (
    req: AuthRequest,
    res: Response
) => {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const tasks = await getSelectedTasks(req.userId);

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error("Get selected tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch selected tasks",
        });
    }
}

export const updateSelectedTasks = async (
    req: AuthRequest,
    res: Response
) => {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const result = selectedTasksSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const tasks = await saveSelectedTasks(
            req.userId,
            result.data.taskIds
        );

        return res.status(200).json({
            success: true,
            message: "Task selection saved successfully",
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("Invalid task IDs:")
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Save selected tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save task selection",
        });
    }
}