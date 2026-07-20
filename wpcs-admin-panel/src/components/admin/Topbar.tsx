import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";

const LAST_VIEWED_KEY = "wpcs_notifications_last_viewed";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout, email } = useAuth();
  const { queries } = useStore();
  const navigate = useNavigate();
  const [lastViewed, setLastViewed] = useState<number>(0);
  const hasMarkedViewed = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_VIEWED_KEY);
    if (stored) {
      setLastViewed(parseInt(stored, 10));
    }
  }, []);

  const pending = queries.filter((q) => q.status === "pending");
  const newNotifications = pending.filter((q) => +new Date(q.date) > lastViewed);
  const latest = [...pending]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  const handleBellClick = () => {
    if (hasMarkedViewed.current) return;
    hasMarkedViewed.current = true;
    const now = Date.now();
    localStorage.setItem(LAST_VIEWED_KEY, now.toString());
    setLastViewed(now);
    setTimeout(() => {
      hasMarkedViewed.current = false;
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-foreground hover:bg-accent lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-muted-foreground sm:block">
          Welcome back,{" "}
          <span className="font-semibold text-foreground">{email ?? "Admin"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu onOpenChange={(open) => { if (open) handleBellClick(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {newNotifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {newNotifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">
                {pending.length} pending
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {latest.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              latest.map((q) => (
                <DropdownMenuItem
                  key={q.id}
                  className="flex flex-col items-start gap-0.5 py-2"
                  onSelect={() => navigate({ to: "/admin/queries" })}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{q.fullName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(q.date), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {q.services.slice(0, 2).join(", ")}
                    {q.services.length > 2 ? ` +${q.services.length - 2}` : ""}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/queries" className="w-full text-center text-primary">
                View all queries
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
