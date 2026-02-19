import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: BlogPost;
}

// 블로그 글 카드 컴포넌트 - 썸네일, 제목, 요약, 메타 정보 표시
export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* 썸네일 이미지 */}
        {post.thumbnail && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* 썸네일이 없을 때 플레이스홀더 */}
        {!post.thumbnail && (
          <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/20">
              {post.title.charAt(0)}
            </span>
          </div>
        )}

        <CardHeader className="pb-2">
          {/* 카테고리 배지 */}
          {post.category && (
            <Badge variant="secondary" className="w-fit text-xs mb-2">
              {post.category}
            </Badge>
          )}

          {/* 제목 */}
          <h2 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* 요약 */}
          {post.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 메타 정보: 날짜, 읽기 시간 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.publishedAt)}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime}분
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
