import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email("Please Provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 character long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(
    (data) => data.password === data.password, {
    message: "Password don not match", path: ['confimPassword']
}
)
export const verifyEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export const resendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().email("Please provice a valid email address"),
})

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required")
})
export type RegisterInput = z.infer<typeof registerSchema>