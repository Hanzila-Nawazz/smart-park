import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Car, User } from "lucide-react";
import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
      toast.error("CNIC format: 35202-1234567-1");
      return;
    }
    
    setLoading(true);
    try {
      // Calls Java: http://localhost:8080/api/users/login
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden gradient-success p-12 flex-col justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">SmartPark</span>
        </Link>
        <div>
          <User className="h-16 w-16 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold leading-tight">Your parking, made simple.</h2>
          <p className="mt-4 text-white/80 max-w-md">Book slots, manage your wallet, and track every parking session in one place.</p>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.form 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          onSubmit={submit} 
          className="w-full max-w-md space-y-5"
        >
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in with your CNIC and password.</p>
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
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 h-11 shadow-glow">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/user/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}