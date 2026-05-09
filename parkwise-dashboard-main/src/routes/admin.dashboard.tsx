import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Activity, Users, Car, DollarSign, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, PageHeader, LoadingSpinner } from "@/components/Shared";
import { adminService } from "@/services/adminService";
import { reportService } from "@/services/reportService";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => <DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>,
});

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any | null>(null);
  const [occupancy, setOccupancy] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { adminService.getOverview().then(setStats).catch((e) => setError(e?.message || String(e))); }, []);
  useEffect(() => { reportService.getRevenue().then(setRevenue).catch((e) => setError(e?.message || String(e))); reportService.getOccupancy().then(setOccupancy).catch((e) => setError(e?.message || String(e))); }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Real-time snapshot of your parking network." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Sites" value={stats?.totalSites ?? 0} icon={Building2} />
        <StatCard label="Active Sites" value={stats?.activeSites ?? 0} icon={Activity} variant="success" />
        <StatCard label="Users" value={stats?.registeredUsers ?? 0} icon={Users} />
        <StatCard label="Active Sessions" value={stats?.activeSessions ?? 0} icon={Car} variant="warning" />
        <StatCard label="Total Revenue" value={stats?.totalRevenue ?? 0} prefix="Rs " icon={DollarSign} variant="primary" />
        <StatCard label="Today" value={stats?.todayRevenue ?? 0} prefix="Rs " icon={TrendingUp} />
      </div>

      {error && <div className="text-destructive p-4 rounded bg-destructive/10">Error loading dashboard: {error}</div>}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Weekly Revenue</h3>
          <div className="h-72">
            {!revenue ? <LoadingSpinner /> : (
              <ResponsiveContainer>
                <BarChart data={revenue.byDay || revenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="revenue" fill="oklch(0.62 0.17 245)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Hourly Occupancy</h3>
          <div className="h-72">
            {!occupancy ? <LoadingSpinner /> : (
              <ResponsiveContainer>
                <AreaChart data={occupancy}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={12} /><YAxis fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Area type="monotone" dataKey="occupancy" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
