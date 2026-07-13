import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Car, Receipt, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, PageHeader, LoadingSpinner } from "@/components/Shared";
import { useAuthStore } from "@/lib/store";
import { userService } from "@/services/userService";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/user/dashboard")({
  component: () => <DashboardLayout role="user"><UserDashboard /></DashboardLayout>,
});

function UserDashboard() {
  // Only pulling the 'user' object from the store, NOT the dummy wallet balance!
  const { user } = useAuthStore(); 
  
  const [stats, setStats] = useState({
    walletBalance: 0,
    activeCount: 0,
    activeText: "No active session",
    totalSessions: 0,
    pendingBills: 0,
    isSuspended: false,
    chartData: null as any[] | null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    if (user?.id) {
      userService.getDashboardStats(user.id)
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((e) => {
          setError(e?.response?.data?.error || "Failed to load dashboard data");
          setLoading(false);
        });
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Hello, ${user?.name?.split(" ")[0] ?? "there"} 👋`} 
        description="Here's a snapshot of your parking activity." 
      />

      {!loading && stats.isSuspended && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg flex items-center justify-between shadow-soft">
          <div>
            <h3 className="font-bold text-destructive text-lg">Account Suspended</h3>
            <p className="text-destructive/80 text-sm">Your account has been suspended due to overdue bills. You cannot book new parking slots until your dues are cleared.</p>
          </div>
          <Wallet className="h-8 w-8 text-destructive opacity-50" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real dynamic stats from Java Database! */}
        <StatCard 
          label="Wallet Balance" 
          value={stats.walletBalance} 
          prefix="Rs " 
          icon={Wallet} 
          variant="primary" 
          trend="Available" 
        />
        <StatCard 
          label="Active Session" 
          value={stats.activeCount} 
          icon={Car} 
          variant={stats.activeCount > 0 ? "success" : "default"} 
          trend={stats.activeText} 
        />
        <StatCard label="Total Sessions" value={stats.totalSessions} icon={Clock} />
        <StatCard 
          label="Pending Bills" 
          value={stats.pendingBills} 
          icon={Receipt} 
          variant={stats.pendingBills > 0 ? "warning" : "default"} 
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Parking Activity</h3>
        <div className="h-72">
          {error && <div className="text-destructive p-3 rounded bg-destructive/10">Error loading activity: {error}</div>}
          {loading && !error && <LoadingSpinner />}
          {!loading && stats.chartData && (
          <ResponsiveContainer>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.17 245)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.62 0.17 245)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="occupancy" stroke="oklch(0.62 0.17 245)" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}