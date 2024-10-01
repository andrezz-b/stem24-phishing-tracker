import type { User } from "@/types/User";
import type { LoginData, LoginResponse, RefreshResponse, RegisterData } from "@/types/Auth";
import { axiosPublic } from "./config/axios";
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useLocalStorage from "@/hooks/useLocalStorage";
import useAuth from "@/hooks/useAuth";

const AuthService = {
    useLogin: (
        mutationOptions?: Omit<
            UseMutationOptions<LoginResponse, Error, LoginData>,
            "mutationFn" | "onSuccess"
        >,
    ) => {
        const [, setRefreshToken] = useLocalStorage<string>("refreshToken", "");
        const { setAuth } = useAuth();
        const queryClient = useQueryClient();
        return useMutation<LoginResponse, Error, LoginData>({
            mutationFn: async ({ email, password }) => {
                const response = await axiosPublic.post<LoginResponse>(
                    "/login",
                    { email, password },
                    { withCredentials: true },
                );
                return response.data;
            },
            onSuccess: ({ user}, { email }) => {
                const { jwt_token, refresh_token } = user;
                queryClient.clear();
                setAuth({
                    user: {
                        email,
                    },
                    accessToken: jwt_token,
                });
                setRefreshToken(refresh_token);
            },
            ...mutationOptions,
        });
    },

    useRefreshToken: <T = RefreshResponse>(
        mutationOptions?: Omit<UseMutationOptions<T>, "mutationFn">,
    ) => {
        // When in StrictMode useLocalStorage sometimes returns the default value so this is a workaround
        const localStorageRefreshToken = localStorage.getItem("refreshToken");
        const refreshToken = localStorageRefreshToken ? JSON.parse(localStorageRefreshToken) : "";
        return useMutation({
            mutationFn: async () => {
                try {
                    const response = await axiosPublic.post<T>(
                        "/refresh",
                        { refresh_token: refreshToken },
                        { withCredentials: true },
                    );
                    return response.data;
                } catch (e) {
                    const error = e as AxiosError<Record<string, string>>;
                    const message = `Status: ${error.response?.status}, Error: ${error.response?.data?.error}, Message: ${error.response?.data?.message}`;
                    throw new Error(message);
                }
            },
            ...mutationOptions,
        });
    },

    useRegister: <T = User>(
        mutationOptions?: Omit<UseMutationOptions<T, Error, RegisterData>, "mutationFn">,
    ) => {
        return useMutation({
            mutationFn: async (registerData) => {
                const response = await axiosPublic.post<T>("/register", {
                    password: registerData.password,
                    email: registerData.email,
                    name: `${registerData.firstName} ${registerData.lastName}`,
                });
                return response.data;
            },
            ...mutationOptions,
        });
    },

    useLogout: <T = void>(mutationOptions?: Omit<UseMutationOptions<T>, "mutationFn">) => {
        return useMutation({
            mutationFn: async () => {
                const response = await axiosPublic.get<T>("/auth/logout", {
                    withCredentials: true,
                });
                return response.data;
            },
            ...mutationOptions,
        });
    },
};

export default AuthService;
