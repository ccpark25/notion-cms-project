import { PostGridSkeleton } from "@/components/blog/BlogSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// 카테고리 목록 로딩 상태
export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-5 w-32 mx-auto" />
      </section>

      <section className="mb-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </section>

      <PostGridSkeleton count={9} />
    </div>
  );
}
