import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { paymentService } from "@/services/paymentService";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/user/wallet")({
  component: () => <DashboardLayout role="user"><WalletPage /></DashboardLayout>,
});

function WalletPage() {
  const { walletBalance, setWalletBalance, user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    paymentService
      .getWallet(user.id)
      .then((d) => {
        setTransactions(d.transactions || []);
        if (d && typeof d.balance !== "undefined") setWalletBalance(Number(d.balance));
        else if (d && typeof d.walletBalance !== "undefined") setWalletBalance(Number(d.walletBalance));
      })
      .catch(() => setTransactions([]));
  }, [setWalletBalance, user?.id]);
  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" description="Manage balance and transactions." />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-primary text-white p-8 shadow-glow">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-start justify-between relative">
          <div>
            <p className="text-white/80 text-sm">Available Balance</p>
            <h2 className="text-5xl font-bold mt-2">Rs {walletBalance.toLocaleString()}</h2>
            <p className="text-white/70 text-xs mt-2">**** **** **** {String(walletBalance).slice(-4)}</p>
          </div>
          <Wallet className="h-10 w-10 opacity-80" />
        </div>
        <Link to="/user/topup" className="inline-block mt-6 relative">
          <Button className="bg-white text-primary hover:bg-white/90"><Plus className="h-4 w-4 mr-1" /> Top Up</Button>
        </Link>
      </motion.div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Transactions</h3>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center ${t.type === "Top-up" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {t.type === "Top-up" ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.type}</p>
                  <p className="text-xs text-muted-foreground">{t.date} · {t.id}</p>
                </div>
              </div>
              <p className={`font-semibold ${t.type === "Top-up" ? "text-success" : "text-warning"}`}>
                {t.type === "Top-up" ? "+" : "-"}Rs {t.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
