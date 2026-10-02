import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        otp: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            update: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock("../../config/prisma.js", () => ({
    prisma: prismaMock,
}));

vi.mock("../email.service.js", () => ({
    sendVerificationOtp: vi.fn(),
}));

import {
    createOtp,
    generateOtp,
    verifyOtp,
} from "../otp.service.js";

describe("OTP Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("generateOtp", () => {
        it("should generate a 6-digit OTP", () => {
            const otp = generateOtp();

            expect(otp).toMatch(/^\d{6}$/);
        });
    });

    describe("createOtp", () => {
        it("should reject requests within the resend cooldown", async () => {
            prismaMock.otp.findFirst.mockResolvedValue({
                id: "existing-otp",
                createdAt: new Date(),
            });

            await expect(
                createOtp("user-123")
            ).rejects.toThrow(
                "Please wait 30 seconds before requesting another OTP"
            );

            expect(prismaMock.otp.create).not.toHaveBeenCalled();
        });

        it("should create a new OTP when cooldown has passed", async () => {
            prismaMock.otp.findFirst.mockResolvedValue(null);

            prismaMock.otp.create.mockResolvedValue({
                id: "otp-123",
            });

            const otp = await createOtp("user-123");

            expect(otp).toMatch(/^\d{6}$/);

            expect(prismaMock.otp.create).toHaveBeenCalledTimes(1);

            const createCall =
                prismaMock.otp.create.mock.calls[0][0];

            expect(createCall.data.userId).toBe("user-123");

            expect(createCall.data.purpose).toBe(
                "EMAIL_VERIFICATION"
            );

            // OTP must be hashed before being stored.
            expect(createCall.data.codeHash).not.toBe(otp);

            // OTP should expire in the future.
            expect(
                createCall.data.expiresAt.getTime()
            ).toBeGreaterThan(Date.now());
        });
    });

    describe("verifyOtp", () => {
        it("should reject an expired OTP", async () => {
            prismaMock.otp.findFirst.mockResolvedValue({
                id: "otp-123",
                userId: "user-123",
                codeHash: "$2b$10$invalidhash",
                expiresAt: new Date(Date.now() - 1000),
                attempts: 0,
                used: false,
            });

            await expect(
                verifyOtp("user-123", "123456")
            ).rejects.toThrow("OTP has expired");
        });

        it("should reject OTP after maximum attempts", async () => {
            prismaMock.otp.findFirst.mockResolvedValue({
                id: "otp-123",
                userId: "user-123",
                codeHash: "$2b$10$invalidhash",
                expiresAt: new Date(Date.now() + 600000),
                attempts: 5,
                used: false,
            });

            await expect(
                verifyOtp("user-123", "123456")
            ).rejects.toThrow(
                "Maximum OTP attempts exceeded"
            );

            expect(prismaMock.otp.update).not.toHaveBeenCalled();
        });
    });
});