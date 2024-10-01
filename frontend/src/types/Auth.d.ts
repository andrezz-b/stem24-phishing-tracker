interface StateContextType<T> {
    auth: T;
    setAuth: React.Dispatch<React.SetStateAction<T>>;
}
export interface AuthContextData {
    user: Record<string, unknown>;
    accessToken: string;
}
export type AuthContextType = StateContextType<AuthContextData | null>;

export interface AuthContextProps {
    children: React.ReactNode;
}

export interface TokenResponse {
    token: string;
    active: boolean;
}

export interface RefreshResponse {
    success: string;
    jwt_token: string;
}

export interface RefreshTokenResponse extends TokenResponse {
    refreshToken: string;
}

export interface LoginResponse {
    success: string;
    user: {
        id: string;
        name: string;
        email: string;
        otp_enabled: boolean;
        jwt_token: string;
        refresh_token: string;
    };
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}
