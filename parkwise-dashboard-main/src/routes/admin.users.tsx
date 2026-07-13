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
  head: () => ({
    meta: [
      { title: "Admin Page - Users" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><RegisteredUsers /></DashboardLayout>,
});

function RegisteredUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    adminService.getUsers()
      .then((d) => setUsers(d))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadUsers(); }, []);

  const handleSuspend = async (id: number) => {
    try {
      setLoading(true);
      await adminService.suspendUser(id);
      loadUsers();
    } catch(e) { console.error(e); setLoading(false); }
  };

  const handleRevoke = async (id: number) => {
    try {
      setLoading(true);
      await adminService.revokeSuspension(id);
      loadUsers();
    } catch(e) { console.error(e); setLoading(false); }
  };

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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="pl-9" disabled={loading} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>CNIC</TableHead>
              <TableHead>Vehicle</TableHead><TableHead>Plate</TableHead>
              <TableHead>Pending Dues</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-6 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-6 w-16 bg-muted rounded-full"></div></TableCell>
                    <TableCell><div className="h-8 w-16 bg-muted rounded-md ml-auto"></div></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No users found.</TableCell></TableRow>
              ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-xs">{u.cnic}</TableCell>
                  <TableCell>{u.vehicleType}</TableCell>
                  <TableCell>{u.plate}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${u.hasOldUnpaidBill ? 'text-destructive' : ''}`}>
                      Rs. {u.pendingDues || 0}
                    </span>
                    {u.hasOldUnpaidBill && <span className="ml-2 text-[10px] text-destructive border border-destructive px-1 rounded">Overdue</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={u.status === "Active" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.status === "Active" ? (
                      <button onClick={() => handleSuspend(u.id)} className="text-xs bg-destructive text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">Suspend</button>
                    ) : (
                      <button onClick={() => handleRevoke(u.id)} className="text-xs bg-success text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">Revoke</button>
                    )}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
