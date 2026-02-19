import { PostDetailSkeleton } from "@/components/blog/BlogSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// 글 상세 페이지 로딩 상태
export default function PostLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 뒤로가기 버튼 스켈레톤 */}
      <div className="mb-8">
        <Skeleton className="h-8 w-28" />
      </div>

      <PostDetailSkeleton />
    </div>
  );
}
