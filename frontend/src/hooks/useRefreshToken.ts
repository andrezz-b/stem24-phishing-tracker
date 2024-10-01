import useAuth from "./useAuth";
import AuthService from "@/api/auth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const { mutateAsync: refreshToken } = AuthService.useRefreshToken({
    onSuccess: (data) => {
      setAuth((prev) => ({
        ...prev!,
        accessToken: data.jwt_token,
      }));
    },
  });
  return refreshToken;
};

export default useRefreshToken;
