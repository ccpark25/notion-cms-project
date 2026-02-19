import type { Metadata } from "next";
import { getPostsByPage, getAllCategories } from "@/lib/notion";
import { PostGrid } from "@/components/blog/PostGrid";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Pagination } from "@/components/blog/Pagination";

// ISR: 60초마다 재검증
export const revalidate = 60;

export const metadata: Metadata = {
  title: "블로그",
  description: "개발 경험과 기술 인사이트를 공유하는 블로그입니다.",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  // 데이터 병렬 페치
  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPostsByPage(currentPage, 9),
    getAllCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 히어로 섹션 */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">블로그</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          개발 경험과 기술 인사이트를 공유합니다. 총 {total}개의 글이 있습니다.
        </p>
      </section>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <section className="mb-8">
          <CategoryFilter categories={categories} />
        </section>
      )}

      {/* 글 목록 그리드 */}
      <PostGrid posts={posts} />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/blog"
      />
    </div>
  );
}
