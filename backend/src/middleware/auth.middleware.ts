import type { NextFunction, Request, Response } from "express";

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}

export interface AuthRequest extends Request {
    userId?: string
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        })
    }
    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            })
        }

        req.userId = decoded.userId;
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        })
    }
}