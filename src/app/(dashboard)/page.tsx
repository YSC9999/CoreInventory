"use client";

import { useEffect, useRef, Suspense, lazy } from "react";
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MovementChart, CategoryChart } from "@/components/dashboard/Charts";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { kpiData, productsData } from "@/lib/mock-data";
import { gsap } from "@/lib/gsap-setup";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Lazy load 3D hero for performance
const Hero3D = lazy(() => import("@/components/dashboard/Hero3D"));

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Stagger KPI cards
      gsap.from(".kpi-card", {
        y: 30,
        opacity: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".kpi-grid",
          start: "top 85%",
        }
      });

      // Animate charts section sliding in
      gsap.from(".charts-section > div", {
        x: (index) => index === 0 ? -50 : 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".charts-section",
          start: "top 80%",
        }
      });
      
      // Animate inventory status table
      gsap.from(".status-table", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: ".status-table",
          start: "top 85%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Get top 5 low stock items
  const lowStockItems = [...productsData].sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <div className="p-6 space-y-8" ref={containerRef}>
      <Suspense fallback={<div className="w-full h-[300px] rounded-3xl bg-card border border-border animate-pulse shadow-sm" />}>
        <Hero3D />
      </Suspense>

      <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="kpi-card">
          <KPICard 
            title="Total Stock Units" 
            value={kpiData.totalStock.value} 
            trend={kpiData.totalStock.trend} 
            isPositive={kpiData.totalStock.isPositive} 
            icon={Package}
          />
        </div>
        <div className="kpi-card">
          <KPICard 
            title="Low Stock Items" 
            value={kpiData.lowStockItems.value} 
            trend={kpiData.lowStockItems.trend} 
            isPositive={kpiData.lowStockItems.isPositive} 
            icon={AlertTriangle}
          />
        </div>
        <div className="kpi-card">
          <KPICard 
            title="Pending Receipts" 
            value={kpiData.pendingReceipts.value} 
            trend={kpiData.pendingReceipts.trend} 
            isPositive={kpiData.pendingReceipts.isPositive} 
            icon={ArrowDownToLine}
          />
        </div>
        <div className="kpi-card">
          <KPICard 
            title="Pending Deliveries" 
            value={kpiData.pendingDeliveries.value} 
            trend={kpiData.pendingDeliveries.trend} 
            isPositive={kpiData.pendingDeliveries.isPositive} 
            icon={ArrowUpFromLine}
          />
        </div>
        <div className="kpi-card">
          <KPICard 
            title="Internal Transfers" 
            value={kpiData.internalTransfers.value} 
            trend={kpiData.internalTransfers.trend} 
            isPositive={kpiData.internalTransfers.isPositive} 
            icon={ArrowRightLeft}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 quick-filters">
        <Button variant="secondary" className="rounded-full shadow-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">All Activity</Button>
        <Button variant="outline" className="rounded-full bg-card shadow-sm border-border hover:bg-secondary">Receipts</Button>
        <Button variant="outline" className="rounded-full bg-card shadow-sm border-border hover:bg-secondary">Deliveries</Button>
        <Button variant="outline" className="rounded-full bg-card shadow-sm border-border hover:bg-secondary">Transfers</Button>
        <Button variant="outline" className="rounded-full bg-card shadow-sm border-border hover:bg-secondary">Adjustments</Button>
      </div>

      <div className="charts-section grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MovementChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTable />
        </div>
        <div className="lg:col-span-1 status-table">
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-1">Critical Inventory</h3>
            <p className="text-sm text-muted-foreground mb-4">Items requiring immediate attention</p>
            
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="py-2 h-auto text-xs">Product</TableHead>
                    <TableHead className="py-2 h-auto text-xs text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id} className="border-border/50 hover:bg-primary/5 transition-colors">
                      <TableCell className="py-3">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="font-mono text-rose-600 font-semibold">{item.stock}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10">View All Shortages</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

