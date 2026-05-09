import { createFileRoute } from "@tanstack/react-router";
import { Receipt, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { parkingService } from "@/services/parkingService";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/user/bills")({
  component: () => <DashboardLayout role="user"><Bills /></DashboardLayout>,
});

function Bills() {
  const { walletBalance, deduct, user, setWalletBalance } = useAuthStore();
  const [pending, setPending] = useState<any[]>([]);
  const [paid, setPaid] = useState<any[]>([]);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    parkingService.getPendingBills(user.id)
      .then((d) => {
        setPending(d?.items || []);
        setTotalPending(d?.totalPending || 0);
      })
      .catch(() => setPending([]));

    parkingService.getHistory(user.id)
      .then((d) => setPaid((d || []).filter((r: any) => r.status === "Paid").slice(0, 4)))
      .catch(() => setPaid([]));
  }, [user?.id]);

  const unpaid = pending;

  const pay = async (bill: any) => {
    if (walletBalance < bill.amount) return toast.error("Insufficient wallet balance");
    try {
      await parkingService.payPendingBill(bill.id, "Wallet");
      // Sync backend-authoritative balance after successful payment
      try {
        const w = await (await import("@/services/paymentService")).paymentService.getWallet(user.id);
        if (w && typeof w.balance !== "undefined") setWalletBalance(Number(w.balance));
        else deduct(bill.amount);
      } catch (e) {
        deduct(bill.amount);
      }
      toast.success(`Bill paid · Rs ${bill.amount}`);
      setPending((items) => items.filter((item) => item.id !== bill.id));
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Payment failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bills" description="Outstanding and recently paid bills." />

      <div className="bg-card border border-border rounded-2xl p-4 shadow-soft flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total pending dues</p>
          <p className="text-2xl font-bold">Rs {totalPending}</p>
        </div>
        <Badge className="bg-warning text-warning-foreground">{unpaid.length} pending sessions</Badge>
      </div>

      <section>
        <h3 className="font-semibold mb-3">Outstanding</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {unpaid.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{b.id}</p>
                  <p className="font-semibold mt-1">{b.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.date} · Slot {b.slot}</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Unpaid</Badge>
              </div>
              <div className="flex justify-between items-end mt-4">
                <p className="text-2xl font-bold">Rs {b.amount}</p>
                <Button onClick={() => pay(b)} className="gradient-success text-white border-0">Pay with Wallet</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Recently Paid</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paid.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="font-semibold mt-2">Rs {b.amount}</p>
              <p className="text-xs text-muted-foreground">{b.location} · {b.date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
