# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev        # 개발 서버 (Turbopack, http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 시작
npm run lint       # ESLint 검사
npm run typecheck  # TypeScript 타입 체크 (tsc --noEmit)
```

테스트 프레임워크는 설정되어 있지 않음. 기능 검증은 dev 서버에서 직접 확인.

shadcn/ui 컴포넌트 추가:
```bash
npx shadcn@latest add [component-name]
```

## 아키텍처 개요

### 라우트 구조

App Router 기반이며 라우트 그룹으로 레이아웃을 분리:

- `(auth)/` — 로그인, 회원가입 (중앙 정렬 레이아웃, 인증 불필요)
- `(dashboard)/` — 대시보드, 설정 (사이드바 + 헤더 레이아웃, 서버에서 세션 검증)
- `api/auth/[...nextauth]/` — NextAuth v5 핸들러

**대시보드 페이지:** 통계 카드 4개 + 사용자 테이블
**설정 페이지:** 4개 탭 — 프로필, 알림, 외관(테마), 보안(비밀번호 변경)

### 인증 흐름

1. `middleware.ts` (프로젝트 루트, `src/` 외부) — 요청마다 세션 확인, PROTECTED_ROUTES 보호
2. `src/lib/auth.ts` — NextAuth v5 설정 (Credentials Provider, JWT 전략 30일)
3. `(dashboard)/layout.tsx` — 서버 컴포넌트에서 `auth()` 호출로 2차 검증

NextAuth 타입 확장 시:
- `declare module "next-auth"` → Session, User 확장
- `declare module "@auth/core/jwt"` → JWT 확장 (`next-auth/jwt`는 작동 안 함)

현재 인증은 하드코딩된 데모 사용자(DB 없음):
- 관리자: `admin@example.com` / `Admin1234`
- 일반: `user@example.com` / `User1234`

RegisterForm은 데모 모드로 실제 가입 대신 `user@example.com`으로 자동 로그인 처리됨.

### 상태 관리

| 스토어 | 용도 | 저장소 |
|--------|------|--------|
| `useUIStore` | 사이드바, 모달, 알림 | localStorage (persist) |
| `useUserStore` | 로그인한 사용자 정보 | sessionStorage |

**useUIStore 주요 메서드:** `toggleSidebar()`, `setSidebarOpen()`, `toggleSidebarCollapsed()`, `openModal()`, `closeModal()`, `addNotification()`, `markNotificationRead()`, `clearNotifications()`

**useUserStore 주요 메서드:** `setUser()`, `updateUserName()`, `clearUser()`

클라이언트에서 세션 정보가 필요하면 `src/hooks/useAuth.ts`의 `syncUserToStore()`로 NextAuth 세션 → Zustand 동기화.

**useAuth 훅:** `isAuthenticated`, `isAdmin`, `user` 상태와 `login()`, `logout()`, `syncUserToStore()` 제공.

### 컴포넌트 계층

```
src/components/
├── ui/         # shadcn/ui 컴포넌트 (직접 수정 가능)
├── auth/       # LoginForm, RegisterForm
├── layout/     # Header, Sidebar, Footer, ThemeToggle, ThemeProvider
└── common/     # PageHeader, LoadingSkeleton
```

서버 컴포넌트를 기본으로 하고, 상태/이벤트가 필요한 경우에만 `"use client"` 추가.

## 주요 패턴

### TailwindCSS v4

`tailwind.config.js` 없음. CSS-first 방식:

```css
/* src/app/globals.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
@theme inline {
  --color-background: var(--background);
  /* ... */
}
```

레이아웃 관련 CSS 변수: `--sidebar-width` (16rem), `--sidebar-width-collapsed` (4rem), `--header-height` (4rem).

### 공통 유틸리티 (`src/lib/utils.ts`)

- `cn()` — Tailwind 클래스 병합 (clsx + tailwind-merge)
- `formatDate()` — 한국어 날짜 포맷
- `formatRelativeTime()` — 상대 시간 (예: "3일 전")
- `getInitials()` — 아바타용 이니셜
- `maskEmail()` — 이메일 마스킹 (예: "u***@example.com")
- `slugify()` — 문자열을 URL 슬러그로 변환

### 폼 검증

모든 폼은 React Hook Form + Zod 조합. 스키마는 `src/lib/validations/auth.ts`에 정의:
- `loginSchema` — email, password
- `registerSchema` — name, email, password (대문자+숫자 필수), confirmPassword, terms
- `profileSchema` — name, email, bio
- `changePasswordSchema` — currentPassword, newPassword, confirmPassword

## 환경 변수

```env
AUTH_SECRET=       # 필수. 생성: openssl rand -base64 32
NEXTAUTH_URL=      # 필수. 기본: http://localhost:3000
```

## 타입 시스템

- `src/types/auth.ts` — `UserRole` ("admin" | "user"), `User`, `SessionUser`
- `src/types/index.ts` — `ApiResponse<T>`, `NavItem`, `SidebarNavItem`, `PaginationInfo`, `TableColumn<T>`
- TypeScript strict 모드 활성화, `any` 타입 사용 금지
- Path alias: `@/*` → `src/*`

## 기타 설정

**next.config.ts:** `lucide-react` 패키지 임포트 최적화 적용. 이미지 허용 도메인: `avatars.githubusercontent.com`, `lh3.googleusercontent.com`.

**MCP:** `.mcp.json`에 Playwright MCP 서버 설정됨 — 브라우저 자동화 기반 E2E 검증에 활용 가능.
