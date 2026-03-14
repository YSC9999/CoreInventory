"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Box, Boxes, MapPin, Zap } from "lucide-react";
import { gsap } from "@/lib/gsap-setup";

type WarehouseSummary = {
  id: string;
  name: string;
  shortCode: string;
  locationCount: number;
  activeLocationCount: number;
  uniqueSkuCount: number;
  totalUnits: number;
  lowStockItems: number;
  stockSharePct: number;
  status: "Active" | "Warning" | "Idle";
  topLocations: Array<{
    id: string;
    name: string;
    shortCode: string;
    totalUnits: number;
  }>;
};

export default function Warehouses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWarehouses() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/warehouses", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load warehouses");
        }

        if (active) {
          setWarehouses(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load warehouses");
          setWarehouses([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWarehouses();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading || warehouses.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".wh-card",
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "back.out(1.5)"
        }
      );

      gsap.fromTo(".wh-progress",
        { width: "0%" },
        {
          width: (index, target) => target.dataset.width,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, warehouses.length]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Facility Network</h1>
        <p className="text-muted-foreground mt-1">Monitor capacity across all storage nodes.</p>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {loading && Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-pulse h-[260px]" />
        ))}

        {!loading && error && (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && warehouses.map((wh) => {
          const utilPct = wh.stockSharePct;
          let progressColor = "bg-primary";
          if (utilPct > 85) progressColor = "bg-rose-500";
          else if (utilPct > 70) progressColor = "bg-amber-500";

          return (
            <div key={wh.id} className="wh-card bg-card border border-border shadow-sm rounded-2xl p-6 group hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">{wh.name}</h3>
                  <div className="flex items-center text-muted-foreground mt-1 text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> {wh.shortCode} • {wh.activeLocationCount}/{wh.locationCount} active locations
                  </div>
                </div>
                <Badge variant="outline" className={
                  wh.status === 'Active' ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/5' :
                    wh.status === 'Warning' ? 'text-amber-600 border-amber-500/30 bg-amber-500/5' :
                      'text-slate-600 border-slate-500/30 bg-slate-500/5'
                }>
                  <Zap className="w-3 h-3 mr-1" /> {wh.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="text-muted-foreground">Units</div>
                  <div className="mt-1 font-mono font-semibold text-foreground">{wh.totalUnits.toLocaleString("en-US")}</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="text-muted-foreground">SKUs</div>
                  <div className="mt-1 font-mono font-semibold text-foreground">{wh.uniqueSkuCount}</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="text-muted-foreground">Alerts</div>
                  <div className="mt-1 font-mono font-semibold text-foreground">{wh.lowStockItems}</div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Box className="w-4 h-4 mr-1.5" /> Network stock share
                  </span>
                  <span className="font-mono font-medium">{utilPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                  <div
                    className={`wh-progress h-full ${progressColor}`}
                    data-width={`${utilPct}%`}
                    style={{ width: "0%" }} // Set initial to 0 for GSAP
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                  <span>{wh.totalUnits.toLocaleString('en-US')} units</span>
                  <span>{wh.uniqueSkuCount} stocked SKUs</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Boxes className="h-4 w-4" /> Top locations
                  </span>
                  {wh.lowStockItems > 0 ? (
                    <span className="text-amber-600 flex items-center gap-1 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" /> {wh.lowStockItems} low-stock SKUs
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {wh.topLocations.length > 0 ? wh.topLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2 text-sm">
                      <span className="text-foreground">{location.shortCode} • {location.name}</span>
                      <span className="font-mono text-muted-foreground">{location.totalUnits.toLocaleString("en-US")}</span>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                      No stock recorded in this warehouse yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

