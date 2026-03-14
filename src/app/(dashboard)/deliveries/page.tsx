"use client";

import { deliveriesData } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MoreHorizontal } from "lucide-react";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

export default function Deliveries() {
  const tableRef = useGsapStagger(".stagger-row");

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Done': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Shipped</Badge>;
      case 'Ready': return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Ready</Badge>;
      case 'Waiting': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">Picking</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground border-border">Draft</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Outbound Deliveries</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and shipping.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" ref={tableRef}>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Reference</TableHead>
              <TableHead className="font-medium">Scheduled Date</TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium text-center">Items</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveriesData.map((delivery) => (
              <TableRow key={delivery.id} className="stagger-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="font-mono font-medium text-foreground py-4">{delivery.id}</TableCell>
                <TableCell className="text-muted-foreground">{delivery.date}</TableCell>
                <TableCell className="font-medium">{delivery.customer}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary border border-border text-sm font-medium">
                    {delivery.itemsCount}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {delivery.status === 'Ready' && (
                      <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm">
                        <Truck className="w-4 h-4 mr-1" /> Ship
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

