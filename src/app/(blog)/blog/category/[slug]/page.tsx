import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByPage, getAllCategories } from "@/lib/notion";
import { PostGrid } from "@/components/blog/PostGrid";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Pagination } from "@/components/blog/Pagination";

// ISR: 60초마다 재검증
export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// 정적 경로 생성 (알려진 카테고리 슬러그)
// Notion API 미설정 시 빈 배열 반환 → 런타임에 동적 생성
export async function generateStaticParams() {
  if (!process.env.NOTION_DATABASE_ID) return [];
  try {
    const categories = await getAllCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!process.env.NOTION_DATABASE_ID) return { title: slug };
  try {
    const categories = await getAllCategories();
    const category = categories.find((cat) => cat.slug === slug);
    if (!category) return { title: "카테고리를 찾을 수 없습니다" };
    return {
      title: `${category.name} | 블로그`,
      description: `${category.name} 카테고리의 글 목록입니다. 총 ${category.count}개의 글이 있습니다.`,
    };
  } catch {
    return { title: slug };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  // 데이터 병렬 페치
  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPostsByPage(currentPage, 9, slug),
    getAllCategories(),
  ]);

  // 유효하지 않은 카테고리 슬러그 처리
  const currentCategory = categories.find((cat) => cat.slug === slug);
  if (!currentCategory && categories.length > 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 섹션 헤더 */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {currentCategory?.name ?? slug}
        </h1>
        <p className="text-lg text-muted-foreground">
          {total}개의 글이 있습니다.
        </p>
      </section>

      {/* 카테고리 필터 (현재 카테고리 활성화) */}
      {categories.length > 0 && (
        <section className="mb-8">
          <CategoryFilter categories={categories} activeCategory={slug} />
        </section>
      )}

      {/* 글 목록 */}
      <PostGrid posts={posts} />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/blog/category/${slug}`}
      />
    </div>
  );
}
