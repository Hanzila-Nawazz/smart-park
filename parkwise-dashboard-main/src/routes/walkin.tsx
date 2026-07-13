import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";
import { Car, Zap, Receipt, Printer, ArrowLeft, Loader2, QrCode } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("park");

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Car className="h-6 w-6 text-white" />
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="park">Start Parking</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
          </TabsList>
          <TabsContent value="park"><WalkInForm /></TabsContent>
          <TabsContent value="checkout"><WalkInCheckout onCheckoutSuccess={() => { setTimeout(() => setActiveTab("park"), 2000); }} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WalkInForm() {
  const [form, setForm] = useState({ name: "", contact: "", vehicleType: "Car", plate: "", siteId: "" });
  const [sites, setSites] = useState<any[]>([]);
  const [receipt, setReceipt] = useState<any>(null);
  const [interceptOpen, setInterceptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminService
      .getSites()
      .then((s) => {
        setSites(s || []);
        if (s && s.length && !form.siteId) setForm((f) => ({ ...f, siteId: s[0].siteId }));
      })
      .catch(() => {});
  }, []);

  const handleCheckInRequest = async () => {
    if (!form.name || !form.plate || !form.siteId) return toast.error("Fill all required fields");
    setLoading(true);
    try {
      const { isRegistered } = await parkingService.checkWalkinRegistered(form.plate);
      if (isRegistered) {
        setInterceptOpen(true);
        setLoading(false);
      } else {
        await proceedWithWalkIn();
      }
    } catch (e) {
      toast.error("Failed to verify vehicle registration");
      setLoading(false);
    }
  };

  const proceedWithWalkIn = async () => {
    setLoading(true);
    try {
      setInterceptOpen(false);
      const res = await parkingService.walkinCheckIn(form);
      setReceipt({
        ...form,
        token: res?.token,
        time: new Date().toLocaleString(),
        slotNumber: res?.slotNumber,
        site: res?.site,
      });
      toast.success(res?.message || "Walk-in session started");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Check-in failed");
    } finally {
      setLoading(false);
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

      <Button disabled={loading} onClick={handleCheckInRequest} className="w-full gradient-warning text-white border-0 h-12 shadow-glow">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
        {loading ? "Processing..." : "Start Parking & Generate Receipt"}
      </Button>

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Parking Receipt</DialogTitle></DialogHeader>
          {receipt && (
            <div className="space-y-3">
              <div className="text-center py-4 gradient-warning text-white rounded-xl flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg mb-2">
                  <QRCodeCanvas value={receipt.plate} size={100} />
                </div>
                <p className="text-2xl font-bold">{receipt.plate}</p>
                <p className="text-xs opacity-90">License Plate</p>
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

      <Dialog open={interceptOpen} onOpenChange={setInterceptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vehicle Already Registered</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your vehicle is already registered. Do you want to check in from your account to get slot of your own choice or from here for random allocation?
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: "/user/login" })} className="w-full" variant="outline">
                Check in from Account
              </Button>
              <Button onClick={proceedWithWalkIn} className="w-full gradient-primary text-white border-0">
                Check in Here
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function WalkInCheckout({ onCheckoutSuccess }: { onCheckoutSuccess?: () => void }) {
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [interceptOpen, setInterceptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render(
      (text) => {
        setPlate(text);
        setScanning(false);
        scanner.clear();
        lookupByText(text);
      },
      (err) => {}
    );
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  const lookupByText = async (text: string) => {
    setLoading(true);
    try {
      const data = await parkingService.walkinLookup(text);
      setSession(data);
      setPaid(false);
      if (data.isRegularUser) {
        setInterceptOpen(true);
      }
    } catch (e: any) {
      setSession(null);
      toast.error(e?.response?.data?.error || "No active session found");
    } finally {
      setLoading(false);
    }
  };

  const lookup = async () => {
    if (!plate) return toast.error("Enter your plate");
    await lookupByText(plate);
  };

  const pay = async () => {
    setLoading(true);
    try {
      const data = await parkingService.walkinCheckout(plate);
      setSession((s: any) => ({ ...(s || {}), ...data }));
      setPaid(true);
      toast.success("Payment successful");
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex gap-2">
        <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Enter plate to checkout" />
        <Button onClick={() => setScanning(!scanning)} variant="outline" size="icon" title="Scan QR Code">
          {scanning ? <span className="text-xs">Cancel</span> : <QrCode className="h-5 w-5" />}
        </Button>
        <Button disabled={loading} onClick={lookup} className="gradient-warning text-white border-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
        </Button>
      </div>

      {scanning && <div id="reader" className="overflow-hidden rounded-xl border border-border" />}

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
            <Button disabled={loading} onClick={pay} className="w-full gradient-success text-white border-0 h-12 shadow-glow">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {loading ? "Processing..." : `Pay Rs ${session.total}`}
            </Button>
          ) : (
            <div className="text-center py-4 bg-success/10 text-success rounded-xl font-semibold">✓ Payment Confirmed · Thank you!</div>
          )}
        </motion.div>
      )}

      <Dialog open={interceptOpen} onOpenChange={setInterceptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registered Account Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This session belongs to a registered account. How would you like to pay?
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: "/user/login" })} className="w-full" variant="outline">
                Pay from Wallet (Account)
              </Button>
              <Button onClick={() => { setInterceptOpen(false); }} className="w-full gradient-success text-white border-0">
                Pay with Cash Here
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
