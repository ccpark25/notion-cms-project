import type { NotionBlock } from "@/types/blog";
import { ParagraphBlock } from "@/components/blog/blocks/ParagraphBlock";
import { HeadingBlock } from "@/components/blog/blocks/HeadingBlock";
import { CodeBlock } from "@/components/blog/blocks/CodeBlock";
import { ImageBlock } from "@/components/blog/blocks/ImageBlock";
import { BulletedList, NumberedList } from "@/components/blog/blocks/ListBlock";
import { QuoteBlock } from "@/components/blog/blocks/QuoteBlock";
import { CalloutBlock } from "@/components/blog/blocks/CalloutBlock";
import { DividerBlock } from "@/components/blog/blocks/DividerBlock";
import { ToggleBlock } from "@/components/blog/blocks/ToggleBlock";
import { TableBlock } from "@/components/blog/blocks/TableBlock";

interface NotionRendererProps {
  blocks: NotionBlock[];
}

// 연속된 리스트 블록을 그룹으로 묶는 헬퍼 타입
type BlockGroup =
  | { type: "single"; block: NotionBlock }
  | { type: "bulleted_list"; items: NotionBlock[] }
  | { type: "numbered_list"; items: NotionBlock[] };

// 블록 배열을 렌더링 그룹으로 변환 (연속 리스트 블록 묶기)
function groupBlocks(blocks: NotionBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];

  for (const block of blocks) {
    const lastGroup = groups[groups.length - 1];

    if (block.type === "bulleted_list_item") {
      if (lastGroup?.type === "bulleted_list") {
        lastGroup.items.push(block);
      } else {
        groups.push({ type: "bulleted_list", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      if (lastGroup?.type === "numbered_list") {
        lastGroup.items.push(block);
      } else {
        groups.push({ type: "numbered_list", items: [block] });
      }
    } else {
      groups.push({ type: "single", block });
    }
  }

  return groups;
}

// Notion 블록 배열 → React 컴포넌트 렌더러 (서버 컴포넌트)
// async로 선언하여 내부의 async 컴포넌트(CodeBlock 등) 지원
export async function NotionRenderer({ blocks }: NotionRendererProps) {
  const groups = groupBlocks(blocks);

  const rendered = await Promise.all(
    groups.map(async (group, index) => {
      if (group.type === "bulleted_list") {
        return <BulletedList key={`bulleted-${index}`} items={group.items} />;
      }

      if (group.type === "numbered_list") {
        return <NumberedList key={`numbered-${index}`} items={group.items} />;
      }

      // single block 처리
      const { block } = group;

      switch (block.type) {
        case "paragraph":
          return <ParagraphBlock key={block.id} block={block} />;

        case "heading_1":
        case "heading_2":
        case "heading_3":
          return <HeadingBlock key={block.id} block={block} />;

        case "code":
          // CodeBlock은 async 서버 컴포넌트 (shiki 사용)
          return <CodeBlock key={block.id} block={block} />;

        case "image":
          return <ImageBlock key={block.id} block={block} />;

        case "quote":
          return <QuoteBlock key={block.id} block={block} />;

        case "callout":
          return <CalloutBlock key={block.id} block={block} />;

        case "divider":
          return <DividerBlock key={block.id} />;

        case "toggle":
          return <ToggleBlock key={block.id} block={block} />;

        case "table":
          return <TableBlock key={block.id} block={block} />;

        // 지원하지 않는 블록 타입은 표시하지 않음
        default:
          return null;
      }
    })
  );

  return (
    <div className="space-y-4">
      {rendered}
    </div>
  );
}
