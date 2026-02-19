import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";

interface QuoteBlockProps {
  block: NotionBlock;
}

// quote 블록 렌더러 - 좌측 보더가 있는 인용구
export function QuoteBlock({ block }: QuoteBlockProps) {
  if (!block.quote) return null;

  return (
    <blockquote className="my-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
      <RichText richText={block.quote.rich_text} />
      {/* 하위 블록 지원 (quote 안의 다른 블록들) */}
      {block.children && block.children.length > 0 && (
        <div className="mt-2 not-italic">
          {/* NotionRenderer는 순환 참조 방지를 위해 동적으로 처리 */}
        </div>
      )}
    </blockquote>
  );
}
