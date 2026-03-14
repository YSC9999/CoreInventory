"use client";

import { useState } from "react";
import { moveHistoryData } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar } from "lucide-react";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

export default function MoveHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useGsapStagger(".stagger-row");

  const filteredData = moveHistoryData.filter(item => 
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'RECEIPT': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">RECEIPT</Badge>;
      case 'DELIVERY': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">DELIVERY</Badge>;
      case 'TRANSFER': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">TRANSFER</Badge>;
      case 'ADJUSTMENT': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">ADJUSTMENT</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Move History</h1>
          <p className="text-muted-foreground mt-1">Detailed audit log of all physical inventory movements.</p>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by product or reference..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border rounded-xl h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border hover:bg-secondary rounded-xl h-10">
            <Calendar className="w-4 h-4 mr-2" /> Date Range
          </Button>
          <Button variant="outline" className="border-border hover:bg-secondary rounded-xl h-10">
            <Filter className="w-4 h-4 mr-2" /> Type
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" ref={tableRef}>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">ID / Ref</TableHead>
              <TableHead className="font-medium">Date & Time</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">From</TableHead>
              <TableHead className="font-medium">To</TableHead>
              <TableHead className="font-medium text-right">Qty</TableHead>
              <TableHead className="font-medium">Operator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((move) => (
              <TableRow key={move.id} className="stagger-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="py-4">
                  <div className="font-mono text-foreground font-medium">{move.id}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{move.reference}</div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{move.dateTime}</TableCell>
                <TableCell>{getTypeBadge(move.type)}</TableCell>
                <TableCell className="font-medium">{move.product}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{move.fromWarehouse}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{move.toWarehouse}</TableCell>
                <TableCell className="text-right font-mono font-medium">{move.qty}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{move.operator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

