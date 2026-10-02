import crypto from 'crypto';
import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { sendVerificationOtp } from './email.service.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

export const generateOtp = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
}

export const createOtp = async (userId: string): Promise<string> => {
    const recentOtp = await prisma.otp.findFirst({
        where: {
            userId,
            purpose: "EMAIL_VERIFICATION",
            createdAt: {
                gt: new Date(
                    Date.now() - RESEND_COOLDOWN_SECONDS * 1000
                )
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if (recentOtp) {
        throw new Error("Please wait 30 seconds before requesting another OTP")
    }

    const otp = generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);

    await prisma.otp.create({
        data: {
            userId,
            codeHash,
            purpose: "EMAIL_VERIFICATION",
            expiresAt: new Date(
                Date.now() + OTP_EXPIRY_MINUTES * 1000 * 60
            )
        }
    })
    return otp;
}


export const verifyOtp = async (userId: string, otp: string): Promise<void> => {
    console.log("Entered the verifyOtp")
    const record = await prisma.otp.findFirst({
        where: {
            userId,
            purpose: "EMAIL_VERIFICATION",
            used: false,
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    if (!record) {
        throw new Error("OTP not found or already used")
    }
    if (record.expiresAt.getTime() < Date.now()) {
        console.log("Hey")
        throw new Error("OTP has expired")
    }
    if (record.attempts >= MAX_ATTEMPTS) {
        throw new Error("Maximum OTP attempts exceeded")
    }

    const isValid = await bcrypt.compare(otp, record.codeHash);
    console.log(isValid, "This is valid")
    if (!isValid) {
        const updatedRecord = await prisma.otp.update({
            where: {
                id: record.id,
            },
            data: {
                attempts: {
                    increment: 1
                }
            }
        });
        if (updatedRecord.attempts >= MAX_ATTEMPTS)
            throw new Error("Maximum OTP attempts exceeded")
        throw new Error("Invalid OTP")
    }
    await prisma.$transaction(async (tx) => {
        await tx.otp.update({
            where: {
                id: record.id,
            },
            data: {
                used: true,
            },
        });

        await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                emailVerified: true,
            },
        });
    });

}

export const resendOtp = async (userId: string): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new Error("User not found")

    }
    if (user.emailVerified) {
        throw new Error("Email is already verified")
    }
    const otp = await createOtp(userId);

    await sendVerificationOtp(user.email, otp)
}