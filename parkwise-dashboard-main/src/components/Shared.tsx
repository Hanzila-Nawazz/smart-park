import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "success" | "warning" | "default";
  prefix?: string;
}

export function StatCard({ label, value, icon: Icon, trend, variant = "default", prefix = "" }: StatCardProps) {
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/\D/g, "")) || 0;

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const duration = 800;
    const step = (ts: number, base: number) => {
      const p = Math.min(1, (ts - base) / duration);
      setDisplay(Math.round(numeric * p));
      if (p < 1) requestAnimationFrame((t) => step(t, base));
    };
    requestAnimationFrame((t) => step(t, t));
  }, [numeric, value]);

  const gradient =
    variant === "primary" ? "gradient-primary" :
    variant === "success" ? "gradient-success" :
    variant === "warning" ? "gradient-warning" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-card",
        variant === "default" ? "bg-card border border-border" : `${gradient} text-white`,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium", variant === "default" ? "text-muted-foreground" : "text-white/80")}>{label}</p>
          <p className="text-3xl font-bold mt-2">
            {prefix}{typeof value === "number" ? display.toLocaleString() : value}
          </p>
          {trend && <p className={cn("text-xs mt-2", variant === "default" ? "text-success" : "text-white/90")}>{trend}</p>}
        </div>
        <div className={cn(
          "w-11 h-11 rounded-xl grid place-items-center",
          variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20 text-white",
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-muted grid place-items-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
