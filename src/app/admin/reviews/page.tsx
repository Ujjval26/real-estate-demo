"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  property: { title: string; slug: string };
  agent: { name: string };
  user: { name: string };
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Review | null>(null);

  function fetchReviews() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    fetch(`/api/admin/reviews?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else {
          setReviews(d.reviews);
          setTotalPages(d.pagination.totalPages);
        }
      })
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchReviews(); }, [page, statusFilter]);

  async function toggleApproval(id: string, approved: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error();
      toast.success(approved ? "Review approved" : "Review rejected");
      if (selected?.id === id) setSelected((s) => s ? { ...s, approved } : null);
      fetchReviews();
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Review deleted");
      if (selected?.id === id) setSelected(null);
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn("h-4 w-4", i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200")}
      />
    ));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500">Manage property reviews.</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Property</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Rating</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Reviewer</th>
                  <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Agent</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No reviews found.</td></tr>
                ) : (
                  reviews.map((rev) => (
                    <tr
                      key={rev.id}
                      onClick={() => setSelected(rev)}
                      className={cn("cursor-pointer hover:bg-slate-50", selected?.id === rev.id && "bg-blue-50")}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[180px]">{rev.property.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">{renderStars(rev.rating)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{rev.user.name}</td>
                      <td className="hidden px-4 py-3 text-slate-700 sm:table-cell">{rev.agent.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          rev.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                        )}>
                          {rev.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleApproval(rev.id, !rev.approved)}
                            className={cn(
                              "rounded p-1.5 transition-colors",
                              rev.approved
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50",
                            )}
                            title={rev.approved ? "Reject" : "Approve"}
                          >
                            {rev.approved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteReview(rev.id)}
                            className="rounded p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Review Details</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleApproval(selected.id, !selected.approved)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                      selected.approved
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                    )}
                  >
                    {selected.approved ? "Reject" : "Approve"}
                  </button>
                  <button
                    onClick={() => deleteReview(selected.id)}
                    className="rounded bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Property</p>
                  <p className="font-medium text-slate-900">{selected.property.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rating</p>
                  <div className="flex items-center gap-0.5 mt-0.5">{renderStars(selected.rating)}</div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reviewer</p>
                  <p className="text-slate-900">{selected.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Agent</p>
                  <p className="text-slate-900">{selected.agent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Comment</p>
                  <p className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-slate-700">
                    {selected.comment || "No comment provided."}
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Submitted {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
              Select a review to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
