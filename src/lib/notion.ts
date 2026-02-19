import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
  CalloutBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  BlogPost,
  BlogCategory,
  BlogPostListResponse,
  AdjacentPosts,
  NotionBlock,
  NotionRichText,
} from "@/types/blog";
import { slugify } from "@/lib/utils";

// Notion 클라이언트 초기화 (서버 전용)
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

// ─────────────────────────────────────────────
// Notion 속성 파싱 헬퍼 함수들
// ─────────────────────────────────────────────

// 제목 속성 파싱
function getTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find(
    (prop) => prop.type === "title"
  );
  if (!titleProp || titleProp.type !== "title") return "";
  return titleProp.title.map((t) => t.plain_text).join("");
}

// 리치 텍스트 속성에서 평문 추출
function getRichTextValue(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}

// Select 속성 값 추출
function getSelectValue(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name ?? "";
}

// MultiSelect 속성 값 배열 추출
function getMultiSelectValues(page: PageObjectResponse, propertyName: string): string[] {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((item) => item.name);
}

// Checkbox 속성 값 추출
function getCheckboxValue(page: PageObjectResponse, propertyName: string): boolean {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox;
}

// Date 속성 값 추출
function getDateValue(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "date") return "";
  return prop.date?.start ?? "";
}

// URL 속성 값 추출
function getUrlValue(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "url") return "";
  return prop.url ?? "";
}

// 페이지를 BlogPost 타입으로 변환
function pageToPost(page: PageObjectResponse): BlogPost {
  const title = getTitle(page);

  // Slug: Notion DB에 Slug 속성이 있으면 사용, 없으면 제목에서 자동 생성
  const slugProp = getRichTextValue(page, "Slug");
  const slug = slugProp || slugify(title) || page.id;

  // 커버 이미지 (페이지 커버 → Thumbnail 속성 → undefined)
  let thumbnail: string | undefined;
  if (page.cover) {
    if (page.cover.type === "external") {
      thumbnail = page.cover.external.url;
    } else if (page.cover.type === "file") {
      thumbnail = page.cover.file.url;
    }
  }
  if (!thumbnail) {
    const thumbUrl = getUrlValue(page, "Thumbnail");
    if (thumbUrl) thumbnail = thumbUrl;
  }

  return {
    id: page.id,
    title,
    slug,
    description: getRichTextValue(page, "Description"),
    category: getSelectValue(page, "Category"),
    tags: getMultiSelectValues(page, "Tags"),
    published: getCheckboxValue(page, "Published"),
    publishedAt: getDateValue(page, "PublishedAt") || page.created_time,
    thumbnail,
  };
}

// Notion SDK RichTextItemResponse → 우리 NotionRichText 타입으로 변환
function convertRichText(richTextItems: RichTextItemResponse[]): NotionRichText[] {
  return richTextItems.map((item) => ({
    type: item.type as NotionRichText["type"],
    text: item.type === "text" ? item.text : undefined,
    annotations: item.annotations,
    plain_text: item.plain_text,
    href: item.href,
  }));
}

// Notion SDK BlockObjectResponse → NotionBlock 타입으로 변환
function convertBlock(block: BlockObjectResponse): NotionBlock {
  const base = {
    id: block.id,
    type: block.type as NotionBlock["type"],
    has_children: block.has_children,
  };

  switch (block.type) {
    case "paragraph":
      return { ...base, paragraph: { rich_text: convertRichText(block.paragraph.rich_text), color: block.paragraph.color } };
    case "heading_1":
      return { ...base, heading_1: { rich_text: convertRichText(block.heading_1.rich_text), color: block.heading_1.color, is_toggleable: block.heading_1.is_toggleable } };
    case "heading_2":
      return { ...base, heading_2: { rich_text: convertRichText(block.heading_2.rich_text), color: block.heading_2.color, is_toggleable: block.heading_2.is_toggleable } };
    case "heading_3":
      return { ...base, heading_3: { rich_text: convertRichText(block.heading_3.rich_text), color: block.heading_3.color, is_toggleable: block.heading_3.is_toggleable } };
    case "bulleted_list_item":
      return { ...base, bulleted_list_item: { rich_text: convertRichText(block.bulleted_list_item.rich_text), color: block.bulleted_list_item.color } };
    case "numbered_list_item":
      return { ...base, numbered_list_item: { rich_text: convertRichText(block.numbered_list_item.rich_text), color: block.numbered_list_item.color } };
    case "to_do":
      return { ...base, to_do: { rich_text: convertRichText(block.to_do.rich_text), checked: block.to_do.checked, color: block.to_do.color } };
    case "toggle":
      return { ...base, toggle: { rich_text: convertRichText(block.toggle.rich_text), color: block.toggle.color } };
    case "code":
      return {
        ...base,
        code: {
          rich_text: convertRichText(block.code.rich_text),
          language: block.code.language,
          caption: convertRichText(block.code.caption),
        },
      };
    case "image": {
      const imageData = block.image;
      return {
        ...base,
        image: {
          type: imageData.type,
          external: imageData.type === "external" ? imageData.external : undefined,
          file: imageData.type === "file" ? imageData.file : undefined,
          caption: convertRichText(imageData.caption),
        },
      };
    }
    case "quote":
      return { ...base, quote: { rich_text: convertRichText(block.quote.rich_text), color: block.quote.color } };
    case "callout": {
      // SDK v5의 callout icon은 PageIconResponse | null 타입
      const calloutBlock = block as CalloutBlockObjectResponse;
      const icon = calloutBlock.callout.icon;
      let convertedIcon: { type: "emoji"; emoji: string } | { type: "external"; external: { url: string } } | null = null;
      if (icon) {
        if (icon.type === "emoji") {
          convertedIcon = { type: "emoji", emoji: icon.emoji };
        } else if (icon.type === "external") {
          convertedIcon = { type: "external", external: { url: icon.external.url } };
        }
        // file 타입이나 custom_emoji는 지원하지 않음 (null로 처리)
      }
      return {
        ...base,
        callout: {
          rich_text: convertRichText(calloutBlock.callout.rich_text),
          icon: convertedIcon,
          color: calloutBlock.callout.color,
        },
      };
    }
    case "divider":
      return { ...base, divider: {} };
    case "table":
      return { ...base, table: { table_width: block.table.table_width, has_column_header: block.table.has_column_header, has_row_header: block.table.has_row_header } };
    case "table_row":
      return { ...base, table_row: { cells: block.table_row.cells.map(convertRichText) } };
    case "bookmark":
      return { ...base, bookmark: { url: block.bookmark.url, caption: convertRichText(block.bookmark.caption) } };
    case "equation":
      return { ...base, equation: { expression: block.equation.expression } };
    default:
      return base;
  }
}

// ─────────────────────────────────────────────
// 공개 API 함수들
// ─────────────────────────────────────────────

/**
 * Published=true인 모든 글 메타데이터를 PublishedAt 내림차순으로 가져옴
 * Notion SDK v5에서는 dataSources.query 사용
 */
export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [
        { property: "PublishedAt", direction: "descending" },
      ],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const result of response.results) {
      // PageObjectResponse만 처리 (DataSourceObjectResponse 제외)
      if (result.object === "page" && "properties" in result) {
        pages.push(result as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages.map(pageToPost);
}

/**
 * 페이지네이션 + 카테고리 필터를 적용한 글 목록
 * 전체 목록을 인메모리에서 슬라이싱 (Notion API는 N페이지 직접 접근 불가)
 */
export async function getPostsByPage(
  page: number = 1,
  pageSize: number = 9,
  category?: string
): Promise<BlogPostListResponse> {
  const allPosts = await getAllPublishedPosts();
  const filtered = category
    ? allPosts.filter((post) => slugify(post.category) === category)
    : allPosts;

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const posts = filtered.slice(start, start + pageSize);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages,
    category,
  };
}

/**
 * 슬러그로 단일 글 메타데이터 조회
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllPublishedPosts();
  return allPosts.find((post) => post.slug === slug) ?? null;
}

/**
 * 글 본문 블록 배열 (재귀적으로 하위 블록 포함)
 */
export async function getPostContent(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if (!("type" in block)) continue;
      const converted = convertBlock(block as BlockObjectResponse);

      // 하위 블록이 있는 경우 재귀 호출 (toggle, callout, column_list 등)
      if (converted.has_children) {
        converted.children = await getPostContent(block.id);
      }

      blocks.push(converted);
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

/**
 * 모든 카테고리 목록 + 각 카테고리의 글 수
 */
export async function getAllCategories(): Promise<BlogCategory[]> {
  const allPosts = await getAllPublishedPosts();
  const countMap = new Map<string, number>();

  for (const post of allPosts) {
    if (!post.category) continue;
    countMap.set(post.category, (countMap.get(post.category) ?? 0) + 1);
  }

  return Array.from(countMap.entries())
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count); // 글 수 내림차순
}

/**
 * 이전/다음 글 조회 (최신순 배열 기준)
 */
export async function getAdjacentPosts(
  _publishedAt: string,
  currentSlug: string
): Promise<AdjacentPosts> {
  const allPosts = await getAllPublishedPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  // 배열은 최신순(내림차순)이므로: 이전 글 = 더 최신(인덱스 -1), 다음 글 = 더 오래된 것(인덱스 +1)
  return {
    previous: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}

/**
 * 사이트맵용 모든 슬러그 목록
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const allPosts = await getAllPublishedPosts();
  return allPosts.map((post) => post.slug);
}

/**
 * 블록 배열에서 읽기 시간 계산 (분 단위, 200 WPM 기준)
 */
export function calculateReadingTime(blocks: NotionBlock[]): number {
  let wordCount = 0;

  function countWords(text: string): number {
    // 한국어는 어절 기준 (공백으로 구분), 영어는 단어 기준
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function processBlocks(blockList: NotionBlock[]): void {
    for (const block of blockList) {
      const richTextData = (
        block.paragraph?.rich_text ??
        block.heading_1?.rich_text ??
        block.heading_2?.rich_text ??
        block.heading_3?.rich_text ??
        block.bulleted_list_item?.rich_text ??
        block.numbered_list_item?.rich_text ??
        block.to_do?.rich_text ??
        block.toggle?.rich_text ??
        block.quote?.rich_text ??
        block.callout?.rich_text ??
        block.code?.rich_text
      );

      if (richTextData) {
        const text = richTextData.map((t) => t.plain_text).join("");
        wordCount += countWords(text);
      }

      if (block.children) {
        processBlocks(block.children);
      }
    }
  }

  processBlocks(blocks);

  // 200 WPM 기준, 최소 1분
  return Math.max(1, Math.ceil(wordCount / 200));
}
