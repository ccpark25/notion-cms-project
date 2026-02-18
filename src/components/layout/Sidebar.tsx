"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/useUIStore";
import type { SidebarNavItem } from "@/types/index";

// 사이드바 메뉴 아이템
const navItems: SidebarNavItem[] = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "설정",
    href: "/settings",
    icon: "Settings",
  },
];

// 아이콘 맵
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, isSidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } =
    useUIStore();

  return (
    <>
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-sidebar border-r transition-all duration-300",
          // 모바일: isSidebarOpen에 따라 표시/숨김
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // 데스크탑: 항상 표시, 접힘 상태에 따라 너비 변경
          "md:translate-x-0",
          isSidebarCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* 사이드바 상단 */}
          <div className="flex items-center justify-between p-4">
            {!isSidebarCollapsed && (
              <span className="text-sm font-semibold text-sidebar-foreground">
                메뉴
              </span>
            )}
            {/* 모바일 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden h-8 w-8"
              aria-label="사이드바 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
            {/* 데스크탑 접기/펼치기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex h-8 w-8 ml-auto"
              aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator />

          {/* 내비게이션 */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon ?? ""];
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isSidebarCollapsed ? item.title : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
