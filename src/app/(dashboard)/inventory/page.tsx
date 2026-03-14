import { DashboardOverview } from "@/components/dashboard/Overview";

export default function InventoryPage() {
  return (
    <DashboardOverview
      title="Inventory Overview"
      description="Synchronized inventory metrics, movement trends, and current shortages."
      showHero={false}
    />
  );
}
