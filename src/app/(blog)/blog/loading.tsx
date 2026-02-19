import { PostGridSkeleton } from "@/components/blog/BlogSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// 블로그 홈 로딩 상태
export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 히어로 스켈레톤 */}
      <section className="mb-12 text-center space-y-4">
        <Skeleton className="h-10 w-32 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </section>

      {/* 카테고리 필터 스켈레톤 */}
      <section className="mb-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </section>

      {/* 글 목록 스켈레톤 */}
      <PostGridSkeleton count={9} />
    </div>
  );
}
