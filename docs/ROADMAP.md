# ROADMAP: Notion CMS 블로그

> PRD.md 기반 개발 로드맵 — bkit 9-Phase Development Pipeline 적용
> 마지막 갱신: 2026-02-19

---

## 진행 상태 요약

| Phase | 이름 | 상태 | 핵심 산출물 |
|-------|------|------|-------------|
| 1 | Schema & Data Model | ✅ 완료 | `src/types/blog.ts` |
| 2 | Convention & Setup | ✅ 완료 | `CLAUDE.md`, `src/lib/notion.ts` |
| 3 | 블로그 레이아웃 설계 | ⏳ 대기 | `(blog)/` 라우트 그룹, 컴포넌트 구조 |
| 4 | API 보완 | 🔶 부분 완료 | `/api/revalidate`, 에러 핸들링 |
| 5 | Notion 블록 렌더러 | ⏳ 대기 | 16개 블록 타입 React 컴포넌트 |
| 6 | UI + API 통합 | ⏳ 대기 | `/blog`, `/blog/[slug]`, `/blog/category/[slug]` |
| 7 | SEO / 접근성 | ⏳ 대기 | `generateMetadata`, sitemap, JSON-LD |
| 8 | Review / QA | ⏳ 대기 | Lighthouse 90+, 타입체크, 반응형 |
| 9 | Deployment | ⏳ 대기 | Vercel 배포, 환경변수, 문서 업데이트 |

---

## Phase 1: Schema & Data Model ✅ 완료

### 산출물

- **`src/types/blog.ts`** — 블로그 도메인 타입 정의

  | 타입 | 설명 |
  |------|------|
  | `BlogPost` | 글 메타데이터 (id, title, slug, description, category, tags, publishedAt, thumbnail, readingTime) |
  | `BlogCategory` | 카테고리 (name, slug, count) |
  | `BlogPostListResponse` | 페이지네이션 응답 |
  | `AdjacentPosts` | 이전/다음 글 |
  | `NotionBlock` | 16개 블록 타입 유니온 (paragraph ~ equation) |
  | `NotionRichText` | 인라인 텍스트 + 어노테이션 |

- **Notion DB 스키마** (PRD §3 기준)

  | 속성 | 타입 | 필수 |
  |------|------|------|
  | Title | title | O |
  | Slug | rich_text | O |
  | Description | rich_text | O |
  | Category | select | O |
  | Tags | multi_select | X |
  | Published | checkbox | O |
  | PublishedAt | date | O |
  | Thumbnail | url | X |

---

## Phase 2: Convention & Setup ✅ 완료

### 산출물

- **`CLAUDE.md`** — AI 협업 코딩 컨벤션 (언어, 네이밍, 스타일, 기술 스택)
- **`src/lib/notion.ts`** — Notion API 클라이언트 8개 공개 함수

  | 함수 | 설명 |
  |------|------|
  | `getAllPublishedPosts()` | Published=true 전체 글 목록 |
  | `getPostsByPage()` | 페이지네이션 + 카테고리 필터 |
  | `getPostBySlug()` | 슬러그로 단일 글 조회 |
  | `getPostContent()` | 글 본문 블록 배열 (재귀) |
  | `getAllCategories()` | 카테고리 목록 + 글 수 |
  | `getAdjacentPosts()` | 이전/다음 글 |
  | `getAllPostSlugs()` | 사이트맵용 슬러그 목록 |
  | `calculateReadingTime()` | 블록에서 읽기 시간 계산 |

---

## Phase 3: 블로그 레이아웃 설계 ⏳ 대기

> **목표**: 블로그 전용 라우트 그룹과 컴포넌트 디렉토리 구조를 설계한다.

### 라우트 그룹 구조

```
src/app/
├── (auth)/              # 기존 - 로그인/회원가입
├── (dashboard)/         # 기존 - 대시보드
└── (blog)/              # 신규
    ├── layout.tsx        # 블로그 공통 레이아웃 (헤더 + 푸터, 대시보드 사이드바 없음)
    ├── blog/
    │   ├── page.tsx      # /blog — 글 목록 (ISR)
    │   ├── [slug]/
    │   │   └── page.tsx  # /blog/[slug] — 글 상세 (ISR)
    │   └── category/
    │       └── [slug]/
    │           └── page.tsx  # /blog/category/[slug] — 카테고리별 목록 (ISR)
    └── ...
```

### 컴포넌트 디렉토리 구조

```
src/components/blog/
├── blocks/               # Notion 블록 렌더러 (Phase 5)
│   ├── NotionBlockRenderer.tsx   # 스위치 컴포넌트
│   ├── RichText.tsx              # 인라인 텍스트
│   ├── Paragraph.tsx
│   ├── Heading.tsx
│   ├── ListItem.tsx
│   ├── CodeBlock.tsx             # 구문 강조
│   ├── ImageBlock.tsx
│   ├── QuoteBlock.tsx
│   ├── CalloutBlock.tsx
│   ├── ToggleBlock.tsx
│   ├── TableBlock.tsx
│   ├── BookmarkBlock.tsx
│   └── DividerBlock.tsx
├── BlogCard.tsx          # 글 카드 (목록용)
├── BlogGrid.tsx          # 3열 그리드 레이아웃
├── CategoryFilter.tsx    # 카테고리 탭 필터
├── Pagination.tsx        # 페이지네이션
├── SearchBar.tsx         # 검색창 (클라이언트)
├── TableOfContents.tsx   # 목차 (H2/H3 자동 추출)
├── PostMeta.tsx          # 카테고리 · 날짜 · 읽기 시간
├── AdjacentNavigation.tsx # 이전/다음 글 네비게이션
└── BlogHero.tsx          # 블로그 홈 히어로 섹션
```

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-01 | `(blog)/layout.tsx` 생성 (블로그 헤더 + 푸터, 사이드바 없음) | S |
| T-02 | `src/components/blog/` 디렉토리 구조 초안 생성 | S |

---

## Phase 4: API 보완 🔶 부분 완료

> **목표**: ISR Revalidation API 엔드포인트를 추가하고, Notion API 에러 핸들링을 강화한다.

### 완료된 항목

- ✅ `getAllPublishedPosts()` — 전체 글 조회
- ✅ `getPostsByPage()` — 페이지네이션
- ✅ `getPostContent()` — 본문 블록 (재귀 하위 블록 포함)
- ✅ `getAdjacentPosts()` — 이전/다음 글

### 필요 추가 항목

```
src/app/api/
└── revalidate/
    └── route.ts    # POST /api/revalidate?secret=xxx&path=/blog/[slug]
```

- **ISR On-Demand Revalidation**: `REVALIDATE_SECRET` 헤더 검증 → `revalidatePath()` 호출
- **Notion API 에러 처리**: Rate limit (429), 네트워크 오류 → 적절한 fallback

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-03 | `src/app/api/revalidate/route.ts` 생성 | S |
| T-04 | `src/lib/notion.ts` 에러 핸들링 강화 (try/catch, retry 없음) | S |

---

## Phase 5: Notion 블록 렌더러 ⏳ 대기

> **목표**: 16개 블록 타입을 React 컴포넌트로 구현한다. 이 Phase가 전체 프로젝트의 핵심.

### 블록 타입별 구현 계획

| 블록 타입 | 컴포넌트 | 특이사항 |
|-----------|----------|----------|
| `paragraph` | `Paragraph` | RichText 인라인 스타일 포함 |
| `heading_1/2/3` | `Heading` | `id` 속성 (TOC 앵커용) |
| `bulleted_list_item` | `ListItem` | 중첩 처리 필요 |
| `numbered_list_item` | `ListItem` | 중첩 처리 필요 |
| `to_do` | `ListItem` | `checked` 상태 표시 |
| `toggle` | `ToggleBlock` | `<details>/<summary>` 활용 |
| `code` | `CodeBlock` | **shiki** 또는 `rehype-highlight`로 구문 강조 |
| `image` | `ImageBlock` | `next/image` + caption |
| `quote` | `QuoteBlock` | `<blockquote>` |
| `callout` | `CalloutBlock` | 이모지 아이콘 + 색상 배경 |
| `divider` | `DividerBlock` | `<hr>` |
| `table` + `table_row` | `TableBlock` | thead/tbody 구분 (has_column_header) |
| `bookmark` | `BookmarkBlock` | URL 카드 형태 |
| `equation` | — | KaTeX (MVP 이후, unsupported 처리) |

### `RichText` 인라인 스타일

```
bold → <strong>
italic → <em>
strikethrough → <del>
underline → <u>
code → <code> (인라인)
color → Tailwind 색상 클래스
link → <a href="...">
```

### TOC 자동 생성 로직

```typescript
// H2, H3 블록에서 제목 텍스트 추출
// heading.id를 앵커로 사용
// 스크롤 동기화는 Post-MVP
```

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-05 | `RichText.tsx` — 인라인 어노테이션 렌더러 (bold, italic, code, link, color) | M |
| T-06 | 텍스트 블록: `Paragraph`, `Heading`, `QuoteBlock` | S |
| T-07 | 리스트 블록: `ListItem` (bulleted, numbered, to_do, 중첩 지원) | S |
| T-08 | `CodeBlock.tsx` — shiki 구문 강조 + 언어 레이블 | M |
| T-09 | 미디어 블록: `ImageBlock` (next/image + caption), `BookmarkBlock` | S |
| T-10 | 특수 블록: `CalloutBlock`, `ToggleBlock`, `DividerBlock` | S |
| T-11 | `TableBlock.tsx` — table + table_row 렌더링 | S |
| T-12 | `NotionBlockRenderer.tsx` — 타입별 분기 스위치 컴포넌트 | S |
| T-13 | `TableOfContents.tsx` — H2/H3 추출 + 사이드 스티키 TOC | M |

---

## Phase 6: UI + API 통합 ⏳ 대기

> **목표**: 블로그 페이지 3개를 조립하고 Notion API와 연결한다.

### 페이지별 구현

#### `/blog` — 블로그 홈 (T-17)

```
BlogHero (히어로 + SearchBar)
  └── 검색어 → URL 파라미터 (?q=...)
CategoryFilter (탭)
  └── 카테고리 클릭 → /blog/category/[slug]
BlogGrid
  └── BlogCard × N
Pagination
  └── ?page=N
```

**데이터 흐름:**
```typescript
// page.tsx (서버 컴포넌트, ISR)
export const revalidate = 60;
const { posts, totalPages } = await getPostsByPage(page, 9);
const categories = await getAllCategories();
```

#### `/blog/[slug]` — 글 상세 (T-18)

```
뒤로가기 링크
글 제목 + PostMeta (카테고리 · 날짜 · 읽기 시간)
썸네일 이미지 (next/image)
본문 레이아웃:
  ├── 콘텐츠 (NotionBlockRenderer)
  └── 사이드 TOC (데스크톱)
태그 목록
AdjacentNavigation (이전/다음 글)
```

**데이터 흐름:**
```typescript
export const revalidate = 60;
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}
const post = await getPostBySlug(slug);
const blocks = await getPostContent(post.id);
const readingTime = calculateReadingTime(blocks);
const adjacent = await getAdjacentPosts(post.publishedAt, slug);
```

#### `/blog/category/[slug]` — 카테고리별 목록 (T-19)

- 블로그 홈과 동일한 레이아웃
- 해당 카테고리 탭이 활성 상태로 표시
- `getPostsByPage(page, 9, categorySlug)` 사용

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-14 | `BlogCard.tsx` — 썸네일, 제목, 요약, 카테고리 배지, 날짜 | S |
| T-15 | `CategoryFilter.tsx` — 탭 방식, 활성 카테고리 표시 | S |
| T-16 | `Pagination.tsx` — 페이지 번호 + 이전/다음 버튼 | S |
| T-17 | `/blog/page.tsx` — 목록 페이지 조립 (ISR) | M |
| T-18 | `/blog/[slug]/page.tsx` — 상세 페이지 조립 (ISR + generateStaticParams) | M |
| T-19 | `/blog/category/[slug]/page.tsx` — 카테고리 필터 페이지 (ISR) | S |
| T-20 | `BlogHero.tsx` + `SearchBar.tsx` (클라이언트 사이드 검색 UI) | M |
| T-21 | `(blog)/layout.tsx` — 블로그 전용 헤더 + 푸터 완성 | S |

> **병렬 가능**: T-14~T-16 (카드/필터/페이지네이션)은 Phase 5 진행과 동시에 개발 가능 (카드는 메타데이터만 사용)

---

## Phase 7: SEO / 접근성 ⏳ 대기

> **목표**: 검색 엔진 최적화와 접근성 기준(WCAG 2.1 AA)을 충족한다.

### SEO

```
src/app/
├── sitemap.ts            # 동적 sitemap.xml 생성
├── robots.ts             # robots.txt
└── (blog)/blog/
    ├── page.tsx          # generateMetadata() — /blog
    └── [slug]/
        └── page.tsx      # generateMetadata() — /blog/[slug] (OG 이미지, JSON-LD)
```

**`generateMetadata()` 예시:**
```typescript
// /blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.thumbnail ? [post.thumbnail] : [],
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: { card: "summary_large_image" },
  };
}
```

**JSON-LD Article 스키마:**
```typescript
// 글 상세 페이지에 <script type="application/ld+json"> 삽입
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "datePublished": post.publishedAt,
  "author": { "@type": "Person", "name": "..." }
}
```

### 접근성 체크리스트

- [ ] 모든 이미지 `alt` 속성 (Notion caption 활용)
- [ ] 헤딩 계층 구조 (h1 → h2 → h3)
- [ ] 키보드 네비게이션 (탭 순서, 포커스 링)
- [ ] 색상 대비 비율 4.5:1 이상 (다크모드 포함)
- [ ] 스크린 리더용 `aria-label` (카테고리 탭, 페이지네이션)

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-22 | `generateMetadata()` — `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | M |
| T-23 | JSON-LD Article 구조화 데이터 컴포넌트 | S |
| T-24 | `src/app/sitemap.ts` — 동적 사이트맵 (`getAllPostSlugs()` 활용) | S |
| T-25 | `src/app/robots.ts` — robots.txt | S |
| T-26 | 접근성 검토 + 수정 (alt, aria-label, 헤딩 순서) | M |

---

## Phase 8: Review / QA ⏳ 대기

> **목표**: 타입 안전성, 코드 품질, 반응형, 다크모드, Lighthouse 점수를 검증한다.

### 검증 체크리스트

#### 타입 · 린트

```bash
npm run typecheck   # tsc --noEmit (에러 0개)
npm run lint        # ESLint (에러 0개, any 타입 없음)
```

#### 반응형 디자인

| 브레이크포인트 | 글 카드 열 수 | TOC |
|----------------|---------------|-----|
| 모바일 (< 768px) | 1열 | 숨김 |
| 태블릿 (768~1024px) | 2열 | 숨김 |
| 데스크톱 (> 1024px) | 3열 | 사이드 스티키 |

#### 다크모드

- 블로그 카드, 코드 블록, callout, 목차 다크모드 색상 확인
- `shiki`는 다크/라이트 이중 테마 설정 (`github-light` / `github-dark`)

#### Lighthouse

- Performance: 90+ (ISR + next/image 최적화)
- Accessibility: 90+ (Phase 7 완료 후)
- Best Practices: 90+
- SEO: 90+

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-27 | `typecheck` + `lint` 통과 확인 및 수정 | S |
| T-28 | 반응형 + 다크모드 시각적 검증 (Playwright MCP 활용 가능) | M |
| T-29 | Lighthouse 성능 점수 측정 + 개선 (이미지, 번들 크기) | M |

---

## Phase 9: Deployment ⏳ 대기

> **목표**: Vercel에 프로덕션 배포하고, ISR 동작을 확인한다.

### 배포 준비

```bash
# 환경 변수 (Vercel Dashboard > Settings > Environment Variables)
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REVALIDATE_SECRET=랜덤_시크릿_값
AUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 배포 체크리스트

- [ ] `npm run build` 로컬 성공 확인
- [ ] Vercel 환경변수 설정 완료
- [ ] `next.config.ts` 이미지 도메인에 `www.notion.so`, `prod-files-secure.s3.us-west-2.amazonaws.com` 추가
- [ ] 프로덕션 배포 후 ISR 캐시 동작 확인 (`revalidate: 60`)
- [ ] `/api/revalidate` 엔드포인트 수동 테스트
- [ ] 사이트맵 접근 확인 (`/sitemap.xml`)
- [ ] 소셜 OG 이미지 미리보기 확인 (Twitter Card Validator)

### 태스크

| # | 태스크 | 규모 |
|---|--------|------|
| T-30 | Vercel 환경변수 + `next.config.ts` 이미지 도메인 설정 | S |
| T-31 | 프로덕션 배포 + ISR · 사이트맵 · OG 동작 확인 | S |
| T-32 | `.env.example` 업데이트 + `docs/` 문서 정리 | S |

---

## Post-MVP 로드맵

> MVP 완료 후 우선순위별 확장 기능

| 우선순위 | 기능 | 구현 방법 | 예상 규모 |
|----------|------|-----------|-----------|
| 🔴 높음 | 댓글 시스템 | giscus (GitHub Discussions) 임베드 | S |
| 🔴 높음 | RSS 피드 | `/feed.xml` — `rss` 패키지 활용 | S |
| 🟡 중간 | 클라이언트 검색 | Fuse.js 퍼지 검색 (메타데이터 기반) | M |
| 🟡 중간 | 코드 블록 복사 버튼 | 클라이언트 `navigator.clipboard` | S |
| 🟡 중간 | TOC 스크롤 동기화 | IntersectionObserver | M |
| 🟡 중간 | 소셜 공유 버튼 | Twitter, LinkedIn, 카카오 | S |
| 🔵 낮음 | 조회수 트래킹 | Vercel Analytics 또는 별도 카운터 | M |
| 🔵 낮음 | 시리즈(연재) 기능 | Notion DB `Series` 속성 추가 | L |
| 🔵 낮음 | 관련 글 추천 | 태그 기반 유사도 계산 | M |
| 🔵 낮음 | i18n | next-intl | L |
| 🔵 낮음 | 뉴스레터 구독 | Resend + 구독 폼 | M |

---

## Phase 의존성 다이어그램

```
Phase 1 (Schema) ──────────────────────────────┐
     │                                         │
     ▼                                         │
Phase 2 (Convention + notion.ts) ──────────────┤
     │                                         │
     ├──────────────────────────┐              │
     ▼                          ▼              │
Phase 3 (레이아웃 설계)    Phase 4 (API 보완)   │
     │                          │              │
     └──────────┬───────────────┘              │
                │                              │
                ▼                              │
         Phase 5 (블록 렌더러) ◀───────────────┘
                │
          ┌─────┤ (병렬: BlogCard, Pagination)
          │     │
          ▼     ▼
        Phase 6 (UI 통합)
                │
                ▼
         Phase 7 (SEO)
                │
                ▼
         Phase 8 (QA)
                │
                ▼
         Phase 9 (Deployment)
                │
                ▼
          Post-MVP 확장
```

---

## 이슈/PR 작업 순서 요약

> 규모: S = ~1시간, M = ~반나절, L = ~1일

| # | 태스크 | Phase | 규모 | 선행 조건 |
|---|--------|-------|------|-----------|
| T-01 | `(blog)/layout.tsx` 생성 | 3 | S | — |
| T-02 | `src/components/blog/` 디렉토리 구조 | 3 | S | T-01 |
| T-03 | `/api/revalidate` ISR 재검증 엔드포인트 | 4 | S | — |
| T-04 | `notion.ts` 에러 핸들링 강화 | 4 | S | — |
| T-05 | `RichText.tsx` 인라인 어노테이션 렌더러 | 5 | M | T-02 |
| T-06 | 텍스트 블록: `Paragraph`, `Heading`, `QuoteBlock` | 5 | S | T-05 |
| T-07 | 리스트 블록: `ListItem` (중첩 포함) | 5 | S | T-05 |
| T-08 | `CodeBlock.tsx` + shiki 구문 강조 | 5 | M | T-05 |
| T-09 | 미디어 블록: `ImageBlock`, `BookmarkBlock` | 5 | S | T-05 |
| T-10 | 특수 블록: `CalloutBlock`, `ToggleBlock`, `DividerBlock` | 5 | S | T-05 |
| T-11 | `TableBlock.tsx` | 5 | S | T-05 |
| T-12 | `NotionBlockRenderer.tsx` 스위치 컴포넌트 | 5 | S | T-06~T-11 |
| T-13 | `TableOfContents.tsx` H2/H3 추출 + 스티키 | 5 | M | T-12 |
| T-14 | `BlogCard.tsx` | 6 | S | T-02 |
| T-15 | `CategoryFilter.tsx` | 6 | S | T-02 |
| T-16 | `Pagination.tsx` | 6 | S | T-02 |
| T-17 | `/blog/page.tsx` 목록 페이지 | 6 | M | T-12, T-14~T-16 |
| T-18 | `/blog/[slug]/page.tsx` 상세 페이지 | 6 | M | T-12, T-13 |
| T-19 | `/blog/category/[slug]/page.tsx` | 6 | S | T-17 |
| T-20 | `BlogHero.tsx` + `SearchBar.tsx` | 6 | M | T-17 |
| T-21 | `(blog)/layout.tsx` 완성 | 6 | S | T-01 |
| T-22 | `generateMetadata()` 3개 페이지 | 7 | M | T-17~T-19 |
| T-23 | JSON-LD Article 컴포넌트 | 7 | S | T-18 |
| T-24 | `src/app/sitemap.ts` | 7 | S | — |
| T-25 | `src/app/robots.ts` | 7 | S | — |
| T-26 | 접근성 검토 + 수정 | 7 | M | T-17~T-19 |
| T-27 | `typecheck` + `lint` 통과 | 8 | S | T-22~T-26 |
| T-28 | 반응형 + 다크모드 검증 | 8 | M | T-27 |
| T-29 | Lighthouse 90+ 달성 | 8 | M | T-28 |
| T-30 | Vercel 환경변수 + 이미지 도메인 설정 | 9 | S | T-27 |
| T-31 | 프로덕션 배포 + 동작 확인 | 9 | S | T-30 |
| T-32 | `.env.example` + 문서 업데이트 | 9 | S | T-31 |

**총 32개 태스크** | S: 19개 / M: 11개 / L: 0개
