import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, LoadingSpinner } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({
    meta: [
      { title: "Admin Page - Requests" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><AdminRequests /></DashboardLayout>,
});

function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getVehicleRequests();
      setRequests(data || []);
    } catch (e) {
      toast.error("Failed to load vehicle change requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await adminService.approveVehicleRequest(id);
      toast.success(res?.message || "Request approved.");
      fetchRequests();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to approve request.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await adminService.rejectVehicleRequest(id);
      toast.success(res?.message || "Request rejected.");
      fetchRequests();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to reject request.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vehicle Change Requests" 
        description="Review and approve user requests to change their registered vehicle details." 
      />

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No vehicle change requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Current Vehicle</th>
                  <th className="px-6 py-4">Requested Vehicle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{r.userName} (ID: {r.userId})</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {r.oldPlate} · {r.oldType}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {r.newPlate} · {r.newType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        r.status === "PENDING" ? "bg-warning/15 text-warning" :
                        r.status === "APPROVED" ? "bg-success/15 text-success" :
                        "bg-destructive/15 text-destructive"
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleReject(r.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => handleApprove(r.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
