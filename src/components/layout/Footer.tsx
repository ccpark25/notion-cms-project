import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 로고 및 설명 */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">NS</span>
              </div>
              <span>NextStarter</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Next.js 15 기반 프로덕션 준비 스타터킷
            </p>
          </div>

          {/* 링크 */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              홈
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              블로그
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              로그인
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              회원가입
            </Link>
          </nav>

          {/* 저작권 */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} NextStarter. MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
