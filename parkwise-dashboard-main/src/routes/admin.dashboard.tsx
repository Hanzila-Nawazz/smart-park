import { ProtectedRoute } from '../components/ProtectedRoute';
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Activity, Users, Car, DollarSign, TrendingUp, Wallet, MessageSquareWarning } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard, PageHeader } from "../components/Shared";
import { adminService } from "../services/adminService";
import { reportService } from "../services/reportService";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => <DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>,
});

// --- NEW SKELETON COMPONENTS ---
function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-card bg-card border border-border animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded w-3/4 mt-2"></div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-muted"></div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end gap-2 animate-pulse pb-6">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex-1 bg-muted rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
      ))}
    </div>
  );
}

// --- CACHE VARIABLES ---
let cachedOverviewStats: any = null;
let cachedOverviewRevenue: any = null;
let cachedOverviewOccupancy: any = null;

function AdminDashboard() {
  const [stats, setStats] = useState<any>(cachedOverviewStats);
  const [revenue, setRevenue] = useState<any | null>(cachedOverviewRevenue);
  const [occupancy, setOccupancy] = useState<any[] | null>(cachedOverviewOccupancy);
  const [statError, setStatError] = useState<string | null>(null);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [occupancyError, setOccupancyError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedOverviewStats) return;

    // Set a timeout warning only if stats haven't loaded in 20s
    const statsTimeout = setTimeout(() => {
      if (!stats) setStatError("Stats taking longer than expected. Still loading...");
    }, 20000);

    // Fetch stats
    adminService.getOverview()
      .then((data) => {
        cachedOverviewStats = data;
        setStats(data);
      })
      .catch((e) => {
        setStatError(e?.message || "Failed to load stats");
      });

    return () => {
      clearTimeout(statsTimeout);
    };
  }, []);
  
  useEffect(() => {
    // Set timeout warnings only if data hasn't loaded in 20s
    const revenueTimeout = setTimeout(() => {
      if (!revenue && !cachedOverviewRevenue) setRevenueError("Revenue taking longer than expected...");
    }, 20000);

    const occupancyTimeout = setTimeout(() => {
      if (!occupancy && !cachedOverviewOccupancy) setOccupancyError("Occupancy taking longer than expected...");
    }, 20000);

    if (!cachedOverviewRevenue) {
      // Load revenue
      reportService.getRevenue()
        .then((data) => {
          cachedOverviewRevenue = data;
          setRevenue(data);
          setRevenueError(null); // Clear error when data arrives
        })
        .catch((e) => {
          setRevenueError("Revenue data failed to load");
        });
    }

    if (!cachedOverviewOccupancy) {
      // Load occupancy
      reportService.getOccupancy()
        .then((data) => {
          cachedOverviewOccupancy = data;
          setOccupancy(data);
          setOccupancyError(null); // Clear error when data arrives
        })
        .catch((e) => {
          setOccupancyError("Occupancy data failed to load");
        });
    }

    return () => {
      clearTimeout(revenueTimeout);
      clearTimeout(occupancyTimeout);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHeader title="Admin Overview" description="Real-time snapshot of your parking network." />

        {/* STAT CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!stats ? (
            // Render 6 Skeletons while waiting for stats
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            // Render actual data when it arrives
            <>
              <StatCard label="Total Sites" value={stats?.totalSites ?? 0} icon={Building2} />
              <StatCard label="Active Sites" value={stats?.activeSites ?? 0} icon={Activity} variant="success" />
              <StatCard label="Users" value={stats?.registeredUsers ?? 0} icon={Users} />
              <StatCard label="Active Sessions" value={stats?.activeSessions ?? 0} icon={Car} variant="warning" />
              <StatCard label="Total Revenue" value={stats?.totalRevenue ?? 0} prefix="Rs " icon={DollarSign} variant="primary" />
              <StatCard label="Today" value={stats?.todayRevenue ?? 0} prefix="Rs " icon={TrendingUp} />
              <StatCard label="Pending Dues" value={stats?.totalPendingAmount ?? 0} prefix="Rs " icon={Wallet} variant="destructive" />
              <StatCard label="Pending Requests" value={stats?.pendingComplaintsCount ?? 0} icon={MessageSquareWarning} variant="warning" />
            </>
          )}
        </div>

        {/* Show error only if stats actually failed, not just if still loading */}
        {statError && !stats && statError.includes("Failed") && (
          <div className="text-destructive p-4 rounded bg-destructive/10 border border-destructive/20">
            {statError}
          </div>
        )}
        
        {/* CHARTS SECTION */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-4">Weekly Revenue</h3>
            <div className="h-72">
              {!revenue ? <ChartSkeleton /> : (
                <ResponsiveContainer>
                  <BarChart data={revenue.byDay || revenue}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                    <Bar dataKey="revenue" fill="oklch(0.62 0.17 245)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {revenueError && !revenue && (
              <p className="text-sm text-amber-600 mt-2">{revenueError}</p>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-4">Hourly Occupancy</h3>
            <div className="h-72">
              {!occupancy ? <ChartSkeleton /> : (
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
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                    <Area type="monotone" dataKey="occupancy" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} fill="url(#g2)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {occupancyError && !occupancy && (
              <p className="text-sm text-amber-600 mt-2">{occupancyError}</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}