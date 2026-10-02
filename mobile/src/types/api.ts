export interface User {
    id: string;
    email: string;
    emailVerfied: boolean;
    profileCompleted: boolean;
}
export interface Profile {
    id: string;
    userId: string;
    name: string;
    mobile: string;
    address: string;
    businessName?: string | null;

}

export interface Task {
    id: string;
    name: string;
    description: string;
    category: {
        id: string;
        name: string;
    }
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
    data?: {
        token?: string;
        user?: User;
    };
}

export interface ApiErrorResponse {
    success?: boolean;
    message?: string;
    errors?: unknown;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        token: string;
        user: User;
    };
}

export interface CurrentUserResponse {
    success: boolean;
    user: User;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
}
