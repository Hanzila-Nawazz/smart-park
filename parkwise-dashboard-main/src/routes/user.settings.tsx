import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/userService";
import { PasswordValidator } from "@/components/PasswordValidator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/user/settings")({
  head: () => ({
    meta: [
      { title: "Settings - Smart Park" },
      { name: "description", content: "Manage your Smart Park account, book parking slots, view active sessions, and top up your wallet securely." },
    ],
  }),
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
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    try {
      const data = await userService.getMyVehicleRequests(user.id);
      setRequests(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const saveProfile = async () => {
    if (!user?.id) return toast.error("Not authenticated");
    try {
      const payload: any = { contact, email, vehicleType: user.vehicleType, plateNumber: user.plateNumber };
      const res = await userService.updateUser(user.id, payload);
      toast.success(res?.message || "Profile updated");
      if (res?.user) setUser(res.user);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed");
    }
  };

  const isPasswordValid = 
    newPassword.length >= 8 && newPassword.length <= 25 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[@#$%^&+=!*()_\-.\]\[{}|:;"'<>,?/~`]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword;

  const changePass = async () => {
    if (!user?.id) return toast.error("Not authenticated");
    if (!currentPassword || !isPasswordValid || !passwordsMatch) return toast.error("Provide a valid new password");
    try {
      const res = await userService.changePassword(user.id, currentPassword, newPassword);
      toast.success(res?.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
        <h3 className="font-semibold mb-4">Vehicle Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Current Vehicle Type</Label><Input value={user?.vehicleType ?? "Car"} disabled /></div>
          <div className="space-y-2"><Label>Current Plate Number</Label><Input value={user?.plateNumber ?? ""} disabled /></div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium mb-3 text-sm">Request Vehicle Change</h4>
          <p className="text-xs text-muted-foreground mb-4">Submit a request to change your registered vehicle. An admin will review and approve your request. You can only have one pending request at a time.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>New Plate Number</Label><Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="e.g. ABC-123" /></div>
          </div>
          <Button 
            onClick={async () => {
              if (!user?.id) return;
              if (!plateNumber || !vehicleType) return toast.error("Please provide both new plate and type");
              try {
                const res = await userService.submitVehicleChangeRequest(user.id, { newPlate: plateNumber, newType: vehicleType });
                toast.success(res?.message || "Request submitted successfully");
                fetchRequests();
              } catch (e: any) {
                toast.error(e?.response?.data?.error || "Failed to submit request");
              }
            }} 
            className="mt-4 bg-primary text-primary-foreground border-0"
          >
            Submit Request
          </Button>

          {requests.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-medium mb-3 text-sm">Previous Requests</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                    <tr>
                      <th className="px-4 py-3">New Vehicle</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">
                          {r.newPlate} · {r.newType}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            r.status === "PENDING" ? "bg-warning/15 text-warning" :
                            r.status === "APPROVED" ? "bg-success/15 text-success" :
                            "bg-destructive/15 text-destructive"
                          )}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
                <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onPaste={(e) => e.preventDefault()} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-sm text-destructive">Passwords do not match.</p>
              )}
            </div>
          )}
        </div>
        <Button onClick={changePass} disabled={!currentPassword || !isPasswordValid || !passwordsMatch} className="mt-4 gradient-primary text-white border-0">Update</Button>
      </div>
    </div>
  );
}

