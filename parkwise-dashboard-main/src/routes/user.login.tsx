import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Car, User, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/lib/store";

export const Route = createFileRoute("/user/login")({
  head: () => ({ meta: [{ title: "User Login — SmartPark" }] }),
  component: UserLogin,
});

function UserLogin() {
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  // Clean slate or redirect if already logged in
  useEffect(() => {
    const authData = localStorage.getItem("spms-auth") || sessionStorage.getItem("spms-auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state?.token && parsed.state?.user?.role === "user") {
          navigate({ to: "/user/dashboard", replace: true });
          return;
        }
      } catch (e) {
        // Ignore
      }
    }
    logout();
  }, [logout, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
      toast.error("CNIC format: 35202-1234567-1");
      return;
    }
    
    setLoading(true);
    try {
      // Calls Java: `${process.env.vite_api_url}`/api/users/login
      const res = await authService.userLogin(cnic, password);
      
      // Saves the token and user data (including walletBalance) to React state
      setAuth({ ...res.user, plateNumber: res.user.vehicleNo, role: "user" }, res.token);
      
      toast.success("Login successful");
      navigate({ to: "/user/dashboard" });
      
    } catch (err: any) { 
      // Extracts the exact error message from Java, or shows a default message
      const errorMessage = err.response?.data?.error || "Login failed. Please check your credentials.";
      toast.error(errorMessage); 
    } finally { 
      setLoading(false); 
    }
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
          <h2 className="text-3xl font-bold leading-tight">Your parking, made simple.</h2>
          <p className="mt-2 text-white/80 text-sm">Book slots, manage wallet & history.</p>
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
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <User className="h-16 w-16 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold leading-tight">Your parking, made simple.</h2>
          <p className="mt-4 text-white/80 max-w-md">Book slots, manage your wallet, and track every parking session in one place.</p>
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
        <form onSubmit={submit} className="w-full max-w-md space-y-5 bg-card p-8 rounded-3xl shadow-card border border-border">
          <div className="mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center mb-4 lg:hidden shadow-glow mx-auto">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center lg:text-left">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm text-center lg:text-left">Sign in with your CNIC and password.</p>
          </div>
          
          <div className="space-y-2">
            <Label>CNIC</Label>
            <Input 
              value={cnic} 
              onChange={(e) => setCnic(e.target.value)} 
              placeholder="35202-1234567-1" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 h-11 shadow-glow">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/user/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}