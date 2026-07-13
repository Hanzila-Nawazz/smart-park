import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/user/complaints")({
  component: () => <DashboardLayout role="user"><UserComplaints /></DashboardLayout>,
});

function UserComplaints() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadComplaints = () => {
    if (!user) return;
    setLoading(true);
    userService.getComplaints(user.id)
      .then(data => setComplaints(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await userService.submitComplaint(user!.id, { subject, description });
      setMsg({ type: "success", text: "Complaint submitted successfully!" });
      setSubject("");
      setDescription("");
      loadComplaints();
    } catch (e: any) {
      setMsg({ type: "error", text: e.response?.data?.error || "Failed to submit complaint" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Complaints" description="Submit and track your complaints." />
      
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* NEW COMPLAINT FORM */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl shadow-soft p-6">
          <h3 className="font-semibold mb-4 text-lg">Submit Complaint</h3>
          
          {msg && (
            <div className={`p-3 mb-4 rounded-xl text-sm ${msg.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input 
                placeholder="Brief summary..." 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                disabled={submitting} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Provide detailed information..." 
                rows={5} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                disabled={submitting} 
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0">
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </div>

        {/* COMPLAINTS HISTORY */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">History</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No complaints found.</TableCell></TableRow>
                ) : (
                  complaints.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm whitespace-nowrap align-top pt-4">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="align-top pt-4">
                        <p className="font-medium">{c.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{c.description}</p>
                        
                        {c.adminResponse && (
                          <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                            <p className="text-xs font-semibold text-primary mb-1">Admin Response:</p>
                            <p className="text-sm">{c.adminResponse}</p>
                            
                            {c.status === "User Response Pending" && (
                              <div className="mt-3 flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="gradient-success text-white border-0 text-xs h-8"
                                  onClick={async () => {
                                    try {
                                      await userService.respondToComplaint(user!.id, c.id, true);
                                      loadComplaints();
                                    } catch(e) { console.error(e); }
                                  }}
                                >
                                  Satisfied
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white text-xs h-8"
                                  onClick={async () => {
                                    try {
                                      await userService.respondToComplaint(user!.id, c.id, false);
                                      loadComplaints();
                                    } catch(e) { console.error(e); }
                                  }}
                                >
                                  Not Satisfied
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <Badge className={
                          c.status === "Resolved" ? "bg-success text-success-foreground" :
                          c.status === "Pending" ? "bg-warning text-warning-foreground" :
                          c.status === "User Response Pending" ? "bg-primary text-primary-foreground" :
                          "bg-primary/20 text-primary"
                        }>
                          {c.status === "User Response Pending" ? "Awaiting Your Feedback" : c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
