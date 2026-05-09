import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, StatCard } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/lib/store";
import { parkingService } from "@/services/parkingService";

export const Route = createFileRoute("/user/history")({
  component: () => <DashboardLayout role="user"><History /></DashboardLayout>,
});

function History() {
  const [records, setRecords] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    parkingService.getHistory(user.id).then(setRecords);
  }, [user?.id]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return records.filter((r) => [r.plate, r.location, r.id].some((v) => (v ?? "").toString().toLowerCase().includes(ql)));
  }, [records, q]);

  const total = records.length;
  const paid = records.filter((r) => r.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const unpaid = records.filter((r) => r.status === "Unpaid").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Parking History" description="All your past parking sessions." />

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Sessions" value={total} icon={Receipt} />
        <StatCard label="Paid" value={paid} prefix="Rs " icon={CheckCircle2} variant="success" />
        <StatCard label="Pending" value={unpaid} prefix="Rs " icon={AlertCircle} variant="warning" />
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by plate, site..." className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Site</TableHead><TableHead>Slot</TableHead>
                <TableHead>Plate</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>{r.slot}</TableCell>
                  <TableCell className="font-medium">{r.plate}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>Rs {r.amount}</TableCell>
                  <TableCell>
                    <Badge className={r.status === "Paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
