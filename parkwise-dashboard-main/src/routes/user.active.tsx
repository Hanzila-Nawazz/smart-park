import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Car, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import { parkingService } from "@/services/parkingService";

export const Route = createFileRoute("/user/active")({
  head: () => ({
    meta: [
      { title: "Active - Smart Park" },
      { name: "description", content: "Manage your Smart Park account, book parking slots, view active sessions, and top up your wallet securely." },
    ],
  }),
  component: () => <DashboardLayout role="user"><ActiveSession /></DashboardLayout>,
});

function ActiveSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError("Please log in to view your active session.");
      return;
    }
    setLoading(true);
    parkingService.getActiveSession(user.id)
      .then((data) => {
        setSession(data?.active ? data : null);
      })
      .catch((e) => setError(e?.response?.data?.error || "Failed to load active session"))
      .finally(() => setLoading(false));
  }, [user?.id]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!session) return <p className="text-muted-foreground">No active session found.</p>;

  const checkInTime = session.checkIn.endsWith("Z") ? session.checkIn : session.checkIn + "Z";
  const start = new Date(checkInTime).getTime();
  const elapsed = Math.max(0, now - start);
  const hours = Math.floor(elapsed / 3_600_000);
  const minutes = Math.floor((elapsed % 3_600_000) / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1000);
  const bill = session.estimatedBill ?? (Math.ceil(elapsed / 3_600_000) * session.rate);

  const checkout = async (mode: "Cash" | "Later") => {
    try {
      const response = await parkingService.checkout(session.id, mode);
      toast.success(response?.message || (mode === "Later" ? `Session closed · Rs ${bill} added to pending bills` : `Checkout successful · Total Rs ${bill}`));
      navigate({ to: "/user/history" });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Active Session" description="Your live parking session." />

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl gradient-primary text-white p-8 shadow-glow">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="grid sm:grid-cols-2 gap-6 relative">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wider">Live</p>
            <h2 className="text-4xl font-bold mt-1">{String(hours).padStart(2,"0")}:{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}</h2>
            <p className="text-white/80 mt-1 text-sm">Duration</p>
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wider">Estimated Bill</p>
            <h2 className="text-4xl font-bold mt-1">Rs {bill}</h2>
            <p className="text-white/80 mt-1 text-sm">@ Rs {session.rate}/hr</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8 relative">
          <Info icon={MapPin} label="Site" value={session.site} />
          <Info icon={Car} label="Slot" value={session.slot ?? "Assigned"} />
          <Info icon={Clock} label="Check-in" value={new Date(session.checkIn).toLocaleTimeString()} />
        </div>

        <div className="flex gap-3 mt-8 relative">
          <Button onClick={() => toast("Session extended by 30 min")} variant="secondary">
            <Plus className="h-4 w-4 mr-1" /> Extend
          </Button>
          <Button onClick={() => setCheckoutOpen(true)} className="bg-white text-primary hover:bg-white/90">Checkout</Button>
        </div>
      </motion.div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Checkout Session</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Choose whether to pay now or add this session to your pending bills.</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { checkout("Later"); setCheckoutOpen(false); }}>
              Pay Later
            </Button>
            <Button className="gradient-primary text-white border-0" onClick={() => { checkout("Cash"); setCheckoutOpen(false); }}>
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl p-4">
      <div className="flex items-center gap-2 text-white/80 text-xs"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}
