import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, LoadingSpinner } from "@/components/Shared";
import { reportService } from "@/services/reportService";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Admin Page - Analytics" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><Analytics /></DashboardLayout>,
});

const radialColors = [
  "oklch(0.62 0.17 245)",
  "oklch(0.72 0.18 145)",
  "oklch(0.72 0.18 55)",
  "oklch(0.62 0.2 305)",
];

const analyticsCache = {
  data: null as any[] | null,
  siteUtilization: null as any[] | null,
  isDataLoaded: false,
  isSiteUtilizationLoaded: false,
};

function Analytics() {
  const [data, setData] = useState<any[] | null>(analyticsCache.isDataLoaded ? analyticsCache.data : null);
  const [siteUtilization, setSiteUtilization] = useState<any[] | null>(analyticsCache.isSiteUtilizationLoaded ? analyticsCache.siteUtilization : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analyticsCache.isDataLoaded) {
      reportService.getOccupancy()
        .then((d) => {
          analyticsCache.data = d;
          analyticsCache.isDataLoaded = true;
          setData(d);
        })
        .catch((e) => setError(e?.message || String(e)));
    }

    if (!analyticsCache.isSiteUtilizationLoaded) {
      reportService.getSiteUtilization()
        .then((d) => {
          analyticsCache.siteUtilization = d;
          analyticsCache.isSiteUtilizationLoaded = true;
          setSiteUtilization(d);
        })
        .catch((e) => setError(e?.message || String(e)));
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep insights into parking activity." />
      {error && <div className="text-destructive p-4 rounded bg-destructive/10">Error loading analytics: {error}</div>}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Site Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="20%" outerRadius="100%" data={(siteUtilization || []).map((item, index) => ({
              ...item,
              fill: radialColors[index % radialColors.length],
            }))} startAngle={180} endAngle={0}>
              <RadialBar background dataKey="uv" cornerRadius={10} />
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Activity Graph</h3>
          <div className="h-[300px]">
            {!data && !error && <LoadingSpinner />}
            {data && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.17 245)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.62 0.17 245)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                  <Area type="monotone" dataKey="occupancy" stroke="oklch(0.62 0.17 245)" strokeWidth={2.5} fill="url(#g3)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
