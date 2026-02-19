import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // 예: "/blog" 또는 "/blog/category/javascript"
}

// 페이지 네비게이션 컴포넌트
export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 표시할 페이지 번호 범위 계산 (현재 페이지 기준 ±2)
  const getPageHref = (page: number) => {
    if (page === 1) return basePath;
    return `${basePath}?page=${page}`;
  };

  // 표시할 페이지 번호 목록 생성
  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 4) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="페이지네이션" className="flex items-center justify-center gap-1 mt-10">
      {/* 이전 페이지 */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        {currentPage > 1 ? (
          <Link href={getPageHref(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* 페이지 번호들 */}
      {visiblePages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <Button
            key={page}
            variant={isActive ? "default" : "outline"}
            size="icon"
            asChild={!isActive}
            className={cn("h-9 w-9 text-sm", isActive && "pointer-events-none")}
            aria-label={`${page}페이지`}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive ? (
              <span>{page}</span>
            ) : (
              <Link href={getPageHref(page)}>{page}</Link>
            )}
          </Button>
        );
      })}

      {/* 다음 페이지 */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        {currentPage < totalPages ? (
          <Link href={getPageHref(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
