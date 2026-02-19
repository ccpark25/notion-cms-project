import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";
import { slugify } from "@/lib/utils";

interface HeadingBlockProps {
  block: NotionBlock;
}

// heading_1, heading_2, heading_3 블록 렌더러
// id 속성 추가로 목차(TOC) 앵커 링크 지원
export function HeadingBlock({ block }: HeadingBlockProps) {
  const headingData =
    block.heading_1 ?? block.heading_2 ?? block.heading_3;

  if (!headingData) return null;

  const { rich_text } = headingData;
  const plainText = rich_text.map((t) => t.plain_text).join("");
  const id = slugify(plainText);

  if (block.type === "heading_1") {
    return (
      <h1
        id={id}
        className="scroll-m-20 text-3xl font-bold tracking-tight mt-10 mb-4 first:mt-0"
      >
        <RichText richText={rich_text} />
      </h1>
    );
  }

  if (block.type === "heading_2") {
    return (
      <h2
        id={id}
        className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-3 first:mt-0 border-b pb-2"
      >
        <RichText richText={rich_text} />
      </h2>
    );
  }

  // heading_3
  return (
    <h3
      id={id}
      className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-2 first:mt-0"
    >
      <RichText richText={rich_text} />
    </h3>
  );
}
