"use client";

import { activityData } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

export function ActivityTable() {
  const tableRef = useGsapStagger(".activity-row");

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'DELIVERY': return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
      default: return <ArrowRight className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'RECEIPT': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">IN</Badge>;
      case 'DELIVERY': return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">OUT</Badge>;
      default: return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">TRF</Badge>;
    }
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-2xl p-6" ref={tableRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Activity Stream</h3>
          <p className="text-sm text-muted-foreground">Latest inventory movements</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium py-3">Time</TableHead>
              <TableHead className="text-muted-foreground font-medium">Product</TableHead>
              <TableHead className="text-muted-foreground font-medium">Movement</TableHead>
              <TableHead className="text-muted-foreground font-medium">Route</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityData.map((activity) => (
              <TableRow key={activity.id} className="activity-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="text-muted-foreground whitespace-nowrap py-3">{activity.time}</TableCell>
                <TableCell className="font-medium text-foreground">{activity.product}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMovementIcon(activity.movement)}
                    {getMovementBadge(activity.movement)}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {activity.from} <span className="text-border mx-1">→</span> {activity.to}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">{activity.qty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
