"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Viewing {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string | null;
  preferredDate: string;
  preferredTime: string | null;
  notes: string | null;
  status: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  feedback: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    city: string;
  };
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-slate-100 text-slate-700",
};

export default function AdminViewingsPage() {
  const router = useRouter();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Viewing | null>(null);

  function fetchViewings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    fetch(`/api/admin/viewings?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else {
          setViewings(d.viewings);
          setTotalPages(d.pagination.totalPages);
        }
      })
      .catch(() => toast.error("Failed to load viewings"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchViewings(); }, [page, statusFilter]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/viewings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Marked as ${status.replace("_", " ")}`);
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
      fetchViewings();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function saveFeedback(id: string, feedback: string) {
    try {
      const res = await fetch(`/api/admin/viewings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error();
      toast.success("Feedback saved");
      if (selected?.id === id) setSelected((s) => s ? { ...s, feedback } : null);
      fetchViewings();
    } catch {
      toast.error("Failed to save feedback");
    }
  }

  async function deleteViewing(id: string) {
    if (!confirm("Delete this viewing request permanently?")) return;
    try {
      const res = await fetch(`/api/admin/viewings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Viewing deleted");
      if (selected?.id === id) setSelected(null);
      fetchViewings();
    } catch {
      toast.error("Failed to delete");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(time: string | null) {
    if (!time) return "—";
    return time;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Viewings</h1>
        <p className="text-sm text-slate-500">Manage property viewing requests.</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
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
                  <th className="px-4 py-3 font-medium text-slate-600">Requester</th>
                  <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="hidden px-4 py-3 font-medium text-slate-600 md:table-cell">Time</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />
                    </td>
                  </tr>
                ) : viewings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No viewings found.
                    </td>
                  </tr>
                ) : (
                  viewings.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelected(v)}
                      className={cn(
                        "cursor-pointer hover:bg-slate-50",
                        selected?.id === v.id && "bg-blue-50",
                      )}
                    >
                      <td className="max-w-[180px] truncate px-4 py-3 font-medium text-slate-900">
                        {v.property.title}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{v.name}</td>
                      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{v.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(v.preferredDate)}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                        {formatTime(v.preferredTime)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                            STATUS_STYLES[v.status] || "bg-slate-100 text-slate-700",
                          )}
                        >
                          {v.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Viewing Details
                </h3>
                <button
                  onClick={() => deleteViewing(selected.id)}
                  className="rounded bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-200"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Property</p>
                  <p className="font-medium text-slate-900">
                    {selected.property.title}
                  </p>
                  <p className="text-xs text-slate-500">{selected.property.city}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Requester</p>
                  <p className="font-medium text-slate-900">{selected.name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-primary hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>

                {selected.phone && (
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-slate-900">{selected.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500">Preferred Date</p>
                  <p className="text-slate-900">
                    {formatDate(selected.preferredDate)}
                  </p>
                </div>

                {selected.preferredTime && (
                  <div>
                    <p className="text-xs text-slate-500">Preferred Time</p>
                    <p className="text-slate-900">{selected.preferredTime}</p>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-slate-700">
                      {selected.notes}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                      STATUS_STYLES[selected.status] || "bg-slate-100 text-slate-700",
                    )}
                  >
                    {selected.status.replace("_", " ")}
                  </span>
                  {selected.confirmedBy && (
                    <p className="mt-1 text-xs text-slate-400">
                      Confirmed by {selected.confirmedBy}
                      {selected.confirmedAt &&
                        ` on ${formatDate(selected.confirmedAt)}`}
                    </p>
                  )}
                </div>

                {selected.status !== "cancelled" && (
                  <div>
                    <p className="text-xs text-slate-500">Feedback</p>
                    <textarea
                      defaultValue={selected.feedback || ""}
                      onBlur={(e) => {
                        if (e.target.value !== (selected.feedback || "")) {
                          saveFeedback(selected.id, e.target.value);
                        }
                      }}
                      placeholder="Add feedback..."
                      className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm text-slate-700 placeholder:text-slate-400"
                      rows={3}
                    />
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Requested {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {selected.status !== "confirmed" && selected.status !== "cancelled" && (
                  <button
                    onClick={() => updateStatus(selected.id, "confirmed")}
                    className="rounded bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
                  >
                    Confirm
                  </button>
                )}
                {selected.status !== "completed" && selected.status !== "cancelled" && (
                  <button
                    onClick={() => updateStatus(selected.id, "completed")}
                    className="rounded bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                  >
                    Complete
                  </button>
                )}
                {selected.status !== "cancelled" && selected.status !== "completed" && (
                  <button
                    onClick={() => updateStatus(selected.id, "cancelled")}
                    className="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
              Select a viewing to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
