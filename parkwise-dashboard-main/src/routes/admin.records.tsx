import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parkingService } from "@/services/parkingService";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/records")({
  component: () => <DashboardLayout role="admin"><Records /></DashboardLayout>,
});

function Records() {
  const [q, setQ] = useState("");
  const [site, setSite] = useState("all");
  const [status, setStatus] = useState("all");
  const [history, setHistory] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    adminService.getRecords().then((d) => setHistory(d)).catch(() => setHistory([]));
    adminService.getSites().then((s) => setSites(s)).catch(() => setSites([]));
  }, []);

  const filtered = useMemo(() => history.filter((r) =>
    (q === "" || (r.plate && r.plate.toLowerCase().includes(q.toLowerCase()))) &&
    (site === "all" || (r.siteId && r.siteId === site)) &&
    (status === "all" || r.status === status)
  ), [history, q, site, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Parking Records" description="Search and filter every parking session." />

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border grid sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plate..." className="pl-9" />
          </div>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger><SelectValue placeholder="Site" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              {sites.map((s) => <SelectItem key={s.siteId} value={s.siteId}>{s.siteLocation}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Site</TableHead><TableHead>Slot</TableHead>
              <TableHead>Plate</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead>
              <TableHead>Bill</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>{r.slot}</TableCell>
                  <TableCell className="font-medium">{r.plate}</TableCell>
                  <TableCell className="text-xs">{r.checkIn}</TableCell>
                  <TableCell className="text-xs">{r.checkOut}</TableCell>
                  <TableCell>Rs {r.amount}</TableCell>
                  <TableCell>
                    <Badge className={r.status === "Paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{r.status}</Badge>
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
