import { createFileRoute, Outlet, Navigate, useLocation, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    // Check auth before loading route
    const token = typeof window !== 'undefined' ? localStorage.getItem('wpcs_admin_token') : null;
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if current route is project preview page
    setIsPreviewMode(location.pathname.match(/\/admin\/projects\/[^\/]+$/) !== null);
  }, [location.pathname]);

  // Full-width layout for project preview pages
  if (isPreviewMode) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
