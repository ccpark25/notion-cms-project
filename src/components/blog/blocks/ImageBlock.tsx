import Image from "next/image";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";

interface ImageBlockProps {
  block: NotionBlock;
}

// image 블록 렌더러 - next/image 사용, 캡션 지원
export function ImageBlock({ block }: ImageBlockProps) {
  if (!block.image) return null;

  const { type, external, file, caption } = block.image;

  // 이미지 URL 결정 (external 또는 file)
  const src = type === "external" ? (external?.url ?? "") : (file?.url ?? "");
  if (!src) return null;

  const altText = caption.length > 0
    ? caption.map((t) => t.plain_text).join("")
    : "블로그 이미지";

  return (
    <figure className="my-8">
      <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
        <Image
          src={src}
          alt={altText}
          width={800}
          height={450}
          className="w-full h-auto object-cover"
          unoptimized={src.includes("amazonaws.com")} // Notion 파일 URL은 만료되므로 최적화 제외
        />
      </div>
      {caption.length > 0 && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          <RichText richText={caption} />
        </figcaption>
      )}
    </figure>
  );
}
