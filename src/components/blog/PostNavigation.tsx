import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdjacentPosts } from "@/types/blog";
import { Card, CardContent } from "@/components/ui/card";

interface PostNavigationProps {
  adjacentPosts: AdjacentPosts;
}

// 이전/다음 글 네비게이션 컴포넌트
export function PostNavigation({ adjacentPosts }: PostNavigationProps) {
  const { previous, next } = adjacentPosts;

  if (!previous && !next) return null;

  return (
    <nav aria-label="이전/다음 글" className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-12">
      {/* 이전 글 (더 최신 글) */}
      <div>
        {previous ? (
          <Link href={`/blog/${previous.slug}`} className="group">
            <Card className="h-full hover:shadow-sm transition-shadow hover:-translate-y-0.5 transition-transform duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>이전 글</span>
                </div>
                <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {previous.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div /> // 빈 공간
        )}
      </div>

      {/* 다음 글 (더 오래된 글) */}
      <div>
        {next ? (
          <Link href={`/blog/${next.slug}`} className="group">
            <Card className="h-full hover:shadow-sm transition-shadow hover:-translate-y-0.5 transition-transform duration-200">
              <CardContent className="p-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  <span>다음 글</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {next.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div /> // 빈 공간
        )}
      </div>
    </nav>
  );
}
