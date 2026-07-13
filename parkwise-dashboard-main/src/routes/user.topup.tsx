import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, Smartphone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { paymentService } from "@/services/paymentService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/user/topup")({
  head: () => ({
    meta: [
      { title: "Topup - Smart Park" },
      { name: "description", content: "Manage your Smart Park account, book parking slots, view active sessions, and top up your wallet securely." },
    ],
  }),
  component: () => <DashboardLayout role="user"><TopUp /></DashboardLayout>,
});

const methods = [
  { id: "card", label: "Credit Card", icon: CreditCard },
  { id: "easypaisa", label: "EasyPaisa", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
];

function TopUp() {
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState("card");
  const [success, setSuccess] = useState(false);
  const topUpLocal = useAuthStore((s) => s.topUp);
  const setWalletBalance = useAuthStore((s) => s.setWalletBalance);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const submit = async () => {
    if (amount < 100) return toast.error("Minimum Rs 100");
    if (!user?.id) return toast.error("User not authenticated");
    try {
      const res = await paymentService.topUp(user.id, amount, method);
      setSuccess(true);
      if (res && typeof res.balance !== "undefined") setWalletBalance(Number(res.balance));
      topUpLocal(amount);
      toast.success(res?.message || "Top-up successful");
      setTimeout(() => navigate({ to: "/user/wallet" }), 1200);
    } catch (e) {
      toast.error("Top-up failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Top Up Wallet" description="Add funds to your SmartPark wallet." />

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <div>
          <Label>Amount (Rs)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2 text-2xl font-bold h-14" />
          <div className="flex gap-2 mt-3">
            {[500, 1000, 2000, 5000].map((v) => (
              <Button key={v} variant="outline" size="sm" onClick={() => setAmount(v)}>Rs {v}</Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Payment Method</Label>
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  method === m.id ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50",
                )}>
                <m.icon className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={submit} className="w-full gradient-primary text-white border-0 h-12 shadow-glow">
          Top Up Rs {amount}
        </Button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-card">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full gradient-success grid place-items-center mx-auto mb-4 shadow-glow">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold">Top Up Successful!</h3>
              <p className="text-muted-foreground mt-2">Rs {amount} added to your wallet.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
