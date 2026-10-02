import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import type { RegisterInput } from '../validators/auth.validator.js'
import { createOtp } from './otp.service.js'
import { sendVerificationOtp } from './email.service.js'
import { includes } from 'zod'
import { generateAccessToken } from '../utils/jwt.js'
export const registerUser = async (input: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    // Existing account
    if (existingUser) {
        // Already verified → don't allow re-registration
        if (existingUser.emailVerified) {
            throw new Error("An account with this email already exists");
        }

        // Generate OTP first.
        // This also enforces the 30-second resend cooldown.
        const otp = await createOtp(existingUser.id);

        // Only change the password after OTP creation succeeds.
        const passwordHash = await bcrypt.hash(input.password, 12);

        await prisma.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                passwordHash,
            },
        });

        await sendVerificationOtp(existingUser.email, otp);

        return {
            id: existingUser.id,
            email: existingUser.email,
            emailVerified: false,
        };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
        },
        select: {
            id: true,
            email: true,
            emailVerified: true,
        },
    });

    try {
        const otp = await createOtp(user.id);
        await sendVerificationOtp(user.email, otp);
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: user.id,
            },
        });

        throw error;
    }

    return user;
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            profile: true
        }
    })
    if (!user) {
        throw new Error("Invalid email or password")
    }

    if (!user.emailVerified) {
        throw new Error("Please verify your email before logging in")
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw new Error("Invalid email or password")
    }

    const token = generateAccessToken(user.id)

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            profileCompleted: Boolean(user.profile)
        }
    }
}

