import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | 블로그",
    default: "블로그",
  },
  description: "개발 경험과 기술 인사이트를 공유하는 블로그",
};

// 블로그 레이아웃 - 대시보드와 달리 사이드바 없음
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
