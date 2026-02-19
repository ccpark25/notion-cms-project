"use client";

import { useEffect, useState } from "react";
import type { NotionBlock } from "@/types/blog";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  blocks: NotionBlock[];
}

// 블록 배열에서 헤딩 목록 추출
function extractHeadings(blocks: NotionBlock[]): TocItem[] {
  const headings: TocItem[] = [];

  for (const block of blocks) {
    const headingData =
      block.heading_1 ?? block.heading_2 ?? block.heading_3;

    if (!headingData) continue;

    const text = headingData.rich_text.map((t) => t.plain_text).join("");
    if (!text) continue;

    const level = block.type === "heading_1" ? 1 : block.type === "heading_2" ? 2 : 3;
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}

// 목차 컴포넌트 - H2/H3 기반, 활성 헤딩 강조 (Intersection Observer)
export function TableOfContents({ blocks }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(blocks);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 뷰포트에 보이는 헤딩 중 가장 위쪽을 활성화
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0% -80% 0%",
        threshold: 1.0,
      }
    );

    // 모든 헤딩 요소에 옵저버 연결
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="목차" className="sticky top-24 hidden lg:block">
      <div className="rounded-lg border p-4 bg-muted/30">
        <p className="text-sm font-semibold mb-3 text-foreground">목차</p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm py-0.5 transition-colors hover:text-primary",
                  heading.level === 1 && "font-medium",
                  heading.level === 2 && "pl-3",
                  heading.level === 3 && "pl-6 text-xs",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
