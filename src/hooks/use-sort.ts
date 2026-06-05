import { useState, useMemo } from "react";

type SortDir = "asc" | "desc";

export function useSort<T>(items: T[], defaultKey: keyof T, defaultDir: SortDir = "desc") {
  const [key, setKey] = useState<keyof T>(defaultKey);
  const [dir, setDir] = useState<SortDir>(defaultDir);

  const toggle = (k: keyof T) => {
    if (k === key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setKey(k); setDir("desc"); }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const av = a[key]; const bv = b[key];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = typeof av === "string"
        ? (av as string).localeCompare(bv as string)
        : (av as number) - (bv as number);
      return dir === "desc" ? -cmp : cmp;
    });
  }, [items, key, dir]);

  return { sorted, key, dir, toggle };
}
