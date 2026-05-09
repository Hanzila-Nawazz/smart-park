import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/settings")({
  component: () => <DashboardLayout role="admin"><AdminSettings /></DashboardLayout>,
});

function AdminSettings() {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.name ?? "admin123");
  const [email, setEmail] = useState("admin@smartpark.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
      setUser({ name: res?.username ?? username });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save settings");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Admin Settings" description="Manage your admin profile and security." />
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
        <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@smartpark.com" /></div>
        <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
        <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
        <Button onClick={save} className="gradient-primary text-white border-0">Save Changes</Button>
      </div>
    </div>
  );
}
