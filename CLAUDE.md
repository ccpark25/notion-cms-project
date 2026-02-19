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
- `(blog)/` — 블로그 (헤더 + 푸터 레이아웃, 인증 불필요, 공개 페이지)
- `api/auth/[...nextauth]/` — NextAuth v5 핸들러
- `api/revalidate/` — ISR 수동 재검증 (REVALIDATE_SECRET 필요)

**대시보드 페이지:** 통계 카드 4개 + 사용자 테이블
**설정 페이지:** 4개 탭 — 프로필, 알림, 외관(테마), 보안(비밀번호 변경)
**블로그 페이지:** `/blog` 글 목록, `/blog/[slug]` 글 상세, `/blog/category/[slug]` 카테고리 필터 (ISR 60초)

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

### Notion CMS 블로그 아키텍처

Notion 데이터베이스를 CMS로 활용. 별도 DB 없이 Notion API로 글을 조회하고 ISR로 캐싱.

**데이터 흐름:** Notion DB → `src/lib/notion.ts` (서버) → 서버 컴포넌트 → 클라이언트

**Notion 데이터베이스 속성 스키마 (영문 이름 필수):**
| 속성명 | Notion 타입 | 설명 |
|--------|------------|------|
| Title | title | 글 제목 |
| Slug | rich_text | URL 슬러그 (미설정 시 제목에서 자동 생성) |
| Description | rich_text | 요약/발췌문 |
| Category | select | 카테고리 |
| Tags | multi_select | 태그 |
| Published | checkbox | 발행 여부 (true만 공개) |
| PublishedAt | date | 발행일 |
| Thumbnail | url | 썸네일 URL (미설정 시 페이지 커버 사용) |

**`src/lib/notion.ts` 주요 함수:**
| 함수 | 설명 |
|------|------|
| `getAllPublishedPosts()` | Published=true인 모든 글 (최신순) |
| `getPostsByPage(page, pageSize, category?)` | 인메모리 페이지네이션 + 카테고리 필터 |
| `getPostBySlug(slug)` | 슬러그로 단일 글 조회 |
| `getPostContent(pageId)` | 글 본문 블록 배열 (재귀적 하위 블록 포함) |
| `getAllCategories()` | 카테고리 목록 + 글 수 |
| `getAdjacentPosts(publishedAt, slug)` | 이전/다음 글 |
| `getAllPostSlugs()` | 사이트맵용 슬러그 목록 |
| `calculateReadingTime(blocks)` | 읽기 시간 계산 (200 WPM) |

**Notion SDK v5 주의사항:**
- `notion.databases.query()` 제거됨 → `notion.dataSources.query()` 사용
- 파라미터: `database_id` → `data_source_id`
- Callout icon: `PageIconResponse | null` 타입으로 명시적 변환 필요

**`generateStaticParams` 오류 처리:** Notion API 미설정 시 빌드 실패 방지를 위해 `if (!process.env.NOTION_DATABASE_ID) return [];`와 try/catch 래핑 필수.

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
├── common/     # PageHeader, LoadingSkeleton
└── blog/       # 블로그 전용 컴포넌트
    ├── blocks/ # Notion 블록 렌더러 10개 (Paragraph, Heading, Code, Image 등)
    ├── RichText.tsx        # 리치 텍스트 인라인 렌더러
    ├── NotionRenderer.tsx  # 블록 배열 → 컴포넌트 디스패치 + 리스트 그룹핑 (async 서버 컴포넌트)
    ├── PostCard.tsx        # 글 카드 (Card, Badge 재사용)
    ├── PostGrid.tsx        # 카드 그리드 (1/2/3열 반응형)
    ├── CategoryFilter.tsx  # 카테고리 필터 ("use client")
    ├── Pagination.tsx      # 페이지 네비게이션
    ├── TableOfContents.tsx # 목차 (Intersection Observer, "use client")
    ├── PostNavigation.tsx  # 이전/다음 글
    └── BlogSkeleton.tsx    # 로딩 스켈레톤
```

서버 컴포넌트를 기본으로 하고, 상태/이벤트가 필요한 경우에만 `"use client"` 추가.
`NotionRenderer`와 `CodeBlock`은 async 서버 컴포넌트 (shiki 사용).

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

### 코드 블록 (shiki)

`CodeBlock` 컴포넌트는 서버에서 shiki로 HTML을 생성. 듀얼 테마 전략:
- `github-light` + `github-dark` 두 HTML을 동시 렌더링
- `globals.css`에서 CSS로 `.dark` 클래스 기반 토글 (`.shiki.github-light` / `.shiki.github-dark`)
- 클라이언트 JS 번들 0

### 공통 유틸리티 (`src/lib/utils.ts`)

- `cn()` — Tailwind 클래스 병합 (clsx + tailwind-merge)
- `formatDate()` — 한국어 날짜 포맷
- `formatRelativeTime()` — 상대 시간 (예: "3일 전")
- `getInitials()` — 아바타용 이니셜
- `maskEmail()` — 이메일 마스킹 (예: "u***@example.com")
- `slugify()` — 문자열을 URL 슬러그로 변환 (HeadingBlock TOC 앵커에도 재사용)

### 폼 검증

모든 폼은 React Hook Form + Zod 조합. 스키마는 `src/lib/validations/auth.ts`에 정의:
- `loginSchema` — email, password
- `registerSchema` — name, email, password (대문자+숫자 필수), confirmPassword, terms
- `profileSchema` — name, email, bio
- `changePasswordSchema` — currentPassword, newPassword, confirmPassword

## 환경 변수

```env
AUTH_SECRET=          # 필수. 생성: openssl rand -base64 32
NEXTAUTH_URL=         # 필수. 기본: http://localhost:3000
NOTION_API_KEY=       # Notion Integration 토큰
NOTION_DATABASE_ID=   # 블로그 DB ID (Notion 페이지 URL에서 추출)
REVALIDATE_SECRET=    # ISR 재검증 시크릿
```

Notion 환경변수가 없어도 빌드는 성공함 (블로그 관련 generateStaticParams가 빈 배열 반환).

## 타입 시스템

- `src/types/auth.ts` — `UserRole` ("admin" | "user"), `User`, `SessionUser`
- `src/types/index.ts` — `ApiResponse<T>`, `NavItem`, `SidebarNavItem`, `PaginationInfo`, `TableColumn<T>`
- `src/types/blog.ts` — `BlogPost`, `BlogCategory`, `BlogPostListResponse`, `AdjacentPosts`, `NotionRichText`, `NotionBlock`
- TypeScript strict 모드 활성화, `any` 타입 사용 금지
- Path alias: `@/*` → `src/*`

## SEO

- `src/app/sitemap.ts` — 정적 페이지 + 동적 블로그 글/카테고리 URL
- `src/app/robots.ts` — `/api/`, `/dashboard/`, `/settings/`, `/login/`, `/register/` 차단
- 글 상세 페이지: `generateMetadata` + JSON-LD `BlogPosting` 스키마

## 기타 설정

**next.config.ts:** `lucide-react`, `shiki` 패키지 임포트 최적화. 이미지 허용 도메인: `avatars.githubusercontent.com`, `lh3.googleusercontent.com`, `*.amazonaws.com`, `*.notion-static.com`, `images.unsplash.com`.

**MCP:** `.mcp.json`에 Playwright MCP 서버 설정됨 — 브라우저 자동화 기반 E2E 검증에 활용 가능.
