"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BlogCategory } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: BlogCategory[];
  activeCategory?: string; // 카테고리 slug
}

// 카테고리 필터 버튼 - 클라이언트 컴포넌트 (현재 경로 확인 필요)
export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const pathname = usePathname();
  // /blog/category/[slug] 페이지인지 확인
  const isAll = !activeCategory && (pathname === "/blog" || pathname.startsWith("/blog?"));

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 보기 버튼 */}
      <Link href="/blog">
        <Badge
          variant={isAll ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-sm py-1 px-3 transition-colors",
            isAll
              ? "hover:bg-primary/90"
              : "hover:bg-secondary hover:text-secondary-foreground"
          )}
        >
          전체
        </Badge>
      </Link>

      {/* 카테고리별 버튼 */}
      {categories.map((category) => {
        const isActive = activeCategory === category.slug;
        return (
          <Link key={category.slug} href={`/blog/category/${category.slug}`}>
            <Badge
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-sm py-1 px-3 transition-colors",
                isActive
                  ? "hover:bg-primary/90"
                  : "hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
