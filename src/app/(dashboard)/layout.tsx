import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CoreInventory",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r border-gray-200 bg-white p-6">
        <h2 className="mb-8 text-xl font-bold">CoreInventory</h2>
        <nav className="space-y-2">
          <a href="/inventory" className="block rounded px-3 py-2 hover:bg-gray-100">
            📦 Inventory
          </a>
          <a href="/locations" className="block rounded px-3 py-2 hover:bg-gray-100">
            📍 Locations
          </a>
          <a href="/history" className="block rounded px-3 py-2 hover:bg-gray-100">
            📜 History
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
