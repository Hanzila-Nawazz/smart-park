import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { reportService } from "@/services/reportService";
import { LoadingSpinner } from "@/components/Shared";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/revenue")({
  component: () => <DashboardLayout role="admin"><Revenue /></DashboardLayout>,
});

const COLORS = ["oklch(0.62 0.17 245)", "oklch(0.72 0.18 145)", "oklch(0.72 0.18 55)", "oklch(0.62 0.2 305)"];

function Revenue() {
  const [revenue, setRevenue] = useState<any | null>(null);
  const [occupancy, setOccupancy] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    reportService.getRevenue().then(setRevenue).catch((e) => setError(e?.message || String(e)));
    reportService.getOccupancy().then(setOccupancy).catch((e) => setError(e?.message || String(e)));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Revenue Reports" description="Revenue, occupancy and exports." action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => downloadFile(await reportService.downloadCsv(), "smartpark-report.csv")}><FileSpreadsheet className="h-4 w-4 mr-1" /> CSV</Button>
          <Button variant="outline" onClick={async () => downloadFile(await reportService.downloadPdf(), "smartpark-report.pdf")}><Download className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      } />

      {error && <div className="text-destructive p-4 rounded bg-destructive/10">Error loading revenue: {error}</div>}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Daily Revenue">
          <div className="h-72">
            {!revenue && !error ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenue?.byDay || revenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                  <Bar dataKey="revenue" fill="oklch(0.62 0.17 245)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Site-wise Revenue">
          <div className="h-72">
            {!revenue && !error ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={revenue?.bySite || revenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {(revenue?.bySite || revenue || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Peak Times">
          <div className="h-72">
            {!occupancy && !error ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={occupancy || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="oklch(0.72 0.18 55)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Monthly Trend">
          <div className="h-72">
            {!revenue && !error ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenue?.byMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="oklch(0.72 0.18 145)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: any) {
  return <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
    <h3 className="font-semibold mb-4">{title}</h3>{children}
  </div>;
}
