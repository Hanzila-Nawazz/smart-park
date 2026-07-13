import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Car, UserPlus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/lib/store";
import { PasswordValidator } from "@/components/PasswordValidator";

export const Route = createFileRoute("/user/signup")({
  head: () => ({ meta: [{ title: "Sign Up — SmartPark" }] }),
  component: Signup,
});

function Signup() {
  const [form, setForm] = useState({
    name: "", cnic: "", contact: "", vehicleType: "Car", plate: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isPasswordValid = 
    form.password.length >= 8 && form.password.length <= 25 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[@#$%^&+=!*()_\-.\]\[{}|:;"'<>,?/~`]/.test(form.password);

  const passwordsMatch = form.password === form.confirmPassword;
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}-\d{7}-\d$/.test(form.cnic)) return toast.error("Invalid CNIC: 35202-1234567-1");
    if (!/^(\+92|0)3\d{9}$/.test(form.contact.replace(/\s/g, ""))) return toast.error("Invalid Pakistani phone");
    if (!isPasswordValid) return toast.error("Password does not meet the security requirements");
    if (!passwordsMatch) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const res = await authService.userSignup(form);
      setAuth({ ...res.user, plateNumber: res.user.vehicleNo, role: "user" }, res.token);
      toast.success("Account created");
      navigate({ to: "/user/dashboard" });
    } catch (err: any) { 
      toast.error(err.response?.data?.error || "Signup failed"); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Mobile Branding (hidden on desktop) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
        className="lg:hidden relative gradient-success px-6 pt-8 pb-16 text-white z-20 shrink-0 shadow-lg"
      >
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold leading-tight">Join SmartPark</h2>
          <p className="mt-2 text-white/80 text-sm">Create an account to manage your parking.</p>
        </motion.div>
      </motion.div>

      {/* Desktop Animated Inclined Background */}
      <motion.div
        initial={{ width: "100%", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
        animate={{ width: "55%", clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
        transition={{ duration: 1, ease: [0.25, 1, 0.35, 1] }}
        className="hidden lg:flex relative gradient-success p-12 flex-col justify-between text-white z-20 shrink-0 shadow-2xl"
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center"><Car className="h-5 w-5" /></div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <UserPlus className="h-16 w-16 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold leading-tight">Join SmartPark</h2>
          <p className="mt-4 text-white/80 max-w-md">Create an account to book slots, pay with your wallet and view full parking history.</p>
        </motion.div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Form Side */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 z-30"
      >
        <form onSubmit={submit} className="w-full max-w-md space-y-4 bg-card p-8 rounded-3xl shadow-card border border-border">
          <div className="mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center mb-4 lg:hidden shadow-glow mx-auto">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center lg:text-left">Create account</h1>
            <p className="text-muted-foreground text-sm mt-2 text-center lg:text-left">Fill in your details to get started.</p>
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
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password.length > 0 && <PasswordValidator password={form.password} />}
          </div>
          
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} onPaste={(e) => e.preventDefault()} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!passwordsMatch && form.confirmPassword.length > 0 && (
              <p className="text-sm text-destructive">Passwords do not match.</p>
            )}
          </div>

          <Button type="submit" disabled={loading || !isPasswordValid || !passwordsMatch} className="w-full gradient-primary text-white border-0 h-11 shadow-glow">
            {loading ? "Creating..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/user/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
