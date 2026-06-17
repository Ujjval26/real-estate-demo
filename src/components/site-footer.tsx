"use client";

import Link from "next/link";
import { Home } from "lucide-react";

/**
 * Site-wide footer with link columns. Sticks to the bottom of the viewport
 * thanks to the `mt-auto` class on a `min-h-screen flex flex-col` wrapper.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Estateably
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-600">
              The clean, modern UK property portal. Buy, rent or list — built
              for buyers, renters, sellers, landlords and agents.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Browse
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/search?listingType=sale" className="text-slate-700 hover:text-primary">Property for sale</Link></li>
              <li><Link href="/search?listingType=rent" className="text-slate-700 hover:text-primary">Property to rent</Link></li>
              <li><Link href="/agent" className="text-slate-700 hover:text-primary">List a property</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-700 hover:text-primary">About us</Link></li>
              <li><Link href="/contact" className="text-slate-700 hover:text-primary">Contact</Link></li>
              <li><Link href="/faqs" className="text-slate-700 hover:text-primary">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/terms" className="text-slate-700 hover:text-primary">Terms &amp; conditions</Link></li>
              <li><Link href="/privacy" className="text-slate-700 hover:text-primary">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Estateably. All prices in GBP (£).
            This is a demo project — not a real estate service.
          </p>
        </div>
      </div>
    </footer>
  );
}
