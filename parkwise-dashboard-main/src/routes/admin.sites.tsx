import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminService } from "@/services/adminService";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/sites")({
  head: () => ({
    meta: [
      { title: "Admin Page - Sites" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><ManageSites /></DashboardLayout>,
});

function ManageSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ id: "", name: "", location: "", totalSlots: 30, hourlyRate: 50, status: "Active" });

  useEffect(() => { 
    setLoading(true);
    adminService.getSites().then((d) => {
      const mapped = (d || []).map((s: any) => ({
        id: s.siteId,
        name: s.siteLocation,
        location: s.siteLocation,
        totalSlots: s.maxSiteCapacity,
        hourlyRate: s.hourlyRate,
        status: s.operational ? "Active" : "Inactive",
      }));
      setSites(mapped);
    }).catch(() => setSites([])).finally(() => setLoading(false));
  }, []);

  const openNew = () => { setEdit(null); setForm({ id: `S00${sites.length + 1}`, name: "", location: "", totalSlots: 30, hourlyRate: 50, status: "Active" }); setOpen(true); };
  const openEdit = (s: any) => { setEdit(s); setForm(s); setOpen(true); };
  const save = async () => {
    setLoading(true);
    try {
      if (edit) {
        await adminService.updateSite(edit.id, form);
        setSites((arr) => arr.map((s) => s.id === edit.id ? { ...s, ...form } : s));
        toast.success("Site updated");
      } else {
        await adminService.saveSite(form);
        // refresh list
        const all = await adminService.getSites();
        const mapped = (all || []).map((s: any) => ({
          id: s.siteId,
          name: s.siteLocation,
          location: s.siteLocation,
          totalSlots: s.maxSiteCapacity,
          hourlyRate: s.hourlyRate,
          status: s.operational ? "Active" : "Inactive",
        }));
        setSites(mapped);
        toast.success("Site added");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save site");
    } finally { setLoading(false); }
  };
  const remove = async (id: string) => {
    setLoading(true);
    try { await adminService.deleteSite(id); setSites((arr) => arr.filter((s) => s.id !== id)); toast.success("Site removed"); }
    catch (e: any) { toast.error(e?.message || "Failed to remove site"); }
    finally { setLoading(false); }
  };
  const toggle = async (id: string) => {
    const target = sites.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, status: target.status === "Active" ? "Inactive" : "Active" };
    setLoading(true);
    try { await adminService.updateSite(id, updated); setSites((arr) => arr.map((s) => s.id === id ? updated : s)); }
    catch (e: any) { toast.error(e?.message || "Failed to toggle status"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Sites" description="Add, edit and configure parking sites." action={
        <Button onClick={openNew} className="gradient-primary text-white border-0"><Plus className="h-4 w-4 mr-1" /> Add Site</Button>
      } />

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Location</TableHead>
                <TableHead>Slots</TableHead><TableHead>Rate/hr</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center p-6">Loading...</TableCell></TableRow>
              ) : sites.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>{s.totalSlots}</TableCell>
                  <TableCell>Rs {s.hourlyRate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.status === "Active"} onCheckedChange={() => toggle(s.id)} />
                      <Badge className={s.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>{s.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit Site" : "Add Site"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Site ID</Label><Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} /></div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Total Slots</Label><Input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Hourly Rate</Label><Input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gradient-primary text-white border-0">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
