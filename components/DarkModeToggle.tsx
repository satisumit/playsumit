"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("isDarkMode");
    const initialIsDark = savedTheme === "true";
    setIsDark(initialIsDark);
    applyTheme(initialIsDark);
  }, []);

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("isDarkMode", String(newIsDark));
    applyTheme(newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full w-8 h-8 bg-amber-200 p-2 flex items-center justify-center dark:border-zinc-200 border-zinc-900 border transition-all duration-300 hover:bg-amber-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 cursor-pointer"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-zinc-200" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-950" />
      )}
    </button>
  );
};

export default DarkModeToggle;
