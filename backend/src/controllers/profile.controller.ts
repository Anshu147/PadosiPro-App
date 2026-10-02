import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getProfile, upsertProfile } from "../services/profile.service.js";
import { profileSchema } from "../validators/profile.validator.js";



export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }
        const profile = await getProfile(req.userId)
        return res.status(200).json({
            success: true,
            profile,
            profileCompleted: Boolean(profile)
        })
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }

}

export const saveMyProfile = async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const result = profileSchema.safeParse(req.body)


    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
    }
    try {
        const profile = await upsertProfile(
            req.userId,
            result.data
        );

        return res.status(200).json({
            success: true,
            message: "Profile saved successfully",
            profile,
        });
    } catch (error) {
        console.error("Save profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save profile",
        });
    }
}