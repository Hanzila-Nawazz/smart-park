import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Car } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/lib/store";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — SmartPark" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.adminLogin(username, password);
      setAuth({ ...res.user, role: "admin" }, res.token);
      toast.success("Welcome back, admin");
      navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Illustration */}
      <div className="hidden lg:flex relative overflow-hidden gradient-primary p-12 flex-col justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <div>
          <Shield className="h-16 w-16 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold leading-tight">Admin Control Center</h2>
          <p className="mt-4 text-white/80 max-w-md">
            Manage every parking site, monitor live occupancy, analyze revenue and oversee your registered users.
          </p>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-md space-y-5"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Sign In</h1>
            <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to access the admin dashboard.</p>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 h-11 shadow-glow">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Not an admin? <Link to="/" className="text-primary font-medium hover:underline">Back to home</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
