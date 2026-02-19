// 블로그 글 메타데이터
export interface BlogPost {
  id: string;          // Notion 페이지 ID
  title: string;
  slug: string;        // URL에 사용할 슬러그
  description: string; // 요약/발췌문
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string; // ISO 날짜 문자열
  thumbnail?: string;  // 썸네일 이미지 URL
  readingTime?: number; // 읽기 시간 (분)
}

// 카테고리
export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

// 페이지네이션된 글 목록 응답
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  category?: string;
}

// 이전/다음 글
export interface AdjacentPosts {
  previous: BlogPost | null;
  next: BlogPost | null;
}

// Notion 리치 텍스트 어노테이션
export interface NotionAnnotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

// Notion 리치 텍스트 단위
export interface NotionRichText {
  type: "text" | "mention" | "equation";
  text?: {
    content: string;
    link: { url: string } | null;
  };
  annotations: NotionAnnotations;
  plain_text: string;
  href: string | null;
}

// Notion 블록 타입 유니온
export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "to_do"
  | "toggle"
  | "code"
  | "image"
  | "quote"
  | "callout"
  | "divider"
  | "table"
  | "table_row"
  | "bookmark"
  | "embed"
  | "video"
  | "file"
  | "pdf"
  | "link_preview"
  | "synced_block"
  | "column_list"
  | "column"
  | "child_page"
  | "child_database"
  | "equation"
  | "breadcrumb"
  | "table_of_contents"
  | "link_to_page"
  | "audio"
  | "unsupported";

// Notion 블록 (렌더링에 필요한 데이터만 추출)
export interface NotionBlock {
  id: string;
  type: NotionBlockType;
  has_children: boolean;
  children?: NotionBlock[];

  // 각 블록 타입별 데이터
  paragraph?: { rich_text: NotionRichText[]; color: string };
  heading_1?: { rich_text: NotionRichText[]; color: string; is_toggleable: boolean };
  heading_2?: { rich_text: NotionRichText[]; color: string; is_toggleable: boolean };
  heading_3?: { rich_text: NotionRichText[]; color: string; is_toggleable: boolean };
  bulleted_list_item?: { rich_text: NotionRichText[]; color: string };
  numbered_list_item?: { rich_text: NotionRichText[]; color: string };
  to_do?: { rich_text: NotionRichText[]; checked: boolean; color: string };
  toggle?: { rich_text: NotionRichText[]; color: string };
  code?: {
    rich_text: NotionRichText[];
    language: string;
    caption: NotionRichText[];
  };
  image?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time: string };
    caption: NotionRichText[];
  };
  quote?: { rich_text: NotionRichText[]; color: string };
  callout?: {
    rich_text: NotionRichText[];
    icon: { type: "emoji"; emoji: string } | { type: "external"; external: { url: string } } | null;
    color: string;
  };
  divider?: Record<string, never>;
  table?: { table_width: number; has_column_header: boolean; has_row_header: boolean };
  table_row?: { cells: NotionRichText[][] };
  bookmark?: { url: string; caption: NotionRichText[] };
  equation?: { expression: string };
}
