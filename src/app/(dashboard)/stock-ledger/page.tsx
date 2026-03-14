"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";

type LedgerRow = {
  id: string;
  reference: string;
  createdAt: string;
  quantity: number;
  type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
  notes: string | null;
  item: {
    id: string;
    name: string;
    sku: string;
  };
  fromLocation: {
    id: string;
    name: string;
    shortCode: string;
    warehouse: {
      id: string;
      name: string;
      shortCode: string;
    };
  } | null;
  toLocation: {
    id: string;
    name: string;
    shortCode: string;
    warehouse: {
      id: string;
      name: string;
      shortCode: string;
    };
  } | null;
};

export default function StockLedger() {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useGsapStagger(".stagger-row", `${type}:${query}:${rows.length}`);

  useEffect(() => {
    let active = true;

    async function loadRows() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query.trim()) {
          params.set("q", query.trim());
        }
        if (type !== "ALL") {
          params.set("type", type);
        }

        const response = await fetch(`/api/transactions?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to load stock ledger");
        }

        if (active) {
          setRows(Array.isArray(payload.data) ? payload.data : []);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load stock ledger");
          setRows([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRows();

    return () => {
      active = false;
    };
  }, [query, type]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">IN</Badge>;
      case 'OUT': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">OUT</Badge>;
      case 'TRANSFER': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">TRANSFER</Badge>;
      case 'ADJUSTMENT': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">ADJUSTMENT</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatLocation = (location: LedgerRow["fromLocation"] | LedgerRow["toLocation"]) => {
    if (!location) {
      return "External";
    }

    return `${location.warehouse.shortCode}/${location.shortCode}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Stock Ledger</h1>
        <p className="text-muted-foreground mt-1">Immutable record of all inventory movements.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by SKU, product, or notes"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by movement type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All movements</SelectItem>
            <SelectItem value="IN">Receipts</SelectItem>
            <SelectItem value="OUT">Deliveries</SelectItem>
            <SelectItem value="TRANSFER">Transfers</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
          </SelectContent>
        </Select>
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
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell colSpan={7} className="py-4">
                    <div className="h-6 w-full animate-pulse rounded bg-secondary/50" />
                  </TableCell>
                </TableRow>
              ))
            ) : null}

            {!loading && error ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-rose-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && !error && rows.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No ledger entries match the current filters.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && !error && rows.map((row) => (
              <TableRow key={row.id} className="stagger-row border-border hover:bg-primary/5 transition-colors">
                <TableCell className="font-mono text-muted-foreground py-4">{row.reference || row.id}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.createdAt).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  <div>{row.item.name}</div>
                  <div className="text-xs text-muted-foreground">{row.item.sku}</div>
                </TableCell>
                <TableCell>{getTypeBadge(row.type)}</TableCell>
                <TableCell className="text-muted-foreground">{formatLocation(row.fromLocation)}</TableCell>
                <TableCell className="text-muted-foreground">{formatLocation(row.toLocation)}</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  <span className={row.type === 'IN' ? 'text-emerald-600' : row.type === 'OUT' ? 'text-rose-600' : row.type === 'ADJUSTMENT' ? 'text-amber-600' : ''}>
                    {row.type === 'IN' ? '+' : row.type === 'OUT' ? '-' : row.quantity > 0 ? '+' : ''}{row.quantity}
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

