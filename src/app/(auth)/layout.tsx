import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인증",
};

// 인증 페이지 레이아웃 (중앙 정렬)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
