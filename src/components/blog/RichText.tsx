import type { NotionRichText } from "@/types/blog";
import { cn } from "@/lib/utils";

interface RichTextProps {
  richText: NotionRichText[];
  className?: string;
}

// Notion 리치 텍스트 배열을 React 인라인 요소로 렌더링
export function RichText({ richText, className }: RichTextProps) {
  if (!richText || richText.length === 0) return null;

  return (
    <span className={className}>
      {richText.map((item, index) => {
        const { annotations, plain_text, href, text } = item;
        const linkUrl = href ?? text?.link?.url;

        // 어노테이션에 따라 CSS 클래스 조합
        const textClass = cn(
          annotations.bold && "font-bold",
          annotations.italic && "italic",
          annotations.strikethrough && "line-through",
          annotations.underline && "underline",
          annotations.code &&
            "font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-foreground"
        );

        const content = (
          <span key={index} className={textClass || undefined}>
            {plain_text}
          </span>
        );

        // 링크가 있으면 <a> 태그로 감쌈
        if (linkUrl) {
          return (
            <a
              key={index}
              href={linkUrl}
              target={linkUrl.startsWith("http") ? "_blank" : undefined}
              rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className={cn(
                "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
                textClass
              )}
            >
              {plain_text}
            </a>
          );
        }

        return content;
      })}
    </span>
  );
}
