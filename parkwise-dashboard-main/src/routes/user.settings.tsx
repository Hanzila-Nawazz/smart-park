import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { userService } from "@/services/userService";

export const Route = createFileRoute("/user/settings")({
  component: () => <DashboardLayout role="user"><Settings /></DashboardLayout>,
});

function Settings() {
  const { user, setUser } = useAuthStore();
  const [contact, setContact] = useState(user?.contact ?? "");
  const [email, setEmail] = useState("");
  const [vehicleType, setVehicleType] = useState(user?.vehicleType ?? "Car");
  const [plateNumber, setPlateNumber] = useState(user?.plateNumber ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const saveProfile = async () => {
    if (!user?.id) return toast.error("Not authenticated");
    try {
      const payload: any = { contact, email, vehicleType, plateNumber };
      const res = await userService.updateUser(user.id, payload);
      toast.success(res?.message || "Profile updated");
      if (res?.user) setUser(res.user);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed");
    }
  };

  const changePass = async () => {
    if (!user?.id) return toast.error("Not authenticated");
    if (!currentPassword || !newPassword) return toast.error("Provide both passwords");
    try {
      const res = await userService.changePassword(user.id, currentPassword, newPassword);
      toast.success(res?.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Password update failed");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Update your profile, vehicle and password." />

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Full Name</Label><Input value={user?.name ?? ""} disabled /></div>
          <div className="space-y-2"><Label>CNIC</Label><Input value={user?.cnic ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Contact</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <Button onClick={saveProfile} className="mt-4 gradient-primary text-white border-0">Save</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Vehicle</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Vehicle Type</Label><Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} /></div>
          <div className="space-y-2"><Label>Plate Number</Label><Input value={plateNumber} disabled /></div>
        </div>
        <Button onClick={saveProfile} className="mt-4 gradient-primary text-white border-0">Save</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
        </div>
        <Button onClick={changePass} className="mt-4 gradient-primary text-white border-0">Update</Button>
      </div>
    </div>
  );
}
