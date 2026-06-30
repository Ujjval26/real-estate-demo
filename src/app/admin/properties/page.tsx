"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search as SearchIcon, Loader2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  price: number;
  listingType: string;
  status: string;
  city: string;
  createdAt: string;
  thumbnail: string | null;
  agent: { id: string; name: string } | null;
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function fetchProperties() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    fetch(`/api/admin/properties?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else {
          setProperties(d.properties);
          setTotalPages(d.pagination.totalPages);
        }
      })
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProperties(); }, [page, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  }

  async function deleteProperty(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Property deleted");
      fetchProperties();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    draft: "bg-slate-100 text-slate-600",
    pending: "bg-amber-100 text-amber-700",
    sold: "bg-rose-100 text-rose-700",
    let: "bg-blue-100 text-blue-700",
    withdrawn: "bg-slate-200 text-slate-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500">Manage all property listings.</p>
        </div>
        <Button asChild>
          <Link href="/admin/properties/new">
            <Plus className="mr-1 h-4 w-4" /> Add Property
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/admin/properties/export">
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, city, postcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
          <option value="let">Let</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Property</th>
              <th className="px-4 py-3 font-medium text-slate-600">Price</th>
              <th className="px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Agent</th>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  No properties found.
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt="" className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">No img</div>
                      )}
                      <div className="min-w-0">
                        <Link href={`/admin/properties/${p.id}`} className="font-medium text-slate-900 hover:text-primary truncate block max-w-[200px]">
                          {p.title}
                        </Link>
                        <p className="text-xs text-slate-500">{p.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">£{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{p.listingType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusStyles[p.status] || "bg-slate-100 text-slate-600")}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.agent?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/properties/${p.id}`}>Edit</Link>
                      </Button>
                      <button
                        onClick={() => deleteProperty(p.id, p.title)}
                        className="rounded-md p-1.5 text-slate-400 hover:text-red-600"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
