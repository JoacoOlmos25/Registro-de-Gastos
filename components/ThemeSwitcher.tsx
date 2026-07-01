"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-border bg-card"></div> // Placeholder
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-background transition-colors flex items-center justify-center shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Moon size={18} className="text-primary" />
      ) : (
        <Sun size={18} className="text-primary" />
      )}
    </button>
  );
}
