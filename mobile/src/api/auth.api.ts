import { api } from "./client";
import type {
    CurrentUserResponse,
    LoginResponse,
    RegisterResponse,
} from "@/types/api";

interface RegisterPayload {
    email: string;
    password: string;
    confirmPassword: string;
}

interface VerifyEmailPayload {
    email: string;
    otp: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

export async function registerUser(
    payload: RegisterPayload
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        "/api/auth/register",
        payload
    );

    return response.data;
}

export async function verifyEmail(
    payload: VerifyEmailPayload
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        "/api/auth/verify-email",
        payload
    );

    return response.data;
}

export async function resendOtp(
    email: string
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        "/api/auth/resend-otp",
        { email }
    );

    return response.data;
}

export async function loginUser(
    payload: LoginPayload
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        "/api/auth/login",
        payload
    );

    return response.data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await api.get<CurrentUserResponse>(
        "/api/user/me"
    );

    return response.data;
}