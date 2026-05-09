import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Car, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/lib/store";

export const Route = createFileRoute("/user/signup")({
  head: () => ({ meta: [{ title: "Sign Up — SmartPark" }] }),
  component: Signup,
});

function Signup() {
  const [form, setForm] = useState({
    name: "", cnic: "", contact: "", vehicleType: "Car", plate: "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}-\d{7}-\d$/.test(form.cnic)) return toast.error("Invalid CNIC: 35202-1234567-1");
    if (!/^(\+92|0)3\d{9}$/.test(form.contact.replace(/\s/g, ""))) return toast.error("Invalid Pakistani phone");
    if (form.password.length < 6) return toast.error("Password must be at least 6 chars");
    setLoading(true);
    try {
      const res = await authService.userSignup(form);
      setAuth({ ...res.user, plateNumber: res.user.vehicleNo, role: "user" }, res.token);
      toast.success("Account created");
      navigate({ to: "/user/dashboard" });
    } catch { toast.error("Signup failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden gradient-success p-12 flex-col justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center"><Car className="h-5 w-5" /></div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <div>
          <UserPlus className="h-16 w-16 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold leading-tight">Join SmartPark</h2>
          <p className="mt-4 text-white/80 max-w-md">Create an account to book slots, pay with your wallet and view full parking history.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="w-full max-w-md space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Create account</h1>
            <p className="text-muted-foreground text-sm mt-2">Fill in your details to get started.</p>
          </div>

          <div className="space-y-2"><Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
          <div className="space-y-2"><Label>CNIC</Label>
            <Input value={form.cnic} onChange={(e) => update("cnic", e.target.value)} placeholder="35202-1234567-1" required /></div>
          <div className="space-y-2"><Label>Contact Number</Label>
            <Input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="+92 300 1234567" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Vehicle Type</Label>
              <Select value={form.vehicleType} onValueChange={(v) => update("vehicleType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Bike">Bike</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>License Plate</Label>
              <Input value={form.plate} onChange={(e) => update("plate", e.target.value)} placeholder="LEA-1234" required /></div>
          </div>
          <div className="space-y-2"><Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required /></div>

          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 h-11 shadow-glow">
            {loading ? "Creating..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/user/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
