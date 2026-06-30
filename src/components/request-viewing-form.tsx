"use client";

import { useState } from "react";
import { Calendar, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface RequestViewingFormProps {
  propertyId: string;
  loggedIn: boolean;
}

export function RequestViewingForm({ propertyId, loggedIn }: RequestViewingFormProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      toast.error("Please log in to request a viewing.");
      return;
    }
    if (!date) {
      toast.error("Please choose a preferred date.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/viewing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          preferredDate: new Date(date).toISOString(),
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit request.");
        return;
      }
      toast.success("Viewing request sent. The agent will be in touch.");
      setDate("");
      setNotes("");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return (
      <div className="mt-3 space-y-3">
        <p className="text-sm text-slate-600">Log in to request a viewing.</p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  const today = new Date();
  const min = today.toISOString().split("T")[0];

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <div className="space-y-1">
        <Label htmlFor="date" className="text-xs">Preferred date</Label>
        <Input
          id="date"
          type="date"
          min={min}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes" className="text-xs">Notes <span className="text-slate-400">(optional)</span></Label>
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any preferred times, questions, or context…"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
        Request viewing
      </Button>
    </form>
  );
}
