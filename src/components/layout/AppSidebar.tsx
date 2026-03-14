"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  History,
  Building2,
  Settings,
  ClipboardList,
  BookOpen,
  User,
  LogOut,
  Users,
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { logOut } from "@/actions/auth.actions";

const navItems = [
  { title: "Dashboard", url: "/inventory", icon: LayoutDashboard, group: "main" },
  { title: "Products", url: "/products", icon: Box, group: "main" },
  { title: "Receipts", url: "/receipts", icon: ArrowDownToLine, group: "operations" },
  { title: "Delivery Orders", url: "/deliveries", icon: ArrowUpFromLine, group: "operations" },
  { title: "Internal Transfers", url: "/transfers", icon: ArrowRightLeft, group: "operations" },
  { title: "Inventory Adjustment", url: "/adjustments", icon: ClipboardList, group: "operations" },
  { title: "Move History", url: "/move-history", icon: History, group: "operations" },
  { title: "Stock Ledger", url: "/stock-ledger", icon: BookOpen, group: "workspace" },
  { title: "Warehouses", url: "/warehouses", icon: Building2, group: "workspace" },
  { title: "Settings", url: "/settings", icon: Settings, group: "workspace" },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "#a855f7" },
  MANAGER: { label: "Manager", color: "#6366f1" },
  WAREHOUSE_STAFF: { label: "Warehouse Staff", color: "#0ea5e9" },
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(d => { if (d.user?.role) setUserRole(d.user.role); })
      .catch(() => {});
  }, []);

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const roleInfo = userRole ? ROLE_LABELS[userRole] : null;

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const renderGroup = (groupName: string, label: string) => {
    const items = navItems.filter(item => item.group === groupName);
    if (!items.length) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground/50 font-semibold tracking-widest text-xs uppercase px-2 mb-2">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`
                      transition-all duration-300 rounded-xl mb-1
                      ${isActive ? "bg-sidebar-primary/20 text-sidebar-primary font-medium border border-sidebar-primary/30 shadow-sm" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/5"}
                    `}
                  >
                    <Link href={item.url} className="flex items-center gap-3 py-2 px-3">
                      <item.icon className={`w-5 h-5 ${isActive ? "text-sidebar-primary" : ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center border border-sidebar-primary/30 glow-indigo"
            style={{ transform: "perspective(100px) translateZ(5px)" }}>
            <Box className="w-5 h-5 text-sidebar-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-sidebar-foreground"
            style={{ textShadow: "1px 1px 0 #000, 2px 2px 0 rgba(0,0,0,0.5)" }}>
            Core<span className="text-sidebar-primary">Inv</span>
          </span>
        </div>
        {/* Role indicator */}
        {roleInfo && (
          <div className="mt-2 flex items-center gap-1.5 px-1">
            {isSuperAdmin && <Crown className="w-3 h-3" style={{ color: roleInfo.color }} />}
            <span className="text-xs font-medium" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2 space-y-2">
        {renderGroup("main", "")}
        {renderGroup("operations", "Operations")}
        {renderGroup("workspace", "Workspace")}

        {/* Admin section — SUPER_ADMIN only */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 font-semibold tracking-widest text-xs uppercase px-2 mb-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/users" || pathname.startsWith("/users/")}
                    className={`
                      transition-all duration-300 rounded-xl mb-1
                      ${pathname.startsWith("/users") ? "bg-sidebar-primary/20 text-sidebar-primary font-medium border border-sidebar-primary/30 shadow-sm" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/5"}
                    `}
                  >
                    <Link href="/users" className="flex items-center gap-3 py-2 px-3">
                      <Users className={`w-5 h-5 ${pathname.startsWith("/users") ? "text-sidebar-primary" : ""}`} />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/5 rounded-xl mb-1 transition-colors">
              <Link href="/profile" className="flex items-center gap-3 py-2 px-3">
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer w-full flex items-center gap-3 py-2 px-3">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
