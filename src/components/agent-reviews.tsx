"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

interface AgentReviewsProps {
  agentId: string;
  loggedIn: boolean;
}

export function AgentReviews({ agentId, loggedIn }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?agentId=${agentId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      toast.error("Please log in to leave a review.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit review.");
        return;
      }
      toast.success("Review submitted");
      setComment("");
      // Refetch
      const fresh = await fetch(`/api/reviews?agentId=${agentId}`).then((r) => r.json());
      setReviews(fresh.reviews || []);
      setAvgRating(fresh.avgRating || 0);
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Agent reviews</span>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">{avgRating.toFixed(1)}</span>
              <span className="text-slate-500">({reviews.length})</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reviews yet. Be the first to review this agent.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{r.user.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300",
                        )}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="mt-1 text-xs text-slate-600">{r.comment}</p>}
                <p className="mt-1 text-[11px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Submit form */}
        {loggedIn && (
          <form onSubmit={submit} className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <Label className="text-xs">Your rating</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="comment" className="text-xs">Comment <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this agent…"
              />
            </div>
            <Button type="submit" disabled={submitting} size="sm">
              {submitting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
              Submit review
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
