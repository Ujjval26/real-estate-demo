"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

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

interface StatsResponse {
  counts: {
    totalUsers: number;
    totalAgents: number;
    totalBuyers: number;
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    letProperties: number;
    draftProperties: number;
    pendingProperties: number;
    totalFavourites: number;
    totalMessages: number;
    totalViewingRequests: number;
    totalReviews: number;
    pendingViewingRequests: number;
  };
  aggregate: {
    totalViews: number;
    totalEnquiries: number;
  };
  topProperties: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    enquiryCount: number;
    city: string;
    status: string;
    agent: { name: string };
  }>;
  newUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  topCities: Array<{ city: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  draft: "#64748b",
  sold: "#ef4444",
  let: "#3b82f6",
  pending: "#f59e0b",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ])
      .then(([dashboard, stats]) => {
        if (dashboard.error) router.push("/admin/login");
        else {
          setData(dashboard);
          setStatsData(stats);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const enquiriesData = useMemo(
    () =>
      months.map((month) => ({
        month,
        enquiries: Math.floor(Math.random() * 30) + 5,
        properties: Math.floor(Math.random() * 15) + 3,
      })),
    []
  );

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

  const counts = statsData?.counts;
  const pieData = counts
    ? [
        { name: "active", value: counts.activeProperties, color: STATUS_COLORS.active },
        { name: "draft", value: counts.draftProperties, color: STATUS_COLORS.draft },
        { name: "sold", value: counts.soldProperties, color: STATUS_COLORS.sold },
        { name: "let", value: counts.letProperties, color: STATUS_COLORS.let },
        { name: "pending", value: counts.pendingProperties, color: STATUS_COLORS.pending },
      ].filter((d) => d.value > 0)
    : [];

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  const cityData = statsData?.topCities ?? [];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const { name, value, payload: original } = payload[0];
      const pct = totalPie > 0 ? ((value / totalPie) * 100).toFixed(1) : "0";
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm text-sm">
          <p className="font-medium capitalize">{name}</p>
          <p className="text-xs text-slate-500">
            {value} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

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

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Property Status Distribution - Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Property Status Distribution</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No property data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-sm capitalize text-slate-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Enquiries - Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Monthly Enquiries</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enquiriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  fontSize: "13px",
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-sm text-slate-700">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="enquiries"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="properties"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4, fill: "#22c55e" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Properties by City - Horizontal Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Properties by City</h2>
          {cityData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No city data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData} layout="vertical" margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} stroke="#94a3b8" width={120} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
