import { codeToHtml } from "shiki";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "@/components/blog/RichText";

interface CodeBlockProps {
  block: NotionBlock;
}

// Notion 언어명 → shiki 언어명 매핑
const LANGUAGE_MAP: Record<string, string> = {
  "plain text": "text",
  "abap": "abap",
  "arduino": "arduino",
  "bash": "bash",
  "basic": "basic",
  "c": "c",
  "clojure": "clojure",
  "coffeescript": "coffeescript",
  "c++": "cpp",
  "c#": "csharp",
  "css": "css",
  "dart": "dart",
  "diff": "diff",
  "docker": "dockerfile",
  "elixir": "elixir",
  "elm": "elm",
  "erlang": "erlang",
  "flow": "javascript",
  "fortran": "fortran",
  "f#": "fsharp",
  "gherkin": "gherkin",
  "glsl": "glsl",
  "go": "go",
  "graphql": "graphql",
  "groovy": "groovy",
  "haskell": "haskell",
  "html": "html",
  "java": "java",
  "javascript": "javascript",
  "json": "json",
  "julia": "julia",
  "kotlin": "kotlin",
  "latex": "latex",
  "less": "less",
  "lisp": "lisp",
  "livescript": "livescript",
  "lua": "lua",
  "makefile": "makefile",
  "markdown": "markdown",
  "markup": "html",
  "matlab": "matlab",
  "mermaid": "mermaid",
  "nix": "nix",
  "objective-c": "objc",
  "ocaml": "ocaml",
  "pascal": "pascal",
  "perl": "perl",
  "php": "php",
  "powershell": "powershell",
  "prolog": "prolog",
  "protobuf": "proto",
  "python": "python",
  "r": "r",
  "reason": "reason",
  "ruby": "ruby",
  "rust": "rust",
  "sass": "sass",
  "scala": "scala",
  "scheme": "scheme",
  "scss": "scss",
  "shell": "bash",
  "sql": "sql",
  "swift": "swift",
  "toml": "toml",
  "typescript": "typescript",
  "vb.net": "vb",
  "verilog": "verilog",
  "vhdl": "vhdl",
  "visual basic": "vb",
  "webassembly": "wat",
  "xml": "xml",
  "yaml": "yaml",
  "java/c/c++/c#": "java",
};

// code 블록 렌더러 - shiki로 구문 강조, 서버 컴포넌트에서만 실행
export async function CodeBlock({ block }: CodeBlockProps) {
  if (!block.code) return null;

  const { rich_text, language, caption } = block.code;
  const code = rich_text.map((t) => t.plain_text).join("");
  const shikiLang = LANGUAGE_MAP[language.toLowerCase()] ?? "text";

  // 라이트/다크 테마 동시 생성 (CSS로 전환)
  const [lightHtml, darkHtml] = await Promise.all([
    codeToHtml(code, {
      lang: shikiLang,
      theme: "github-light",
    }).catch(() => `<pre><code>${code}</code></pre>`),
    codeToHtml(code, {
      lang: shikiLang,
      theme: "github-dark",
    }).catch(() => `<pre><code>${code}</code></pre>`),
  ]);

  return (
    <div className="my-6 not-prose">
      {/* 언어 레이블 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-b-0 text-xs text-muted-foreground font-mono">
        <span>{language || "code"}</span>
      </div>

      {/* shiki 라이트 테마 HTML (다크모드에서 CSS로 숨김) */}
      <div
        className="rounded-b-lg border overflow-hidden [&_.shiki]:rounded-none [&_.shiki]:rounded-b-lg"
        dangerouslySetInnerHTML={{ __html: lightHtml }}
      />
      {/* shiki 다크 테마 HTML (라이트모드에서 CSS로 숨김) */}
      <div
        className="rounded-b-lg border overflow-hidden [&_.shiki]:rounded-none [&_.shiki]:rounded-b-lg"
        dangerouslySetInnerHTML={{ __html: darkHtml }}
      />

      {/* 캡션 */}
      {caption.length > 0 && (
        <p className="mt-2 text-sm text-center text-muted-foreground">
          <RichText richText={caption} />
        </p>
      )}
    </div>
  );
}
