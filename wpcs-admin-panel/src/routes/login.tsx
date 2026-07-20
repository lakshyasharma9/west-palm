import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, HardHat, Lock, Mail, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, customerLogin, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");

  if (isAuthenticated) {
    if (role === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    }
    return <Navigate to="/admin/dashboard" />;
  }

  const onAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate({ to: "/admin/dashboard" });
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onCustomerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const ok = await customerLogin(username, customerPassword);
      if (ok) {
        navigate({ to: "/customer/dashboard" });
      } else {
        setError("Invalid username or password. Please check your credentials.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-green)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <img 
              src="/West_Palm_Logo-removebg-preview.png" 
              alt="West Palm Logo" 
              className="mb-4 h-20 w-auto"
            />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="text-sidebar">WP</span>
              <span className="text-primary">CS</span>{" "}
              <span className="font-light text-muted-foreground">Admin</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              West Palm Construction Solutions
            </p>
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-8"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
              </TabsList>

              <TabsContent value="admin">
                <h2 className="text-xl font-semibold text-foreground">Admin Login</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to access the admin dashboard.
                </p>

                <form onSubmit={onAdminSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="admin@wpcs.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className="px-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && activeTab === "admin" && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full font-semibold transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--gradient-gold)",
                      color: "var(--primary-foreground)",
                      boxShadow: "var(--shadow-gold)",
                    }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="customer">
                <h2 className="text-xl font-semibold text-foreground">Customer Login</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to view your projects.
                </p>

                <form onSubmit={onCustomerSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        autoComplete="username"
                        required
                        placeholder="customer1"
                        className="pl-9"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="customer-password"
                        type={showCustomer ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className="px-9"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomer((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showCustomer ? "Hide password" : "Show password"}
                      >
                        {showCustomer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && activeTab === "customer" && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full font-semibold transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--gradient-green)",
                      color: "var(--primary-foreground)",
                      boxShadow: "var(--shadow-elegant)",
                    }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} West Palm Construction Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
