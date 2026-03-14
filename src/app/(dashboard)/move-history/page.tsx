"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Entry = {
  id: string;
  reference: string;
  createdAt: string;
  type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  notes: string | null;
  item: { id: string; name: string; sku: string };
  fromLocation: {
    id: string;
    name: string;
    shortCode: string;
    warehouse: { id: string; name: string; shortCode: string };
  } | null;
  toLocation: {
    id: string;
    name: string;
    shortCode: string;
    warehouse: { id: string; name: string; shortCode: string };
  } | null;
};

export default function MoveHistory() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.set("q", searchTerm.trim());
        }
        if (typeFilter !== "ALL") {
          params.set("type", typeFilter);
        }

        const response = await fetch(`/api/transactions${params.toString() ? `?${params.toString()}` : ""}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
          throw new Error(payload?.error ?? "Failed to fetch movement history");
        }

        setEntries(payload.data);
      } catch (error) {
        toast({
          title: "History Error",
          description: error instanceof Error ? error.message : "Failed to load move history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, toast]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">RECEIPT</Badge>;
      case 'OUT': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">DELIVERY</Badge>;
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
          <Button
            variant="outline"
            className="border-border hover:bg-secondary rounded-xl h-10"
            onClick={() => setTypeFilter("ALL")}
          >
            <Filter className="w-4 h-4 mr-2" /> {typeFilter === "ALL" ? "All Types" : typeFilter}
          </Button>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setTypeFilter("IN")}>Receipts</Button>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setTypeFilter("OUT")}>Deliveries</Button>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setTypeFilter("TRANSFER")}>Transfers</Button>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setTypeFilter("ADJUSTMENT")}>Adjustments</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading movement history...
                  </span>
                </TableCell>
              </TableRow>
            ) : entries.length ? (
              entries.map((move) => (
                <TableRow key={move.id} className="border-border hover:bg-primary/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="font-mono text-foreground font-medium">{move.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{move.reference}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(move.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{getTypeBadge(move.type)}</TableCell>
                  <TableCell className="font-medium">{move.item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {move.fromLocation
                      ? `${move.fromLocation.warehouse.shortCode}/${move.fromLocation.shortCode}`
                      : "External"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {move.toLocation
                      ? `${move.toLocation.warehouse.shortCode}/${move.toLocation.shortCode}`
                      : "External"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">{move.quantity}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">System</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No movement records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

