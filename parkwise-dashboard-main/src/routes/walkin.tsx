import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Zap, Receipt, Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/adminService";
import { parkingService } from "@/services/parkingService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/walkin")({
  head: () => ({ meta: [{ title: "Walk-In Parking — SmartPark" }] }),
  component: WalkIn,
});

function WalkIn() {
  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-warning grid place-items-center shadow-glow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Walk-In Portal</span>
        </Link>
        <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button></Link>
      </header>

      <div className="container mx-auto px-6 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold">Walk-In Parking</h1>
          <p className="text-muted-foreground mt-2">No signup required. Park instantly, pay later.</p>
        </motion.div>

        <Tabs defaultValue="park" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="park">Start Parking</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
          </TabsList>
          <TabsContent value="park"><WalkInForm /></TabsContent>
          <TabsContent value="checkout"><WalkInCheckout /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WalkInForm() {
  const [form, setForm] = useState({ name: "", contact: "", vehicleType: "Car", plate: "", siteId: "" });
  const [slots, setSlots] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [assignedSlot, setAssignedSlot] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    adminService
      .getSites()
      .then((s) => {
        setSites(s || []);
        if (s && s.length && !form.siteId) setForm((f) => ({ ...f, siteId: s[0].siteId }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.siteId) return;
    parkingService
      .getSlots(form.siteId)
      .then((s) => {
        setSlots(s || []);
        setAssignedSlot(null);
      })
      .catch(() => setSlots([]));
  }, [form.siteId]);

  const submit = async () => {
    if (!form.name || !form.plate || !form.siteId) return toast.error("Fill all required fields");
    try {
      const res = await parkingService.walkinCheckIn(form);
      setAssignedSlot(res?.slotNumber ?? null);
      setReceipt({
        ...form,
        token: res?.token,
        time: new Date().toLocaleString(),
        slotNumber: res?.slotNumber,
        site: res?.site,
      });
      toast.success("Walk-in session started");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Check-in failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
        <div className="space-y-2"><Label>Vehicle Type</Label>
          <Select value={form.vehicleType} onValueChange={(v) => setForm({ ...form, vehicleType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Car">Car</SelectItem><SelectItem value="Bike">Bike</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>License Plate</Label><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="LEA-1234" /></div>
        <div className="space-y-2 sm:col-span-2"><Label>Parking Site</Label>
          <Select value={form.siteId} onValueChange={(v) => setForm({ ...form, siteId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{sites.map((s) => <SelectItem key={s.siteId} value={s.siteId}>{s.siteLocation}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Available Slots (Auto-assigned randomly on check-in)</Label>
        <div className="grid grid-cols-8 gap-2 mt-2">
          {slots.map((s) => {
            const disabled = s.status !== "Available";
            const sel = assignedSlot === s.number;
            return (
              <button key={s.id} disabled
                className={cn(
                  "aspect-square rounded-lg border-2 text-xs font-bold transition-all",
                  sel ? "bg-warning text-white border-warning shadow-glow"
                  : disabled ? "bg-destructive/10 border-destructive/30 text-destructive cursor-not-allowed"
                  : "bg-success/10 border-success/30 text-success hover:scale-105",
                )}>{s.number}</button>
            );
          })}
        </div>
      </div>

      <Button onClick={submit} className="w-full gradient-warning text-white border-0 h-12 shadow-glow">
        <Zap className="h-4 w-4 mr-1" /> Start Parking & Generate Receipt
      </Button>

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Parking Receipt</DialogTitle></DialogHeader>
          {receipt && (
            <div className="space-y-3">
              <div className="text-center py-4 gradient-warning text-white rounded-xl">
                <Receipt className="h-8 w-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">{receipt.token}</p>
                <p className="text-xs opacity-90">Session Token</p>
              </div>
              {[
                ["Name", receipt.name], ["Plate", receipt.plate],
                ["Site", receipt.site || sites.find((s) => s.siteId === receipt.siteId)?.siteLocation],
                ["Slot", `#${receipt.slotNumber ?? "-"}`],
                ["Started", receipt.time],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
                </div>
              ))}
              <Button onClick={() => window.print()} variant="outline" className="w-full"><Printer className="h-4 w-4 mr-1" /> Print Receipt</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function WalkInCheckout() {
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState<any>(null);
  const [paid, setPaid] = useState(false);

  const lookup = async () => {
    if (!plate) return toast.error("Enter your plate");
    try {
      const data = await parkingService.walkinLookup(plate);
      setSession(data);
      setPaid(false);
    } catch (e: any) {
      setSession(null);
      toast.error(e?.response?.data?.error || "No active session found");
    }
  };
  const pay = async () => {
    try {
      const data = await parkingService.walkinCheckout(plate);
      setSession((s: any) => ({ ...(s || {}), ...data }));
      setPaid(true);
      toast.success("Payment successful");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Payment failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex gap-2">
        <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Enter plate (e.g. LEA-1023)" />
        <Button onClick={lookup} className="gradient-warning text-white border-0">Find</Button>
      </div>

      {session && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="text-center py-6 gradient-primary text-white rounded-xl">
            <Car className="h-10 w-10 mx-auto mb-2" />
            <p className="text-3xl font-bold">Rs {session.total}</p>
            <p className="text-sm opacity-90">{session.duration}</p>
          </div>
          {[
            ["Plate", session.plate], ["Site", session.site], ["Slot", session.slot],
            ["Check-in", session.checkIn], ["Check-out", session.checkOut],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
            </div>
          ))}
          {!paid ? (
            <Button onClick={pay} className="w-full gradient-success text-white border-0 h-12 shadow-glow">Pay Rs {session.total}</Button>
          ) : (
            <div className="text-center py-4 bg-success/10 text-success rounded-xl font-semibold">✓ Payment Confirmed · Thank you!</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
