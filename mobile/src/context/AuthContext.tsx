import { getCurrentUser, loginUser, registerUser, resendOtp, verifyEmail } from "@/api/auth.api";
import { getToken, removeToken, saveToken } from "@/api/storage";
import { User } from "@/types/api";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    register: (data: RegisterData) => Promise<void>;
    verify: (email: string, otp: string) => Promise<void>;
    resend: (email: string) => Promise<void>;
    login: (email: string, password: string) => Promise<User>;
    refreshUser: () => Promise<User | null>;
    updateUser: (partial: Partial<User>) => void;
    logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        async function restoreSession() {
            try {
                const storedToken = await getToken();
                console.log(storedToken)
                if (!storedToken) {
                    return;
                }

                const response = await getCurrentUser();

                setToken(storedToken);
                setUser(response.user);
            } catch {
                await removeToken();
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        restoreSession()
    }, [])

    const register = useCallback(async (data: RegisterData) => {
        await registerUser(data);
    }, []);
    const verify = useCallback(async (email: string, otp: string) => {
        await verifyEmail({ email, otp })
    }, [])
    const resend = useCallback(async (email: string) => {
        await resendOtp(email)
    }, [])
    const login = useCallback(
        async (email: string, password: string): Promise<User> => {
            const response = await loginUser({
                email,
                password,
            });

            if (!response.data?.token || !response.data.user) {
                throw new Error("Invalid login response from server");
            }

            await saveToken(response.data.token);

            setToken(response.data.token);
            setUser(response.data.user);

            return response.data.user;
        },
        []
    );
    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
            const response = await getCurrentUser();

            if (!response.user) {
                return null;
            }

            setUser(response.user);
            return response.user;
        } catch {
            await removeToken();
            setToken(null);
            setUser(null);
            return null;
        }
    }, []);
    const updateUser = useCallback((partial: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...partial } : prev));
    }, []);
    const logout = useCallback(async () => {
        await removeToken();

        setToken(null);
        setUser(null);
    }, []);
    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                register,
                verify,
                refreshUser,
                updateUser,
                resend,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }
    return context
}