"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  // 하이드레이션 불일치 방지를 위한 mounted 상태
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 하이드레이션 완료 후 mounted 상태 설정 (표준 패턴)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 라이트/다크 모드 토글
  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = mounted && resolvedTheme === "dark";
  const isLight = mounted && resolvedTheme === "light";

  return {
    theme,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    systemTheme,
    mounted,
    toggleTheme,
    isDark,
    isLight,
  };
}
