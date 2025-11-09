import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import userService, { type SignInReq, type SignInRes } from "@/api/services/userService";

import { toast } from "sonner";
import type { UserInfo, UserToken } from "#/entity";
import { StorageEnum } from "#/enum";

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;
	rememberMe: boolean;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		setRememberMe: (remember: boolean) => void;
		clearUserInfoAndToken: (options?: { clearRemember?: boolean }) => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			rememberMe: true,
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				setRememberMe: (remember) => {
					set({ rememberMe: remember });
				},
				clearUserInfoAndToken({ clearRemember = false } = {}) {
					set((state) => ({
						userInfo: {},
						userToken: {},
						rememberMe: clearRemember ? false : state.rememberMe,
					}));
				},
			},
		}),
		{
			name: "userStore", // tên khóa lưu trong storage (phải duy nhất)
			storage: createJSONStorage(() => localStorage), // (tùy chọn) mặc định dùng 'localStorage'
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.rememberMe ? state.userInfo : {},
				[StorageEnum.UserToken]: state.rememberMe ? state.userToken : {},
				[StorageEnum.RememberMe]: state.rememberMe,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles || []);
export const useUserActions = () => useUserStore((state) => state.actions);
export const useRememberMe = () => useUserStore((state) => state.rememberMe);

export const useSignIn = () => {
	const { setUserToken, setUserInfo, setRememberMe } = useUserActions();

	const signInMutation = useMutation({
		mutationFn: userService.signin,
	});

	const resolveErrorMessage = (error: unknown) => {
		const fallback = "Đăng nhập thất bại. Vui lòng thử lại.";
		if (error instanceof AxiosError) {
			const responseData = error.response?.data as Record<string, any> | undefined;
			if (responseData) {
				if (typeof responseData.message === "string") return responseData.message;
				if (typeof responseData.error === "string") return responseData.error;
				if (
					typeof responseData.error === "object" &&
					responseData.error !== null &&
					typeof responseData.error.message === "string"
				)
					return responseData.error.message;
			}
			return error.message || fallback;
		}
		if (error instanceof Error) {
			return error.message || fallback;
		}
		return fallback;
	};

	const signIn = async (data: SignInReq, options?: { remember?: boolean }): Promise<SignInRes> => {
		try {
			const res = await signInMutation.mutateAsync(data);
			const { user, tokens } = res;
			const remember = options?.remember ?? true;
			setRememberMe(remember);
			setUserToken(tokens);
			setUserInfo(user);
			return res;
		} catch (error) {
			toast.error(resolveErrorMessage(error), {
				position: "top-center",
			});
			throw error;
		}
	};

	return signIn;
};

export default useUserStore;
