import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";
import { NotionRenderer } from "@/components/blog/NotionRenderer";

interface ToggleBlockProps {
  block: NotionBlock;
}

// toggle 블록 렌더러 - HTML details/summary 사용 (JS 없이 동작)
export function ToggleBlock({ block }: ToggleBlockProps) {
  if (!block.toggle) return null;

  const { rich_text } = block.toggle;

  return (
    <details className="my-4 group rounded-lg border">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-medium hover:bg-muted/50 transition-colors list-none">
        {/* 토글 화살표 아이콘 */}
        <svg
          className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <RichText richText={rich_text} />
      </summary>

      {/* 토글 내부 콘텐츠 */}
      {block.children && block.children.length > 0 && (
        <div className="border-t px-4 py-3">
          <NotionRenderer blocks={block.children} />
        </div>
      )}
    </details>
  );
}
