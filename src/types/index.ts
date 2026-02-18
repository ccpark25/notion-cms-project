// API 응답 공통 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 내비게이션 아이템 타입
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

// 사이드바 내비게이션 아이템 타입 (하위 메뉴 지원)
export interface SidebarNavItem extends NavItem {
  items?: NavItem[];
}

// 페이지네이션 타입
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 테이블 컬럼 타입
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  className?: string;
}
