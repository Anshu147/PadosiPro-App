import { Profile } from "@/types/api";
import { api } from "./client";

interface ProfilePayload {
    name: string;
    mobile: string;
    address: string;
    businessName?: string;
}

interface ProfileResponse {
    success: boolean;
    profile: Profile | null;
    profileCompleted: boolean;
}

export async function getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>("/api/profile");

    return response.data;
}

export async function saveProfile(
    payload: ProfilePayload
): Promise<ProfileResponse> {
    const response = await api.put<ProfileResponse>(
        "/api/profile",
        payload
    );

    return response.data;
}