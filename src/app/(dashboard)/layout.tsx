import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// 대시보드 레이아웃 (서버 컴포넌트에서 세션 검증)
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 세션 검증 - 비로그인 시 로그인 페이지로 리다이렉트
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showSidebarToggle />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 사이드바 (모바일에서는 숨김, md 이상에서 표시) */}
        <Sidebar />
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto p-6 md:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
