import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/complaints")({
  component: () => <DashboardLayout role="admin"><AdminComplaints /></DashboardLayout>,
});

function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [adminMessage, setAdminMessage] = useState("");

  const loadComplaints = () => {
    setLoading(true);
    adminService.getComplaints()
      .then(data => setComplaints(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const updateStatus = async (id: number, status: string, message?: string) => {
    try {
      await adminService.resolveComplaint(id, status, message);
      loadComplaints();
    } catch (e) {
      console.error(e);
    }
  };

  const openResolveDialog = (id: number) => {
    setSelectedComplaintId(id);
    setAdminMessage("");
    setResolveDialogOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (selectedComplaintId && adminMessage.trim()) {
      await updateStatus(selectedComplaintId, "User Response Pending", adminMessage);
      setResolveDialogOpen(false);
      setSelectedComplaintId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Complaints" description="Manage and resolve complaints submitted by regular users." />
      
      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User / Plate</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="min-w-[300px]">Description & Response</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Loading complaints...</TableCell></TableRow>
              ) : complaints.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No complaints found.</TableCell></TableRow>
              ) : (
                complaints.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.userName || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{c.userPlate}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{c.subject}</TableCell>
                    <TableCell>
                      <div className="text-sm whitespace-pre-wrap">{c.description}</div>
                      {c.adminResponse && (
                        <div className="mt-2 text-xs bg-muted p-2 rounded border border-border">
                          <span className="font-bold">Your Response:</span> {c.adminResponse}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={
                        c.status === "Resolved" ? "bg-success text-success-foreground" :
                        c.status === "Pending" ? "bg-warning text-warning-foreground" :
                        c.status === "User Response Pending" ? "bg-primary text-primary-foreground" :
                        "bg-primary/20 text-primary"
                      }>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status !== "Resolved" && c.status !== "User Response Pending" && (
                        <div className="flex justify-end items-center gap-2">
                          {c.status === "Submitted" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "Pending")}>
                              Mark as Noted
                            </Button>
                          )}
                          <Button size="sm" className="gradient-success text-white border-0" onClick={() => openResolveDialog(c.id)}>
                            Resolve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Resolution Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Type your message to the user here..."
              rows={4}
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to the user. The complaint status will change to "User Response Pending" until they confirm if they are satisfied.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResolveSubmit} disabled={!adminMessage.trim()} className="gradient-primary text-white border-0">
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
