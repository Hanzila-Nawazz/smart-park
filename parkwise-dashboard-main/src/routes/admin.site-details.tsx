import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, StatCard, LoadingSpinner } from "@/components/Shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { parkingService } from "@/services/parkingService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/site-details")({
  head: () => ({
    meta: [
      { title: "Admin Page - Site Details" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><SiteDetails /></DashboardLayout>,
});

function SiteDetails() {
  const [siteId, setSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Fetch all sites for the dropdown
  useEffect(() => {
    adminService.getSites()
      .then((s) => {
        setSites(s);
        if (s && s.length) setSiteId(s[0].siteId || s[0].id); // Support both ID formats from Spring Boot
      })
      .catch(() => { });
  }, []);

  // Fetch live data when a site is selected
  useEffect(() => {
    if (!siteId) return;
    setLoading(true);

    parkingService.getSlots(siteId)
      .then((data) => {
        setSlots((data || []).map((slot: any) => ({
          id: slot.id,
          number: slot.number,
          status: slot.status,
          vehiclePlate: slot.vehiclePlate,
          vehicleType: slot.vehicleType,
          userType: slot.userType,
          checkIn: slot.checkIn,
        })));
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  // The UI math remains perfectly intact using the reconstructed array
  const total = slots.length;
  const occupied = slots.filter((s) => s.status === "Occupied").length;
  const available = slots.filter((s) => s.status === "Available").length;
  const occupancy = total ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Site Details" description="Visual occupancy map and real-time slot tracking." />

      <div className="bg-card border border-border rounded-2xl p-4 shadow-soft flex items-center gap-3">
        <Label>Select Site:</Label>
        <Select value={siteId ?? ""} onValueChange={(v) => setSiteId(v)}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.siteId || s.id} value={s.siteId || s.id}>
                {s.siteLocation || s.location || s.name || s.siteId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total Slots" value={total} icon={Car} />
        <StatCard label="Occupied" value={occupied} icon={Car} variant="warning" />
        <StatCard label="Available" value={available} icon={Car} variant="success" />
        <StatCard label="Occupancy" value={`${occupancy}%`} icon={Car} variant="primary" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Slot Map</h3>
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-2">
            {slots.map((slot) => (
              <button key={slot.id} onClick={() => { setSelected(slot); setOpen(true); }}
                className={cn(
                  "aspect-square rounded-lg border-2 text-xs font-bold transition-transform hover:scale-110",
                  slot.status === "Available" ? "bg-success/15 border-success/40 text-success"
                    : slot.status === "Occupied" ? "bg-destructive/15 border-destructive/40 text-destructive"
                      : "bg-warning/15 border-warning/40 text-warning",
                )}>
                {slot.number}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Slot #{selected?.number}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Row label="Status" value={<Badge className={selected?.status === "Available" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>{selected?.status}</Badge>} />

            {/* DYNAMIC REAL-TIME DATA INJECTION */}
            {selected?.status === "Occupied" && (
              <>
                <Row label="Vehicle Plate" value={selected?.vehiclePlate} />
                <Row label="User Type" value={selected?.userType || "Registered"} />
                <Row label="Check-in Time" value={selected?.checkIn} />
                <Row label="Session" value={<Badge className="bg-info text-info-foreground">Active</Badge>} />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}