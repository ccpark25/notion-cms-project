import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  block: NotionBlock;
}

// callout 블록 렌더러 - 아이콘 + 배경색 박스
export function CalloutBlock({ block }: CalloutBlockProps) {
  if (!block.callout) return null;

  const { rich_text, icon, color } = block.callout;

  // Notion 컬러에 따른 배경/텍스트 클래스 매핑
  const colorClass = cn(
    color === "blue_background" && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    color === "green_background" && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    color === "yellow_background" && "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    color === "orange_background" && "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    color === "red_background" && "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    color === "purple_background" && "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    color === "pink_background" && "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800",
    color === "gray_background" && "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700",
    !color?.includes("background") && "bg-muted border-border"
  );

  return (
    <div className={cn("my-6 flex gap-3 rounded-lg border p-4", colorClass)}>
      {/* 아이콘 영역 */}
      {icon && (
        <div className="flex-shrink-0 text-xl leading-7">
          {icon.type === "emoji" ? (
            <span>{icon.emoji}</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon.external.url}
              alt="callout icon"
              className="h-6 w-6"
            />
          )}
        </div>
      )}

      {/* 내용 */}
      <div className="flex-1 leading-7">
        <RichText richText={rich_text} />
      </div>
    </div>
  );
}
