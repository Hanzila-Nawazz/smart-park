import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/users")({
  component: () => <DashboardLayout role="admin"><RegisteredUsers /></DashboardLayout>,
});

function RegisteredUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { adminService.getUsers().then((d) => setUsers(d)).catch(() => setUsers([])); }, []);
  const filtered = users.filter((u) => 
    [u.name, u.cnic, u.plate].some((v: any) => {
      if (!v) return false;
      return String(v).toLowerCase().includes(q.toLowerCase());
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Registered Users" description="All users registered with SmartPark." />
      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>CNIC</TableHead>
              <TableHead>Contact</TableHead><TableHead>Vehicle</TableHead><TableHead>Plate</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-xs">{u.cnic}</TableCell>
                  <TableCell className="text-xs">{u.contact}</TableCell>
                  <TableCell>{u.vehicleType}</TableCell>
                  <TableCell>{u.plate}</TableCell>
                  <TableCell>
                    <Badge className={u.status === "Active" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>{u.status}</Badge>
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
