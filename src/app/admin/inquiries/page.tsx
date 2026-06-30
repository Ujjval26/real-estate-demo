"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  function fetchInquiries() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    fetch(`/api/admin/inquiries?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else {
          setInquiries(d.inquiries);
          setTotalPages(d.pagination.totalPages);
        }
      })
      .catch(() => toast.error("Failed to load inquiries"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchInquiries(); }, [page, statusFilter]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Marked as ${status}`);
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
      fetchInquiries();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Inquiry deleted");
      if (selected?.id === id) setSelected(null);
      fetchInquiries();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <p className="text-sm text-slate-500">Contact form submissions from the public site.</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Subject</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>
                ) : inquiries.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">No inquiries found.</td></tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setSelected(inq)}
                      className={cn("cursor-pointer hover:bg-slate-50", selected?.id === inq.id && "bg-blue-50")}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{inq.name}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{inq.subject || "General"}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          inq.status === "new" ? "bg-blue-100 text-blue-700" :
                          inq.status === "read" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(inq.createdAt).toLocaleDateString()}</td>
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
                <h3 className="text-sm font-semibold text-slate-900">Inquiry Details</h3>
                <div className="flex gap-1">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your inquiry"}`}
                    className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Reply
                  </a>
                  {selected.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus(selected.id, "resolved")}
                      className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      Resolve
                    </button>
                  )}
                  {selected.status === "new" && (
                    <button
                      onClick={() => updateStatus(selected.id, "read")}
                      className="rounded bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-200"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteInquiry(selected.id)}
                    className="rounded bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">From</p>
                  <p className="font-medium text-slate-900">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-slate-900">{selected.phone}</p>
                  </div>
                )}
                {selected.subject && (
                  <div>
                    <p className="text-xs text-slate-500">Subject</p>
                    <p className="text-slate-900">{selected.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Message</p>
                  <p className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-slate-700">{selected.message}</p>
                </div>
                <p className="text-xs text-slate-400">
                  Received {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
              Select an inquiry to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
