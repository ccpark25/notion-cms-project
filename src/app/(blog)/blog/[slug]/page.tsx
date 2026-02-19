import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ChevronLeft } from "lucide-react";
import {
  getPostBySlug,
  getPostContent,
  getAdjacentPosts,
  getAllPostSlugs,
  calculateReadingTime,
} from "@/lib/notion";
import { NotionRenderer } from "@/components/blog/NotionRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, slugify } from "@/lib/utils";

// ISR: 60초마다 재검증
export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 정적 경로 생성 (빌드 시 알려진 슬러그 목록)
// Notion API 미설정 시 빈 배열 반환 → 런타임에 동적 생성
export async function generateStaticParams() {
  if (!process.env.NOTION_DATABASE_ID) return [];
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
      ...(post.thumbnail && { images: [{ url: post.thumbnail }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // 글 메타데이터 + 본문 + 이전/다음 글 병렬 페치
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [blocks, adjacentPosts] = await Promise.all([
    getPostContent(post.id),
    getAdjacentPosts(post.publishedAt, post.slug),
  ]);

  const readingTime = calculateReadingTime(blocks);

  // JSON-LD 구조화 데이터 (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    ...(post.thumbnail && { image: post.thumbnail }),
    keywords: post.tags.join(", "),
  };

  return (
    <>
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">
              <ChevronLeft className="mr-1 h-4 w-4" />
              블로그 목록
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* 메인 컨텐츠 영역 */}
          <article className="min-w-0">
            {/* 글 헤더 */}
            <header className="mb-8 space-y-4">
              {/* 카테고리 배지 */}
              {post.category && (
                <div>
                  <Link href={`/blog/category/${slugify(post.category)}`}>
                    <Badge variant="secondary">{post.category}</Badge>
                  </Link>
                </div>
              )}

              {/* 제목 */}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                {post.title}
              </h1>

              {/* 설명 */}
              {post.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
              )}

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime}분 읽기
                </span>
              </div>

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 썸네일 이미지 */}
            {post.thumbnail && (
              <div className="relative mb-10 h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-96">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={post.thumbnail.includes("amazonaws.com")}
                />
              </div>
            )}

            <Separator className="mb-10" />

            {/* 글 본문 */}
            <div className="prose-content">
              <NotionRenderer blocks={blocks} />
            </div>

            {/* 태그 섹션 (하단) */}
            {post.tags.length > 0 && (
              <>
                <Separator className="mt-10 mb-6" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {/* 이전/다음 글 네비게이션 */}
            <PostNavigation adjacentPosts={adjacentPosts} />
          </article>

          {/* 목차 사이드바 (데스크톱) */}
          <aside>
            <TableOfContents blocks={blocks} />
          </aside>
        </div>
      </div>
    </>
  );
}
