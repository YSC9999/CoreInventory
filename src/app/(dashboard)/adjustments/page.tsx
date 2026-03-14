"use client";

import { useState } from "react";
import { adjustmentsData } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

export default function Adjustments() {
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useGsapStagger(".stagger-row");

  const filteredData = adjustmentsData.filter(item => 
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Done': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Done</Badge>;
      case 'In Progress': return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">In Progress</Badge>;
      case 'Cancelled': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">Cancelled</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground border-border">Draft</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Inventory Adjustment</h1>
          <p className="text-muted-foreground mt-1">Reconcile physical stock with system records.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Adjustment
        </Button>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by product or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border rounded-xl h-10"
          />
        </div>
        <Button variant="outline" className="border-border hover:bg-secondary rounded-xl h-10">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" ref={tableRef}>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Reference</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium text-right">Expected</TableHead>
              <TableHead className="font-medium text-right">Counted</TableHead>
              <TableHead className="font-medium text-right">Difference</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((adj) => (
              <TableRow key={adj.id} className="stagger-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="font-mono font-medium text-foreground py-4">{adj.id}</TableCell>
                <TableCell className="text-muted-foreground">{adj.date}</TableCell>
                <TableCell className="font-medium">{adj.product}</TableCell>
                <TableCell className="text-muted-foreground">{adj.location}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{adj.expectedQty}</TableCell>
                <TableCell className="text-right font-mono font-medium">{adj.countedQty}</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  <span className={adj.difference > 0 ? "text-emerald-600" : adj.difference < 0 ? "text-rose-600" : "text-muted-foreground"}>
                    {adj.difference > 0 ? "+" : ""}{adj.difference}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(adj.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

