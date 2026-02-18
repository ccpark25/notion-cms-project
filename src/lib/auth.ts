import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types/auth";

// NextAuth v5 타입 확장 (role 필드 추가)
declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}

// @auth/core/jwt 모듈 타입 확장
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// 데모 사용자 (실제 프로젝트에서는 DB로 교체)
const DEMO_USERS = [
  {
    id: "1",
    name: "관리자",
    email: "admin@example.com",
    password: "Admin1234",
    role: "admin" as UserRole,
    image: null,
  },
  {
    id: "2",
    name: "사용자",
    email: "user@example.com",
    password: "User1234",
    role: "user" as UserRole,
    image: null,
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      authorize: async (credentials) => {
        // Zod 스키마로 입력값 검증
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 데모 사용자 인증 (실제 프로젝트에서는 DB 조회로 교체)
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // JWT 토큰에 id와 role 추가
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    // 세션에 id와 role 전달
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
});
