import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";

interface ParagraphBlockProps {
  block: NotionBlock;
}

// paragraph 블록 렌더러
export function ParagraphBlock({ block }: ParagraphBlockProps) {
  if (!block.paragraph) return null;

  const { rich_text } = block.paragraph;

  // 빈 단락은 공백 줄로 렌더링
  if (rich_text.length === 0) {
    return <p className="min-h-[1.5em]" />;
  }

  return (
    <p className="leading-7 text-foreground/90">
      <RichText richText={rich_text} />
    </p>
  );
}
