import type { BlogPost } from "@/types/blog";
import { PostCard } from "@/components/blog/PostCard";

interface PostGridProps {
  posts: BlogPost[];
}

// 카드 그리드 레이아웃 - 모바일 1열, 태블릿 2열, 데스크톱 3열
export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-lg">아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
