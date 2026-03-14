"use client";

import { useEffect, useState } from "react";
import { Users, Crown, HardHat, Shield, RefreshCw, Trash2, ChevronDown, Search } from "lucide-react";
import { getAllUsers, updateUserRole, deleteUser } from "@/actions/users.actions";
import { getCurrentUser } from "@/actions/auth.actions";
import { toast } from "sonner";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  verified: boolean;
  createdAt: Date;
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "#7c3aed", bg: "#ede9fe", icon: Crown },
  MANAGER: { label: "Manager", color: "#1d4ed8", bg: "#dbeafe", icon: Shield },
  WAREHOUSE_STAFF: { label: "Warehouse Staff", color: "#0369a1", bg: "#e0f2fe", icon: HardHat },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: "#374151", bg: "#f3f4f6", icon: Users };
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RoleDropdown({ userId, currentRole, onChanged }: { userId: string; currentRole: string; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const options = [
    { value: "MANAGER", label: "Manager" },
    { value: "WAREHOUSE_STAFF", label: "Warehouse Staff" },
  ];

  const handleChange = async (newRole: string) => {
    if (newRole === currentRole) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      toast.success("Role updated successfully");
      onChanged();
    } else {
      toast.error(result.error || "Failed to update role");
    }
    setLoading(false);
  };

  if (currentRole === "SUPER_ADMIN") {
    return <span className="text-xs text-gray-400 italic">Protected</span>;
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={loading}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors"
        style={{ borderColor: "#e5e7eb", background: "#f9fafb", color: "#374151" }}>
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
        Change Role
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => handleChange(opt.value)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
              style={{ color: currentRole === opt.value ? "#6366f1" : "#374151", fontWeight: currentRole === opt.value ? 600 : 400 }}>
              {currentRole === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [usersResult, me] = await Promise.all([getAllUsers(), getCurrentUser()]);
    if (usersResult.success && usersResult.users) {
      setUsers(usersResult.users as User[]);
    } else {
      toast.error(usersResult.error || "Failed to load users");
    }
    setCurrentUser(me);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(`Delete user "${userName || "this user"}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    const result = await deleteUser(userId);
    if (result.success) {
      toast.success("User deleted");
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      toast.error(result.error || "Failed to delete user");
    }
    setDeletingId(null);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: users.length,
    admins: users.filter(u => u.role === "SUPER_ADMIN").length,
    managers: users.filter(u => u.role === "MANAGER").length,
    staff: users.filter(u => u.role === "WAREHOUSE_STAFF").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>User Management</h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Manage roles and access for your organization</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: counts.total, color: "#6366f1", bg: "#eef2ff" },
          { label: "Super Admins", value: counts.admins, color: "#7c3aed", bg: "#ede9fe" },
          { label: "Managers", value: counts.managers, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Warehouse Staff", value: counts.staff, color: "#0369a1", bg: "#e0f2fe" },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {/* Toolbar */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-colors hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#6366f1" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={user.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none", opacity: deletingId === user.id ? 0.5 : 1 }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                            {user.name || "—"}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>You</span>
                            )}
                          </p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {user.verified ? "✓ Verified" : "⚠ Unverified"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: "var(--foreground)" }}>{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.id !== currentUser?.id && (
                          <>
                            <RoleDropdown userId={user.id} currentRole={user.role} onChanged={load} />
                            {user.role !== "SUPER_ADMIN" && (
                              <button
                                onClick={() => handleDelete(user.id, user.name)}
                                disabled={deletingId === user.id}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                style={{ color: "#ef4444" }}
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
