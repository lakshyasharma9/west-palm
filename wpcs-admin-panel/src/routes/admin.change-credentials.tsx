import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/change-credentials")({
  component: ChangeCredentialsPage,
});

function ChangeCredentialsPage() {
  const { email: currentEmail, updateCredentials } = useAuth();
  const [current, setCurrent] = useState("");
  const [newEmail, setNewEmail] = useState(currentEmail ?? "");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!current) return toast.error("Enter your current password");
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match");
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) return toast.error("Enter a valid email");

    updateCredentials({ email: newEmail.trim(), password: newPwd });
    toast.success("Credentials updated successfully");
    setCurrent("");
    setNewPwd("");
    setConfirmPwd("");
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Change Credentials
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your admin email and password.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-border bg-card p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="flex items-center gap-3 rounded-lg p-3"
          style={{ background: "var(--gradient-green)" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: "var(--gradient-gold)" }}
          >
            <KeyRound className="h-5 w-5 text-sidebar" />
          </div>
          <div className="text-sm text-sidebar-foreground">
            Currently signed in as{" "}
            <span className="font-semibold text-primary">{currentEmail}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cur">Current Password</Label>
          <Input
            id="cur"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">New Username / Email</Label>
          <Input
            id="email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="np">New Password</Label>
          <Input
            id="np"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp">Confirm New Password</Label>
          <Input
            id="cp"
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
