"use client";

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-stone text-ink hover:bg-stone-400"
    >
      {dark ? '☾ Dark' : '☀ Light'}
    </button>
  );
}