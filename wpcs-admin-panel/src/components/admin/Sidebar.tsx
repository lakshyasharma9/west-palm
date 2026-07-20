import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Building2, KeyRound, X, Newspaper, Megaphone, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/queries", label: "Queries", icon: Inbox },
  { to: "/admin/projects", label: "Projects", icon: Building2 },
  { to: "/admin/newsletters", label: "Newsletters", icon: Newspaper },
  { to: "/admin/news", label: "News & Events", icon: Megaphone },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/change-credentials", label: "Change Credentials", icon: KeyRound },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <img 
            src="/logo-white.png" 
            alt="West Palm Logo" 
            className="h-10 w-auto"
          />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-wide">
              <span className="text-sidebar-foreground">WP</span>
              <span className="text-primary">CS</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Admin
            </div>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon className={cn("h-4.5 w-4.5", active ? "text-primary" : "")} size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/50">
        <div className="font-medium text-sidebar-foreground/70">WPCS v1.0</div>
        <div className="mt-0.5">© {new Date().getFullYear()} All rights reserved</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
