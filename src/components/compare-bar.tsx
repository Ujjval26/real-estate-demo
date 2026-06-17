"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "estateably:compare";
const MAX_ITEMS = 4;

interface CompareItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  listingType: string;
  cover?: string;
}

/**
 * Reads/writes the user's "compare list" to localStorage.
 * Used by both the compare button on PropertyCard and the floating
 * CompareBar shown at the bottom of search results.
 */
export function useCompareList() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // Defer the state update to avoid cascading renders
      queueMicrotask(() => setItems(parsed));
    } catch {}
  }, []);

  function persist(next: CompareItem[]) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    // Notify other components (e.g. PropertyCard) that the list changed
    window.dispatchEvent(new Event("estateably:compare-changed"));
  }

  function add(item: CompareItem) {
    if (items.some((i) => i.id === item.id)) return;
    if (items.length >= MAX_ITEMS) return;
    persist([...items, item]);
  }

  function remove(id: string) {
    persist(items.filter((i) => i.id !== id));
  }

  function toggle(item: CompareItem) {
    if (items.some((i) => i.id === item.id)) remove(item.id);
    else add(item);
  }

  function has(id: string) {
    return items.some((i) => i.id === id);
  }

  return { items, add, remove, toggle, has };
}

/**
 * Floating bar that shows the user's selected properties and a "Compare"
 * button. Hidden on /compare itself, and when no items are selected.
 */
export function CompareBar() {
  const pathname = usePathname();
  // Re-render on localStorage changes
  const [items, setItems] = useState<CompareItem[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setItems(raw ? JSON.parse(raw) : []);
      } catch {}
      setVersion((v) => v + 1);
    };
    refresh();
    window.addEventListener("estateably:compare-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("estateably:compare-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (pathname === "/compare" || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Compare className="h-4 w-4 text-primary" />
          Compare ({items.length}/{MAX_ITEMS})
        </div>
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2"
            >
              <div className="h-6 w-6 overflow-hidden rounded-full bg-slate-200">
                {item.cover && (
                  <img src={item.cover} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="max-w-[140px] truncate text-xs text-slate-700">
                {item.title}
              </span>
              <button
                onClick={() => {
                  const next = items.filter((i) => i.id !== item.id);
                  setItems(next);
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                  } catch {}
                  window.dispatchEvent(new Event("estateably:compare-changed"));
                }}
                aria-label="Remove"
              >
                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          ))}
        </div>
        <Button asChild size="sm" disabled={items.length < 2}>
          <Link href={`/compare?ids=${items.map((i) => i.id).join(",")}`}>
            Compare now
          </Link>
        </Button>
      </div>
    </div>
  );
}
