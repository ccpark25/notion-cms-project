"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import type { UserRole } from "@/types/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser, clearUser } = useUserStore();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const isAdmin = user?.role === ("admin" as UserRole);

  // 로그인 함수
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
      }

      if (result?.ok) {
        return { success: true };
      }

      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    } catch {
      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    clearUser();
    await signOut({ redirect: false });
    router.push("/");
  };

  // 세션 사용자 정보를 Zustand 스토어에 동기화
  const syncUserToStore = () => {
    if (user) {
      setUser({
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
        role: user.role,
      });
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    syncUserToStore,
  };
}
