import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, EmptyState } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/search")({
  component: () => <DashboardLayout role="admin"><VehicleSearch /></DashboardLayout>,
});

function VehicleSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const search = async () => {
    if (!q.trim()) return;
    try {
      const data = await adminService.searchVehicleHistory(q);
      setResults(data || []);
    } catch (e) {
      setResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Search" description="Find any vehicle's parking history." />
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="LEA-1023" className="pl-9" />
        </div>
        <Button onClick={search} className="gradient-primary text-white border-0">Search</Button>
      </div>

      {results && results.length === 0 && (
        <EmptyState icon={Search} title="No results" description="Try a different plate number." />
      )}
      {results && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex justify-between items-center shadow-soft">
              <div>
                <p className="font-semibold">{r.plate} · {r.location}</p>
                <p className="text-xs text-muted-foreground">Slot {r.slot} · {r.date || r.checkIn} · Rs {r.amount}</p>
              </div>
              <Badge className={r.status === "Paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{r.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
