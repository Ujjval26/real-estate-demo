"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search as SearchIcon, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  postcode: string;
  region: string;
  type: string;
}

export default function AdminLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function fetchLocations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/admin/locations?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else setLocations(d.locations);
      })
      .catch(() => toast.error("Failed to load locations"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchLocations(); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchLocations();
  }

  async function deleteLocation(id: string, name: string) {
    if (!confirm(`Delete location "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Location deleted");
      fetchLocations();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          <p className="text-sm text-slate-500">Manage cities and areas for autocomplete.</p>
        </div>
        <Button asChild>
          <Link href="/admin/locations/new">
            <Plus className="mr-1 h-4 w-4" /> Add Location
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search locations…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600">Postcode</th>
              <th className="px-4 py-3 font-medium text-slate-600">Region</th>
              <th className="px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No locations found.</td></tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{loc.name}</td>
                  <td className="px-4 py-3 text-slate-600">{loc.postcode}</td>
                  <td className="px-4 py-3 text-slate-600">{loc.region}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                      {loc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/locations/${loc.id}`}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Link>
                      </Button>
                      <button onClick={() => deleteLocation(loc.id, loc.name)} className="rounded-md p-1.5 text-slate-400 hover:text-red-600">
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
    </div>
  );
}
