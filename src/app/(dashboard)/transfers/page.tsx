"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: string;
  name: string;
  sku: string;
};

type Location = {
  id: string;
  name: string;
  shortCode: string;
  warehouseName: string;
  warehouseCode: string;
};

type TransferEntry = {
  id: string;
  createdAt: string;
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

export default function Transfers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [transfers, setTransfers] = useState<TransferEntry[]>([]);
  const [form, setForm] = useState({
    itemId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: 1,
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, metaRes, transfersRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/products/meta", { cache: "no-store" }),
        fetch("/api/transactions?type=TRANSFER", { cache: "no-store" }),
      ]);

      const productsPayload = await productsRes.json();
      const metaPayload = await metaRes.json();
      const transfersPayload = await transfersRes.json();

      if (productsRes.ok && productsPayload?.success && Array.isArray(productsPayload.data)) {
        setProducts(
          productsPayload.data.map((entry: any) => ({
            id: entry.id,
            name: entry.name,
            sku: entry.sku,
          }))
        );
      }

      if (metaRes.ok && metaPayload?.success && metaPayload?.data?.locations) {
        setLocations(metaPayload.data.locations);
      }

      if (transfersRes.ok && transfersPayload?.success && Array.isArray(transfersPayload.data)) {
        setTransfers(transfersPayload.data);
      }
    } catch (error) {
      toast({
        title: "Transfers Error",
        description: error instanceof Error ? error.message : "Failed to load transfers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransfer = async () => {
    if (!form.itemId || !form.fromLocationId || !form.toLocationId) {
      toast({
        title: "Validation",
        description: "Item, source, and destination locations are required.",
        variant: "destructive",
      });
      return;
    }

    if (form.fromLocationId === form.toLocationId) {
      toast({
        title: "Validation",
        description: "Source and destination must be different.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSFER",
          itemId: form.itemId,
          fromLocationId: form.fromLocationId,
          toLocationId: form.toLocationId,
          quantity: Math.max(1, Math.trunc(Number(form.quantity) || 1)),
          notes: form.notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Failed to create transfer");
      }

      toast({ title: "Transfer completed", description: "Stock moved and logged." });
      setDialogOpen(false);
      setForm({ itemId: "", fromLocationId: "", toLocationId: "", quantity: 1, notes: "" });
      await loadData();
    } catch (error) {
      toast({
        title: "Transfer Error",
        description: error instanceof Error ? error.message : "Failed to create transfer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Internal Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage stock movement between facilities.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl" onClick={() => setDialogOpen(true)}>
          <ArrowRightLeft className="w-4 h-4 mr-2" /> New Transfer
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Reference</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">From Warehouse</TableHead>
              <TableHead className="font-medium">To Warehouse</TableHead>
              <TableHead className="font-medium text-center">Qty</TableHead>
              <TableHead className="font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading transfers...
                  </span>
                </TableCell>
              </TableRow>
            ) : transfers.length ? (
              transfers.map((transfer) => (
                <TableRow key={transfer.id} className="border-border hover:bg-primary/5 transition-colors">
                  <TableCell className="font-mono font-medium text-foreground py-4">{transfer.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(transfer.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{transfer.item.name}</TableCell>
                  <TableCell className="font-medium">
                    {transfer.fromLocation
                      ? `${transfer.fromLocation.warehouse.shortCode}/${transfer.fromLocation.shortCode}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transfer.toLocation
                      ? `${transfer.toLocation.warehouse.shortCode}/${transfer.toLocation.shortCode}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-center font-mono">{transfer.quantity}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Done</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No transfers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transfer</DialogTitle>
            <DialogDescription>
              Move stock from one location to another. Movement is logged in stock ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select value={form.itemId} onValueChange={(value) => setForm((prev) => ({ ...prev, itemId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Location</Label>
              <Select
                value={form.fromLocationId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, fromLocationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.warehouseCode}/{location.shortCode} - {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To Location</Label>
              <Select
                value={form.toLocationId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, toLocationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.warehouseCode}/{location.shortCode} - {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Math.max(1, Math.trunc(Number(e.target.value) || 1)),
                  }))
                }
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Reference, reason, instructions..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTransfer} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Create Transfer"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

