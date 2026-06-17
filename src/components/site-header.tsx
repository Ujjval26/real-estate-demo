"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LogIn, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Lightweight navbar shown on auth pages (login / signup).
 * The full navbar (with search) lives in `src/components/site-header.tsx`
 * and is used across the main app.
 */
export function AuthHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Estateably
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              <LogIn className="mr-1 h-4 w-4" /> Log in
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">
              <UserPlus className="mr-1 h-4 w-4" /> Sign up
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

const NAV_LINKS = [
  { href: "/search?listingType=sale", label: "Buy" },
  { href: "/search?listingType=rent", label: "Rent" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faqs", label: "FAQs" },
];

/**
 * Main site navbar with brand, links, and auth-aware user menu.
 * Renders a sticky header that collapses into a slide-out sheet on mobile.
 */
export function SiteHeader({ user }: { user: { name: string; role: string } | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">
            Estateably
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium text-slate-700 hover:text-primary",
                pathname === link.href.split("?")[0] && "text-primary",
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Right side: auth actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <Heart className="mr-1 h-4 w-4" /> Saved
                </Link>
              </Button>
              {(user.role === "agent" || user.role === "admin") && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/agent">Agent dashboard</Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href="/dashboard">{user.name.split(" ")[0]}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
