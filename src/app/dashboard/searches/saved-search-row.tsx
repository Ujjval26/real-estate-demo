"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, BellOff, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SavedSearchRowProps {
  id: string;
  name: string;
  href: string;
  criteria: Record<string, unknown>;
  emailAlertsEnabled: boolean;
  createdAt: string;
}

export function SavedSearchRow({
  id, name, href, criteria, emailAlertsEnabled, createdAt,
}: SavedSearchRowProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(emailAlertsEnabled);
  const [pending, start] = useTransition();

  function toggleAlerts() {
    const next = !alerts;
    start(async () => {
      const res = await fetch("/api/saved-searches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, emailAlertsEnabled: next }),
      });
      if (!res.ok) {
        toast.error("Could not update alerts.");
        return;
      }
      setAlerts(next);
      toast.success(next ? "Email alerts on" : "Email alerts off");
    });
  }

  function remove() {
    start(async () => {
      const res = await fetch("/api/saved-searches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        toast.error("Could not delete search.");
        return;
      }
      toast.success("Removed");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
      <div className="min-w-0 flex-1">
        <Link href={href} className="block">
          <p className="truncate text-sm font-medium text-slate-900 hover:text-primary">
            {name}
          </p>
          <p className="text-xs text-slate-500">
            {criteria.listingType === "rent" ? "To rent" : "For sale"}
            {criteria.minPrice ? ` · £${criteria.minPrice}+` : ""}
            {criteria.maxPrice ? ` · up to £${criteria.maxPrice}` : ""}
            {criteria.minBedrooms ? ` · ${criteria.minBedrooms}+ beds` : ""}
            {criteria.propertyType ? ` · ${criteria.propertyType}` : ""}
          </p>
          <p className="text-[11px] text-slate-400">
            Saved {new Date(createdAt).toLocaleDateString("en-GB")}
          </p>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={alerts ? "default" : "outline"}
          size="sm"
          onClick={toggleAlerts}
          disabled={pending}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
            alerts ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          <span className="ml-1 hidden sm:inline">{alerts ? "Alerts on" : "Alerts off"}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={remove} disabled={pending} aria-label="Delete">
          <Trash2 className="h-4 w-4 text-rose-500" />
        </Button>
      </div>
    </div>
  );
}
