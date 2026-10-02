import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock, jwtMock } = vi.hoisted(() => ({
    prismaMock: {
        user: {
            findUnique: vi.fn(),
        },
    },

    bcryptMock: {
        compare: vi.fn(),
    },

    jwtMock: {
        sign: vi.fn(),
    },
}));

vi.mock("../../config/prisma.js", () => ({
    prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
    default: bcryptMock,
}));

vi.mock("../../utils/jwt.js", () => ({
    generateAccessToken: jwtMock.sign,
}));

import { loginUser } from "../auth.service.js";

describe("Auth Service - Login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should reject login for an unknown user", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(
            loginUser("unknown@example.com", "Password123")
        ).rejects.toThrow("Invalid email or password");

        expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it("should reject login for an unverified user", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-123",
            email: "user@example.com",
            passwordHash: "hashed-password",
            emailVerified: false,
            profile: null,
        });

        await expect(
            loginUser("user@example.com", "Password123")
        ).rejects.toThrow(
            "Please verify your email before logging in"
        );

        expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it("should reject an incorrect password", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-123",
            email: "user@example.com",
            passwordHash: "hashed-password",
            emailVerified: true,
            profile: null,
        });

        bcryptMock.compare.mockResolvedValue(false);

        await expect(
            loginUser("user@example.com", "WrongPassword")
        ).rejects.toThrow("Invalid email or password");

        expect(bcryptMock.compare).toHaveBeenCalledWith(
            "WrongPassword",
            "hashed-password"
        );
    });

    it("should login a verified user with the correct password", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-123",
            email: "user@example.com",
            passwordHash: "hashed-password",
            emailVerified: true,
            profile: null,
        });

        bcryptMock.compare.mockResolvedValue(true);

        jwtMock.sign.mockReturnValue("mock-jwt-token");

        const result = await loginUser(
            "user@example.com",
            "Password123"
        );

        expect(result).toEqual({
            token: "mock-jwt-token",
            user: {
                id: "user-123",
                email: "user@example.com",
                emailVerified: true,
                profileCompleted: false,
            },
        });

        expect(jwtMock.sign).toHaveBeenCalledWith("user-123");
    });

    it("should report profileCompleted when profile exists", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-123",
            email: "user@example.com",
            passwordHash: "hashed-password",
            emailVerified: true,
            profile: {
                id: "profile-123",
            },
        });

        bcryptMock.compare.mockResolvedValue(true);

        jwtMock.sign.mockReturnValue("mock-jwt-token");

        const result = await loginUser(
            "user@example.com",
            "Password123"
        );

        expect(result.user.profileCompleted).toBe(true);
    });
});