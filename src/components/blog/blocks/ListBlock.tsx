import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";
import { NotionRenderer } from "@/components/blog/NotionRenderer";

interface BulletedListProps {
  items: NotionBlock[];
}

interface NumberedListProps {
  items: NotionBlock[];
}

// 불릿 리스트 그룹 렌더러
export function BulletedList({ items }: BulletedListProps) {
  return (
    <ul className="my-4 ml-6 list-disc space-y-2">
      {items.map((item) => {
        if (!item.bulleted_list_item) return null;
        return (
          <li key={item.id} className="leading-7">
            <RichText richText={item.bulleted_list_item.rich_text} />
            {/* 중첩 하위 리스트 */}
            {item.children && item.children.length > 0 && (
              <div className="mt-2">
                <NotionRenderer blocks={item.children} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// 번호 리스트 그룹 렌더러
export function NumberedList({ items }: NumberedListProps) {
  return (
    <ol className="my-4 ml-6 list-decimal space-y-2">
      {items.map((item) => {
        if (!item.numbered_list_item) return null;
        return (
          <li key={item.id} className="leading-7">
            <RichText richText={item.numbered_list_item.rich_text} />
            {/* 중첩 하위 리스트 */}
            {item.children && item.children.length > 0 && (
              <div className="mt-2">
                <NotionRenderer blocks={item.children} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
