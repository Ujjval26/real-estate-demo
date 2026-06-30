"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalInquiries: number;
  pendingApprovals: number;
  recentProperties: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    createdAt: string;
  }>;
  recentInquiries: Array<{
    id: string;
    name: string;
    email: string;
    subject: string | null;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else setData(d);
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Properties", value: data.totalProperties, icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Total Inquiries", value: data.totalInquiries, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Pending Approvals", value: data.pendingApprovals, icon: Clock, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your platform.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("h-5 w-5", s.color)} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Properties */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Properties</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/properties">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentProperties.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No properties yet.</p>
            ) : (
              data.recentProperties.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      £{p.price.toLocaleString()} &middot; {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    "ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                    p.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "pending" ? "bg-amber-100 text-amber-700" :
                    p.status === "draft" ? "bg-slate-100 text-slate-600" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Inquiries</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/inquiries">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentInquiries.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No inquiries yet.</p>
            ) : (
              data.recentInquiries.slice(0, 5).map((inq) => (
                <div key={inq.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{inq.name}</p>
                    <p className="text-xs text-slate-500">
                      {inq.subject || "General"} &middot; {new Date(inq.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    "ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                    inq.status === "new" ? "bg-blue-100 text-blue-700" :
                    inq.status === "read" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {inq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
