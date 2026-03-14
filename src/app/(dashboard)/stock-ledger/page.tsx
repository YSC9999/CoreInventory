"use client";

import { ledgerData } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

export default function StockLedger() {
  const tableRef = useGsapStagger(".stagger-row");

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'IN': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">IN</Badge>;
      case 'OUT': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">OUT</Badge>;
      case 'TRANSFER': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">TRANSFER</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Stock Ledger</h1>
        <p className="text-muted-foreground mt-1">Immutable record of all inventory movements.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" ref={tableRef}>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Transaction ID</TableHead>
              <TableHead className="font-medium">Timestamp</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">From</TableHead>
              <TableHead className="font-medium">To</TableHead>
              <TableHead className="font-medium text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {ledgerData.map((row) => (
              <TableRow key={row.id} className="stagger-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="font-mono text-muted-foreground py-4">{row.id}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.timestamp}</TableCell>
                <TableCell className="font-medium text-foreground">{row.product}</TableCell>
                <TableCell>{getTypeBadge(row.type)}</TableCell>
                <TableCell className="text-muted-foreground">{row.fromLoc}</TableCell>
                <TableCell className="text-muted-foreground">{row.toLoc}</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  <span className={row.type === 'IN' ? 'text-emerald-600' : row.type === 'OUT' ? 'text-rose-600' : ''}>
                    {row.type === 'IN' ? '+' : row.type === 'OUT' ? '-' : ''}{row.qty}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

