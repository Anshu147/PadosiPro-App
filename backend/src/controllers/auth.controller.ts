import type { Request, Response } from "express";
import { loginSchema, registerSchema, resendOtpSchema, verifyEmailSchema } from "../validators/auth.validator.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import { success } from "zod";
import { prisma } from "../config/prisma.js";
import { resendOtp, verifyOtp } from "../services/otp.service.js";

export const register = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            error: result.error.flatten().fieldErrors

        })
    }
    try {
        const user = await registerUser(result.data)
        return res.status(201).json({
            success: true,
            message: "Registeration successful",
            data: {
                user,
            }
        })
    } catch (error) {
        if (
            error instanceof Error && error.message === "An account with this email already exists"
        ) {
            return res.status(409).json({
                succcess: false,
                message: error.message
            })
        }
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    const result = verifyEmailSchema.safeParse(req.body);
    console.log(result);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            error: result.error.flatten().fieldErrors
        })
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: result.data.email
            }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            })
        }
        await verifyOtp(user.id, result.data.otp)
        return res.status(200).json({
            success: true,
            message: "Email Verified successully.."
        })
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message: "Soemthing went wrong"
            })
        }
        const knownErrors = [
            "OTP not found or already used",
            "OTP has expired",
            "Maximum OTP attempts exceeded",
            "Invalid OTP",
        ]

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
}


export const resendVerficationOtp = async (req: Request, res: Response) => {
    const result = resendOtpSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors
        })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: result.data.email
            }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            })
        }
        await resendOtp(user.id)
        return res.status(200).json({
            success: true,
            message: "A new verficaition OTP has been sent"
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes("30 seconds")) {
            return res.status(429).json({
                success: false,
                message: error.message,
            })
        }
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong "
        })

    }
}

export const login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        })
    }

    try {
        const resultData = await loginUser(result.data.email, result.data.password)

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: resultData
        })
    } catch (error) {
        if (error instanceof Error && error.message === "Please verify your email before logging in") {
            return res.status(403).json({
                success: false,
                message: "EMAIL_NOT_VERIFIED"
            })
        }
        if (error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: error.message
            })
        }

        console.log(error)

        return res.status(500).json({
            success: false,
            message: "Something went wrong "
        })
    }
}