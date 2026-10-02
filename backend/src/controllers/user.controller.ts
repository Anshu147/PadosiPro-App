import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getCurrentUser } from "../services/user.service.js";

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }
        const user = await getCurrentUser(req.userId)
        return res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "User not found"
        })
    }
}