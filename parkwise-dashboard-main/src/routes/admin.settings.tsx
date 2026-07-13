import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { adminService } from "@/services/adminService";
import { PasswordValidator } from "@/components/PasswordValidator";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Admin Page - Settings" },
      { name: "description", content: "Secure administration portal for managing parking sites, monitoring revenue, and analyzing real-time occupancy data." },
    ],
  }),
  component: () => <DashboardLayout role="admin"><AdminSettings /></DashboardLayout>,
});

function AdminSettings() {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.name ?? "admin123");
  const [email, setEmail] = useState("admin@smartpark.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    adminService.getSettings()
      .then((data) => {
        if (data?.username) setUsername(data.username);
        if (data?.email) setEmail(data.email);
      })
      .catch(() => {
        // fall back to auth store defaults
      });
  }, []);

  const save = async () => {
    try {
      const res = await adminService.updateSettings({ username, email, currentPassword, newPassword });
      toast.success(res?.message || "Settings saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUser({ name: res?.username ?? username });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save settings");
    }
  };

  const isPasswordValid = 
    newPassword.length >= 8 && newPassword.length <= 25 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[@#$%^&+=!*()_\-.\]\[{}|:;"'<>,?/~`]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword;
  const canSave = !currentPassword ? false : (newPassword.length === 0 || (isPasswordValid && passwordsMatch));

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Admin Settings" description="Manage your admin profile and security." />
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
        <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="space-y-2"><Label>Email</Label><Input value={email} disabled className="bg-muted/50 text-muted-foreground" /></div>
        <div className="space-y-2">
          <Label>Current Password</Label>
          <div className="relative">
            <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to save changes" className="pr-10" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>New Password</Label>
          <div className="relative">
            <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" className="pr-10" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword.length > 0 && <PasswordValidator password={newPassword} />}
        </div>
        {newPassword.length > 0 && (
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onPaste={(e) => e.preventDefault()} placeholder="Confirm your new password" className="pr-10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-sm text-destructive">Passwords do not match.</p>
            )}
          </div>
        )}
        <Button onClick={save} className="gradient-primary text-white border-0" disabled={!canSave}>Save Changes</Button>
      </div>
    </div>
  );
}
