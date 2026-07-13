import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, MapPin, Clock, History, Receipt, Wallet,
  Plus, Settings, LogOut, Building2, Search, Users, BarChart3,
  PieChart, Car, Menu, X, Moon, Sun, Bell, MessageSquareWarning, MessageSquare
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Car };

const userNav: NavItem[] = [
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/book", label: "Book Slot", icon: MapPin },
  { to: "/user/active", label: "Active Session", icon: Clock },
  { to: "/user/history", label: "Parking History", icon: History },
  { to: "/user/bills", label: "Bills", icon: Receipt },
  { to: "/user/wallet", label: "Wallet", icon: Wallet },
  { to: "/user/topup", label: "Top Up", icon: Plus },
  { to: "/user/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/user/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Vehicle Requests", icon: Car },
  { to: "/admin/sites", label: "Manage Sites", icon: Building2 },
  { to: "/admin/site-details", label: "Site Details", icon: MapPin },
  { to: "/admin/records", label: "Parking Records", icon: History },
  { to: "/admin/search", label: "Vehicle Search", icon: Search },
  { to: "/admin/users", label: "Registered Users", icon: Users },
  { to: "/admin/revenue", label: "Revenue Reports", icon: BarChart3 },
  { to: "/admin/analytics", label: "Analytics", icon: PieChart },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children, role }: { children: ReactNode; role: "admin" | "user" }) {
  const nav = role === "admin" ? adminNav : userNav;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);

  // Auto-logout & Auth Guards
  
  useEffect(() => {
    // 1. Route Protection: Kick out unauthenticated users or wrong roles
    if (!user) {
      window.location.replace(role === "admin" ? "/admin/login" : "/user/login");
      return;
    } else if (user.role?.toLowerCase() !== role.toLowerCase()) {
      window.location.replace(`/${user.role.toLowerCase()}/dashboard`);
      return;
    }

    // 2. Inactivity Timeout: 10 minutes (600,000 ms)
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000);
    };

    // Attach listeners
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);
    
    // Start initial timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [user, role]);

  const handleLogout = () => {
    // 1. Clear the Zustand store (which also clears localStorage and sessionStorage internally)
    logout(); 
    
    // 2. Double-check by explicitly removing auth tokens
    localStorage.removeItem("spms-auth"); 
    sessionStorage.removeItem("spms-auth");
    
    // 3. Clear any API headers by accessing the store one more time
    // This ensures the API interceptor won't have any stale tokens
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
    }
    
    // 4. Force a hard refresh by navigating to home with a fresh page load
    // This ensures all JavaScript state is wiped and the browser resets
    window.location.href = "/"; 
  };

  return (
    <div className="min-h-screen flex w-full bg-background gradient-mesh">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SmartPark</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{role}</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "gradient-primary text-white shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-4"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-semibold text-sm">{user?.name ?? "Guest"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="w-9 h-9 rounded-full gradient-primary grid place-items-center text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? "G"}
            </div>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}