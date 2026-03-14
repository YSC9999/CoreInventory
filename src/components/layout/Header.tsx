"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, User, LogOut, Settings, Crown, Shield, HardHat, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logOut } from "@/actions/auth.actions";
import gsap from "gsap";

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "#a855f7", icon: Crown },
  MANAGER: { label: "Manager", color: "#6366f1", icon: Shield },
  WAREHOUSE_STAFF: { label: "Warehouse Staff", color: "#0ea5e9", icon: HardHat },
};

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  // Animate dropdown in
  useEffect(() => {
    if (!menuRef.current) return;
    if (menuOpen) {
      gsap.fromTo(menuRef.current,
        { opacity: 0, y: -8, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" }
      );
    }
  }, [menuOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.parentElement?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleCfg = user?.role ? ROLE_CONFIG[user.role] : null;
  const RoleIcon = roleCfg?.icon ?? User;

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" />
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-9 bg-secondary/50 border-border focus-visible:ring-primary/50 rounded-full h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Bell */}
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-secondary group"
          >
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white select-none shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {initials}
            </div>
            {/* Name + role (hidden on small screens) */}
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-foreground">{user?.name ?? "Loading..."}</span>
              {roleCfg && (
                <span className="text-xs flex items-center gap-1" style={{ color: roleCfg.color }}>
                  <RoleIcon className="w-3 h-3" />
                  {roleCfg.label}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div ref={menuRef}
              className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
              style={{ background: "var(--popover, #fff)", border: "1px solid var(--border)" }}>
              {/* User info header */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{user?.email}</p>
                  </div>
                </div>
                {roleCfg && (
                  <div className="mt-2 flex items-center gap-1.5 px-0.5">
                    <RoleIcon className="w-3 h-3" style={{ color: roleCfg.color }} />
                    <span className="text-xs font-medium" style={{ color: roleCfg.color }}>{roleCfg.label}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-1.5">
                <Link href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-secondary w-full"
                  style={{ color: "var(--foreground)" }}>
                  <User className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  My Profile
                </Link>
                <Link href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-secondary w-full"
                  style={{ color: "var(--foreground)" }}>
                  <Settings className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  Settings
                </Link>
                <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-rose-500/10 w-full text-rose-500 hover:text-rose-400">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
