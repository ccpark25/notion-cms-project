import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole } from "@/types/auth";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole | null;
}

interface UserStore extends UserState {
  setUser: (user: UserState) => void;
  updateUserName: (name: string) => void;
  clearUser: () => void;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  image: null,
  role: null,
};

// 세션 스토리지에 사용자 정보를 저장 (브라우저 탭 닫으면 초기화)
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      // 사용자 정보 설정
      setUser: (user) => set(user),

      // 사용자 이름만 업데이트
      updateUserName: (name) => set({ name }),

      // 로그아웃 시 사용자 정보 초기화
      clearUser: () => set(initialState),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
    }
  )
);
