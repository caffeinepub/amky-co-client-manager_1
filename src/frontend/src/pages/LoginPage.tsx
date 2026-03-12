import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { KeyRound, Lock, MapPin, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type ResetTab = "password" | "username" | "factory";

export default function LoginPage() {
  const { login, changePassword, changeUsername, resetToDefault } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTab, setResetTab] = useState<ResetTab>("password");

  // Password change
  const [resetCurrent, setResetCurrent] = useState("");
  const [resetNew, setResetNew] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Username change
  const [usernamePassword, setUsernamePassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Factory reset confirm
  const [factoryConfirm, setFactoryConfirm] = useState("");

  const closeReset = () => {
    setResetOpen(false);
    setResetCurrent("");
    setResetNew("");
    setResetConfirm("");
    setUsernamePassword("");
    setNewUsername("");
    setFactoryConfirm("");
    setResetTab("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const ok = await login(username, password);
    setIsLoading(false);
    if (!ok) toast.error("Invalid credentials. Please try again.");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNew !== resetConfirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (resetNew.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setResetLoading(true);
    const ok = await changePassword(resetCurrent, resetNew);
    setResetLoading(false);
    if (ok) {
      toast.success("Password changed successfully.");
      closeReset();
    } else {
      toast.error("Current password is incorrect.");
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    setUsernameLoading(true);
    const ok = await changeUsername(usernamePassword, newUsername);
    setUsernameLoading(false);
    if (ok) {
      toast.success("Login ID changed successfully.");
      closeReset();
    } else {
      toast.error("Password is incorrect.");
    }
  };

  const handleFactoryReset = () => {
    if (factoryConfirm.toLowerCase() !== "reset") {
      toast.error('Type "reset" to confirm.');
      return;
    }
    resetToDefault();
    toast.success("Credentials reset to default: admin / password");
    closeReset();
  };

  return (
    <div
      className="min-h-screen flex items-center"
      style={{ background: "#f5f2ee" }}
    >
      {/* Left side — branding */}
      <div
        className="hidden md:flex flex-col items-center justify-center w-1/2 min-h-screen px-12"
        style={{ background: "#eae6e0" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div>
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#1a3a6b" }}
            >
              AMKY & Co.
            </h2>
            <p
              className="text-sm mt-1 font-medium"
              style={{ color: "#b8860b" }}
            >
              Chartered Accountants
            </p>
            <p
              className="text-xs mt-4 max-w-xs leading-relaxed"
              style={{ color: "#777" }}
            >
              Shop No 28, Palika Bazar, Ghodbunder Rd, opp. to Om Sai Diesel,
              near Sai Baba Mandir, Kapurbawdi, Thane West, Thane, Maharashtra
              400607
            </p>
          </div>
        </motion.div>
      </div>

      {/* Vertical divider */}
      <div
        className="hidden md:block w-px self-stretch"
        style={{ background: "rgba(0,0,0,0.1)" }}
      />

      {/* Right side — Login form */}
      <div className="flex items-center justify-center w-full md:w-1/2 min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div
            className="rounded-2xl overflow-hidden shadow-lg border"
            style={{
              background: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
            }}
          >
            {/* Card header */}
            <div
              className="px-8 pt-7 pb-5 border-b"
              style={{
                borderColor: "rgba(0,0,0,0.07)",
                background: "#f9f7f5",
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/assets/uploads/Final-Crop-Gif-1-3.gif"
                  alt="AMKY Logo"
                  className="h-12 w-auto object-contain flex-shrink-0"
                />
                <div>
                  <h1
                    className="text-xl font-bold tracking-tight leading-tight"
                    style={{ color: "#1a3a6b" }}
                  >
                    AMKY & Co.
                  </h1>
                  <p
                    className="text-sm font-semibold mt-0.5"
                    style={{ color: "#b8860b" }}
                  >
                    Chartered Accountants
                  </p>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: "#999" }}>
                Sign in to your account
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-7">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" style={{ color: "#1a3a6b" }}>
                    Login ID
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: "#b8860b" }}
                    />
                    <Input
                      id="username"
                      data-ocid="login.input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9"
                      placeholder="Enter your login ID"
                      style={{
                        background: "#faf9f7",
                        borderColor: "#ddd",
                        color: "#1a1a1a",
                      }}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" style={{ color: "#1a3a6b" }}>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: "#b8860b" }}
                    />
                    <Input
                      id="password"
                      data-ocid="login.password_input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      style={{
                        background: "#faf9f7",
                        borderColor: "#ddd",
                        color: "#1a1a1a",
                      }}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  data-ocid="login.submit_button"
                  className="w-full text-sm font-semibold mt-1"
                  style={{
                    background: "#1a3a6b",
                    color: "#ffffff",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  data-ocid="login.reset_password_button"
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="text-xs underline underline-offset-4 transition-opacity hover:opacity-60"
                  style={{ color: "#1a3a6b" }}
                >
                  Forgot credentials / Reset login
                </button>
              </div>
            </div>

            {/* Address footer */}
            <div
              className="px-8 py-4 border-t flex items-start gap-2"
              style={{
                borderColor: "rgba(0,0,0,0.07)",
                background: "#f9f7f5",
              }}
            >
              <MapPin
                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                style={{ color: "#b8860b" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#1a3a6b" }}
              >
                Shop No 28, Palika Bazar, Ghodbunder Rd, opp. to Om Sai Diesel,
                near Sai Baba Mandir, Kapurbawdi, Thane West, Thane, Maharashtra
                400607
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reset Credentials Dialog */}
      <Dialog open={resetOpen} onOpenChange={closeReset}>
        <DialogContent data-ocid="reset.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset Credentials
            </DialogTitle>
          </DialogHeader>

          {/* Tab selector */}
          <div className="flex border rounded-lg overflow-hidden text-xs font-medium">
            {(["password", "username", "factory"] as ResetTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                data-ocid={`reset.${tab}_tab`}
                onClick={() => setResetTab(tab)}
                className="flex-1 py-2 transition-colors"
                style={{
                  background: resetTab === tab ? "#1a3a6b" : "#f9f7f5",
                  color: resetTab === tab ? "#fff" : "#555",
                }}
              >
                {tab === "password"
                  ? "Change Password"
                  : tab === "username"
                    ? "Change Login ID"
                    : "Reset to Default"}
              </button>
            ))}
          </div>

          {/* Change Password */}
          {resetTab === "password" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-current">Current Password</Label>
                <Input
                  id="reset-current"
                  type="password"
                  value={resetCurrent}
                  onChange={(e) => setResetCurrent(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-new">New Password</Label>
                <Input
                  id="reset-new"
                  type="password"
                  value={resetNew}
                  onChange={(e) => setResetNew(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirm New Password</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reset.cancel_button"
                  onClick={closeReset}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="reset.confirm_button"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Change Username */}
          {resetTab === "username" && (
            <form onSubmit={handleUsernameChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="un-password">
                  Current Password (to verify)
                </Label>
                <Input
                  id="un-password"
                  type="password"
                  value={usernamePassword}
                  onChange={(e) => setUsernamePassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-username">New Login ID</Label>
                <Input
                  id="new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reset.cancel_button"
                  onClick={closeReset}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="reset.username_confirm_button"
                  disabled={usernameLoading}
                >
                  {usernameLoading ? "Saving..." : "Change Login ID"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Factory Reset */}
          {resetTab === "factory" && (
            <div className="space-y-4">
              <div
                className="rounded-lg p-4 text-sm"
                style={{ background: "#fff8e1", color: "#7a5c00" }}
              >
                This will reset your login ID and password back to the default:
                <br />
                <strong>Login ID: admin</strong>
                <br />
                <strong>Password: password</strong>
              </div>
              <div className="space-y-2">
                <Label htmlFor="factory-confirm">Type "reset" to confirm</Label>
                <Input
                  id="factory-confirm"
                  type="text"
                  value={factoryConfirm}
                  onChange={(e) => setFactoryConfirm(e.target.value)}
                  placeholder="reset"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reset.cancel_button"
                  onClick={closeReset}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  data-ocid="reset.factory_confirm_button"
                  onClick={handleFactoryReset}
                  style={{ background: "#c0392b", color: "#fff" }}
                >
                  Reset to Default
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
