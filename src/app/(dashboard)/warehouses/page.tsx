"use client";

import { useEffect, useRef } from "react";
import { warehousesData } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MapPin, Box, Zap } from "lucide-react";
import { gsap } from "@/lib/gsap-setup";

export default function Warehouses() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Stagger animate cards in
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

      // Animate progress bars
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
  }, []);

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
        {warehousesData.map((wh) => {
          const utilPct = (wh.used / wh.capacity) * 100;
          let progressColor = "bg-primary";
          if (utilPct > 85) progressColor = "bg-rose-500";
          else if (utilPct > 70) progressColor = "bg-amber-500";

          return (
            <div key={wh.id} className="wh-card bg-card border border-border shadow-sm rounded-2xl p-6 group hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">{wh.name}</h3>
                  <div className="flex items-center text-muted-foreground mt-1 text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> {wh.location}
                  </div>
                </div>
                <Badge variant="outline" className={
                  wh.status === 'Active' ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/5' : 
                  wh.status === 'Warning' ? 'text-amber-600 border-amber-500/30 bg-amber-500/5' : 
                  'text-rose-600 border-rose-500/30 bg-rose-500/5'
                }>
                  <Zap className="w-3 h-3 mr-1" /> {wh.status}
                </Badge>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Box className="w-4 h-4 mr-1.5" /> Utilization
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
                  <span>{wh.used.toLocaleString()} units</span>
                  <span>{wh.capacity.toLocaleString()} max</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

