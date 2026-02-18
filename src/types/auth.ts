// 사용자 역할 타입
export type UserRole = "admin" | "user";

// 사용자 기본 타입
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt?: Date;
}

// 세션에서 사용하는 사용자 타입
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}
