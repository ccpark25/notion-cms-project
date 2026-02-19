# Notion CMS Project — AI Agent 규칙 문서

이 문서는 AI Agent가 이 프로젝트에서 작업할 때 반드시 따라야 할 **프로젝트 특화 규칙**을 정의한다.
일반 개발 지식이 아닌 이 프로젝트에서만 적용되는 제약과 패턴을 기술한다.

---

## 1. 프로젝트 개요

**목적:** Notion 데이터베이스를 CMS로 활용하는 블로그 + 관리 대시보드

**기술 스택:**

| 레이어 | 기술 | 버전 |
|--------|------|------|
| 프레임워크 | Next.js | 15 (App Router) |
| UI 라이브러리 | React | 19 |
| Notion API | @notionhq/client | v5 |
| 인증 | NextAuth | v5 |
| CSS | TailwindCSS | v4 (CSS-first) |
| UI 컴포넌트 | shadcn/ui | latest |
| 상태 관리 | Zustand | latest |
| 폼 검증 | React Hook Form + Zod | v4 |

**환경 변수 (필수):**

```
AUTH_SECRET=          # openssl rand -base64 32 으로 생성
NEXTAUTH_URL=         # 기본: http://localhost:3000
NOTION_API_KEY=       # Notion Integration 토큰
NOTION_DATABASE_ID=   # Notion 페이지 URL에서 추출
REVALIDATE_SECRET=    # ISR 재검증 시크릿
```

---

## 2. 프로젝트 아키텍처

### 디렉토리 구조

```
/
├── middleware.ts          # 인증 미들웨어 (src/ 외부, 프로젝트 루트)
├── src/
│   ├── app/
│   │   ├── (auth)/        # 로그인, 회원가입 — 중앙 정렬 레이아웃, 인증 불필요
│   │   ├── (dashboard)/   # 대시보드, 설정 — 사이드바+헤더, 서버 세션 검증
│   │   ├── (blog)/        # 블로그 — 헤더+푸터, 인증 불필요, 공개
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth v5 핸들러
│   │   │   └── revalidate/          # ISR 수동 재검증
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/            # shadcn/ui 컴포넌트 (수정 허용)
│   │   ├── auth/          # LoginForm, RegisterForm
│   │   ├── layout/        # Header, Sidebar, Footer, ThemeToggle, ThemeProvider
│   │   ├── common/        # PageHeader, LoadingSkeleton
│   │   └── blog/          # 블로그 전용 컴포넌트
│   │       └── blocks/    # Notion 블록 렌더러
│   ├── hooks/             # useAuth, useTheme
│   ├── lib/               # notion.ts, auth.ts, utils.ts, validations/
│   ├── stores/            # useUIStore, useUserStore
│   └── types/             # auth.ts, blog.ts, index.ts
```

### 라우트 그룹 선택 기준

- 인증 불필요 + 공개 페이지 → `(blog)/`
- 인증 필요 + 관리 기능 → `(dashboard)/`
- 인증 불필요 + 로그인/가입 UI → `(auth)/`

### 미들웨어 위치

- `middleware.ts`는 반드시 프로젝트 루트(`/middleware.ts`)에 위치
- `src/middleware.ts`로 두면 Next.js가 인식하지 못함

---

## 3. 코드 표준

### TypeScript

- `any` 타입 사용 **절대 금지** — `unknown` 또는 정확한 타입 사용
- TypeScript strict 모드 활성화
- Path alias: `@/*` → `src/*` 사용 (상대 경로 지양)

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수, 함수 | camelCase | `getPostBySlug`, `isLoading` |
| 컴포넌트, 타입, 인터페이스 | PascalCase | `PostCard`, `BlogPost` |
| 상수 | UPPER_SNAKE_CASE | `PROTECTED_ROUTES` |
| 파일 (컴포넌트) | PascalCase | `PostCard.tsx` |
| 파일 (유틸/훅) | camelCase | `utils.ts`, `useAuth.ts` |

### 주석 및 문서

- 코드 주석은 한국어로 작성
- 함수 설명, 복잡한 로직에만 주석 추가 (자명한 코드에는 불필요)

### 컴포넌트 원칙

- **서버 컴포넌트를 기본**으로 사용
- `"use client"`는 상태(useState, useEffect) 또는 브라우저 이벤트가 필요한 경우에만 추가
- shadcn/ui 컴포넌트를 우선 재사용 — 직접 재구현 금지
- 들여쓰기: 2칸

---

## 4. 기능 구현 표준

### Notion SDK v5 (가장 중요)

**반드시 사용:**

```typescript
// ✅ 올바른 방법 (Notion SDK v5)
import { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints";

await notion.dataSources.query({
  data_source_id: process.env.NOTION_DATABASE_ID!,
  filter: { ... },
  sorts: [ ... ],
});
```

**절대 사용 금지:**

```typescript
// ❌ SDK v5에서 제거됨 — 런타임 에러 발생
await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID!,
});
```

### ISR (Incremental Static Regeneration)

블로그 라우트(`(blog)/`)에는 반드시 ISR 설정 추가:

```typescript
export const revalidate = 60; // 60초마다 재검증
```

### generateStaticParams 오류 처리

Notion 환경변수 미설정 시 빌드 실패 방지 — 반드시 이 패턴 사용:

```typescript
export async function generateStaticParams() {
  if (!process.env.NOTION_DATABASE_ID) return [];
  try {
    return await getAllPostSlugs();
  } catch {
    return [];
  }
}
```

### 폼 검증

- 모든 폼: React Hook Form + Zod 조합 필수
- Zod 스키마 정의 위치: `src/lib/validations/` 하위
- 현재 정의된 스키마: `loginSchema`, `registerSchema`, `profileSchema`, `changePasswordSchema`

### NextAuth v5 타입 확장

```typescript
// ✅ 올바른 JWT 타입 확장
declare module "@auth/core/jwt" {
  interface JWT { ... }
}

// ❌ 작동하지 않음
declare module "next-auth/jwt" {
  interface JWT { ... }
}
```

---

## 5. 프레임워크/라이브러리 사용 표준

### TailwindCSS v4 (CSS-first)

- `tailwind.config.js` 생성 **금지** — 설정은 `src/app/globals.css`에서 관리
- 테마 커스터마이징: `globals.css`의 `@theme inline { }` 블록에 추가
- 다크 모드: `@custom-variant dark (&:is(.dark *));` 패턴 사용
- 레이아웃 CSS 변수: `--sidebar-width` (16rem), `--sidebar-width-collapsed` (4rem), `--header-height` (4rem)

### shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

- `src/components/ui/`에 설치됨
- 직접 수정 허용 (라이브러리 소스 아님)

### shiki (코드 하이라이팅)

- `CodeBlock` 컴포넌트: **서버 컴포넌트에서만** shiki 사용
- 듀얼 테마 전략: `github-light` + `github-dark` 두 HTML 동시 렌더링
- `globals.css`에서 CSS로 `.dark` 클래스 기반 토글
- **클라이언트 "use client" 추가 금지** — 클라이언트 JS 번들 0 유지

### Zustand 상태 관리

| 스토어 | 파일 | 용도 | 저장소 |
|--------|------|------|--------|
| `useUIStore` | `src/stores/useUIStore.ts` | 사이드바, 모달, 알림 | localStorage (persist) |
| `useUserStore` | `src/stores/useUserStore.ts` | 로그인 사용자 정보 | sessionStorage |

클라이언트에서 NextAuth 세션 → Zustand 동기화 필요 시: `src/hooks/useAuth.ts`의 `syncUserToStore()` 호출

---

## 6. 워크플로 표준

### 데이터 흐름 (블로그)

```
Notion DB → src/lib/notion.ts (서버 전용) → 서버 컴포넌트 → 클라이언트
```

- `notion.ts` 함수는 서버에서만 호출 (클라이언트 컴포넌트에서 직접 호출 금지)
- 클라이언트가 데이터 필요 시: 서버 컴포넌트에서 props로 전달

### 인증 흐름

```
1. middleware.ts → PROTECTED_ROUTES 체크 → 미인증 시 /login 리다이렉트
2. (dashboard)/layout.tsx → auth() 호출로 서버 측 2차 검증
3. src/hooks/useAuth.ts → 클라이언트 인증 상태 접근
```

### Notion 블록 렌더링 파이프라인

```
getPostContent(pageId) → NotionBlock[] → NotionRenderer.tsx (그룹핑)
  → blocks/Paragraph.tsx
  → blocks/Heading.tsx
  → blocks/Code.tsx (async, shiki)
  → blocks/Image.tsx
  → ... (10개 블록 컴포넌트)
```

---

## 7. 핵심 파일 상호작용 표준

### 새 Notion 블록 타입 추가 시 — 4개 파일 동시 수정

1. `src/types/blog.ts` → `NotionBlock` 타입 유니온에 새 타입 추가
2. `src/lib/notion.ts` → `getPostContent()` 파싱 로직에 새 블록 처리 추가
3. `src/components/blog/blocks/` → 새 블록 컴포넌트 파일 생성
4. `src/components/blog/NotionRenderer.tsx` → switch/case에 새 블록 매핑 추가

### 인증 관련 변경 시 — 관련 파일

- `src/lib/auth.ts` — NextAuth 설정 (Provider, callbacks, JWT)
- `middleware.ts` — 보호 경로 목록 (`PROTECTED_ROUTES`)
- `src/app/(dashboard)/layout.tsx` — 서버 측 세션 검증 로직
- `src/hooks/useAuth.ts` — 클라이언트 인증 훅
- 타입 확장 시: `src/types/auth.ts` + `@auth/core/jwt` declare module

### 타입 추가/변경 시

| 변경 대상 | 수정 파일 |
|-----------|-----------|
| 블로그 관련 타입 | `src/types/blog.ts` |
| 인증 관련 타입 | `src/types/auth.ts` |
| 공통 타입 (ApiResponse, NavItem 등) | `src/types/index.ts` |
| Notion 블록 타입 | `src/types/blog.ts` (NotionBlock 유니온) |

### 새 페이지 추가 시

| 조건 | 위치 |
|------|------|
| 공개 블로그 페이지 | `src/app/(blog)/` |
| 관리 대시보드 페이지 | `src/app/(dashboard)/` |
| 인증 페이지 (로그인 등) | `src/app/(auth)/` |
| API 엔드포인트 | `src/app/api/` |

---

## 8. AI 의사결정 표준

### 새 UI 기능 추가 시 컴포넌트 선택

```
상태(useState)/이벤트 필요?
  YES → "use client" 추가 후 클라이언트 컴포넌트로 작성
  NO  → 서버 컴포넌트로 작성 (기본값)
      → async 함수, await 사용 가능
      → shiki, notion.ts 함수 직접 호출 가능
```

### 새 블록 타입 추가 의사결정 순서

```
1. src/types/blog.ts 에서 NotionBlock 유니온 타입 확인
2. 새 블록 타입 추가 (예: 'quote' | 'divider' | 'embed')
3. src/lib/notion.ts 의 getPostContent() 에서 해당 블록 파싱
4. src/components/blog/blocks/ 에 새 컴포넌트 생성
5. src/components/blog/NotionRenderer.tsx 에 switch case 추가
6. 서버 컴포넌트 여부 확인 (async 필요 시 async 컴포넌트로 작성)
```

### shadcn/ui 컴포넌트 선택

```
필요한 UI 요소가 있을 때:
1. src/components/ui/ 폴더 확인 (이미 설치된 컴포넌트)
2. 없으면 npx shadcn@latest add [name] 으로 설치
3. 없는 컴포넌트를 직접 재구현 금지
```

### 상태 관리 선택

```
전역 UI 상태 (사이드바, 모달, 알림) → useUIStore (localStorage)
전역 사용자 상태 → useUserStore (sessionStorage)
서버 데이터 → 서버 컴포넌트 props 또는 React Server Actions
로컬 UI 상태 → useState (컴포넌트 내부)
```

---

## 9. 금지 사항

다음 사항을 위반하면 빌드 오류, 런타임 에러, 또는 예측 불가능한 동작이 발생한다.

### 절대 금지

| 금지 항목 | 이유 | 대안 |
|-----------|------|------|
| `any` 타입 사용 | TypeScript strict 위반 | `unknown` 또는 정확한 타입 |
| `notion.databases.query()` 사용 | SDK v5에서 제거됨 | `notion.dataSources.query()` |
| `tailwind.config.js` 생성 | TailwindCSS v4 CSS-first | `globals.css`의 `@theme` 사용 |
| `declare module "next-auth/jwt"` | NextAuth v5에서 작동 안 함 | `declare module "@auth/core/jwt"` |
| 환경변수 하드코딩 | 보안 위험 | `process.env.VAR_NAME` 사용 |
| shadcn/ui 컴포넌트 직접 재작성 | 불필요한 중복 | `npx shadcn@latest add` |

### 강하게 지양

| 항목 | 이유 |
|------|------|
| `"use client"` 불필요한 추가 | 클라이언트 번들 증가, 서버 기능 제한 |
| `notion.ts` 함수를 클라이언트에서 직접 호출 | 서버 전용 코드, API 키 노출 위험 |
| `generateStaticParams`에서 try/catch 생략 | Notion 미설정 시 빌드 실패 |
| 상대 경로 import (`../../`) | `@/*` alias 사용 |
| 새 Zustand 스토어 생성 | `useUIStore`, `useUserStore`로 충분 |
| 폼에 Zod 없이 직접 검증 | React Hook Form + Zod 패턴 준수 |

---

*이 문서는 프로젝트 변경 시 함께 업데이트한다.*
