import type { MetadataRoute } from "next";
import { getAllPublishedPosts, getAllCategories } from "@/lib/notion";
import { slugify } from "@/lib/utils";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 블로그 글 페이지
  let postPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const [posts, categories] = await Promise.all([
      getAllPublishedPosts(),
      getAllCategories(),
    ]);

    postPages = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    categoryPages = categories.map((category) => ({
      url: `${BASE_URL}/blog/category/${slugify(category.slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Notion API 오류 시 정적 페이지만 반환
    console.error("사이트맵 생성 중 Notion API 오류:", "Notion API unavailable");
  }

  return [...staticPages, ...postPages, ...categoryPages];
}
