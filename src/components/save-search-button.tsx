"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Floating "Save this search" button. Reads the current URL's query string
 * to extract search criteria, then POSTs to /api/saved-searches.
 */
export function SaveSearchButton() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [alerts, setAlerts] = useState(true);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const criteria: Record<string, unknown> = {};
      for (const [k, v] of params.entries()) {
        criteria[k] = v;
      }
      // Don't persist UI-only params
      delete criteria.view;
      delete criteria.page;
      delete criteria.pageSize;
      delete criteria.sort;

      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, searchCriteria: criteria, emailAlertsEnabled: alerts }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not save search.");
        return;
      }
      toast.success("Search saved");
      setOpen(false);
      setName("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="mr-1 h-3.5 w-3.5" /> Save search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this search</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="search-name">Name <span className="text-slate-400">(optional)</span></Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2-bed flats in Manchester"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={alerts} onCheckedChange={(v) => setAlerts(v === true)} />
            Email me when new properties match
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Save search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
