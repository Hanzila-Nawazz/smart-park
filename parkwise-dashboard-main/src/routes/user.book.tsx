import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Bike, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, LoadingSpinner } from "@/components/Shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { parkingService } from "@/services/parkingService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/user/book")({
  component: () => <DashboardLayout role="user"><BookSlot /></DashboardLayout>,
});

interface Slot { id: string; number: number; vehicleType: string; status: string }

function BookSlot() {
  const [siteId, setSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [open, setOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuthStore();

  // Fetch sites safely
  useEffect(() => {
    parkingService.getSites().then((data) => {
      setSites(data || []);
      if (data && data.length > 0) {
        setSiteId(String(data[0].siteId || data[0].id));
      }
    }).catch(() => { });
  }, []);

  // Fetch virtual slots map
  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    parkingService.getSlots(siteId).then((s) => {
      setSlots(s || []);
      setLoading(false);
    }).catch(() => {
      setSlots([]);
      setLoading(false);
    });
  }, [siteId]);

  const statusColor = (s: string) =>
    s === "Available" ? "bg-success/15 border-success/40 text-success hover:bg-success/25"
      : s === "Occupied" ? "bg-destructive/15 border-destructive/40 text-destructive cursor-not-allowed"
        : "bg-warning/15 border-warning/40 text-warning";

  const handleBook = async () => {
    if (!selected || !siteId) return;

    const registeredPlate = user?.plateNumber;
    if (!registeredPlate) {
      toast.error("No registered vehicle found on your account.");
      return;
    }

    setIsBooking(true);
    try {
      const responseMessage = await parkingService.bookSlot({ siteId, slotId: selected.id, plate: registeredPlate });

      toast.success(responseMessage || `Slot ${selected.number} booked successfully!`);
      setOpen(false);
      setSelected(null);

      // Refresh map to turn slot RED
      parkingService.getSlots(siteId).then(setSlots);

    } catch (err: any) {
      toast.error(err.response?.data || "Booking failed. Please verify your vehicle plate.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Book a Slot" description="Pick a site and select an available slot." />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <Label>Site:</Label>
          <Select value={siteId ?? ""} onValueChange={(v) => setSiteId(v)}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select a site" /></SelectTrigger>
            <SelectContent>
              {sites.map((s) => (
                <SelectItem
                  key={String(s.siteId || s.id)}
                  value={String(s.siteId || s.id)}
                >
                  {s.siteLocation || s.location || s.name || `Site ${s.siteId || s.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 text-xs">
          <Legend color="bg-success" label="Available" />
          <Legend color="bg-destructive" label="Occupied" />
          <Legend color="bg-warning" label="Reserved" />
          <Legend color="bg-primary" label="Selected" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {slots.map((slot) => {
            const isSelected = selected?.id === slot.id;
            const disabled = slot.status === "Occupied";
            return (
              <motion.button
                key={slot.id}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                disabled={disabled}
                onClick={() => setSelected(slot)}
                className={cn(
                  "aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all",
                  isSelected ? "bg-primary text-primary-foreground border-primary shadow-glow" : statusColor(slot.status),
                )}
              >
                {slot.vehicleType === "Bike" ? <Bike className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                <span className="text-xs font-bold mt-1">{slot.number}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl shadow-card px-6 py-4 flex items-center gap-4 z-30">
          <div>
            <p className="text-xs text-muted-foreground">Selected</p>
            <p className="font-semibold">Slot {selected.number} · {selected.vehicleType || "Vehicle"}</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gradient-primary text-white border-0">Book Slot</Button>
        </motion.div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Booking</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Row label="Site" value={sites.find((s) => String(s.siteId || s.id) === String(siteId))?.siteLocation || sites.find((s) => String(s.siteId || s.id) === String(siteId))?.location || "Selected Site"} />
            <Row label="Slot" value={`#${selected?.number}`} />
            <Row label="Time" value={new Date().toLocaleString()} />
            <Row label="Registered Plate" value={user?.plateNumber || "Not available"} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isBooking}>Cancel</Button>
            <Button onClick={handleBook} disabled={isBooking} className="gradient-success text-white border-0">
              <CheckCircle2 className="h-4 w-4 mr-1" /> {isBooking ? "Booking..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={cn("w-2.5 h-2.5 rounded-full", color)} />{label}</span>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm py-2 border-b border-border last:border-0">
    <span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span>
  </div>;
}