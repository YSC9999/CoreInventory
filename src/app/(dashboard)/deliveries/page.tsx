"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Truck } from "lucide-react";
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

type DeliveryEntry = {
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
};

export default function Deliveries() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([]);
  const [form, setForm] = useState({
    itemId: "",
    fromLocationId: "",
    quantity: 1,
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, metaRes, deliveriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/products/meta", { cache: "no-store" }),
        fetch("/api/transactions?type=OUT", { cache: "no-store" }),
      ]);

      const productsPayload = await productsRes.json();
      const metaPayload = await metaRes.json();
      const deliveriesPayload = await deliveriesRes.json();

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

      if (deliveriesRes.ok && deliveriesPayload?.success && Array.isArray(deliveriesPayload.data)) {
        setDeliveries(deliveriesPayload.data);
      }
    } catch (error) {
      toast({
        title: "Deliveries Error",
        description: error instanceof Error ? error.message : "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Shipped</Badge>;
      default: return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Done</Badge>;
    }
  };

  const handleCreateDelivery = async () => {
    if (!form.itemId || !form.fromLocationId) {
      toast({
        title: "Validation",
        description: "Product and source location are required.",
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
          type: "OUT",
          itemId: form.itemId,
          fromLocationId: form.fromLocationId,
          quantity: Math.max(1, Math.trunc(Number(form.quantity) || 1)),
          notes: form.notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Failed to create delivery");
      }

      toast({ title: "Delivery posted", description: "Stock decreased and ledger updated." });
      setDialogOpen(false);
      setForm({ itemId: "", fromLocationId: "", quantity: 1, notes: "" });
      await loadData();
    } catch (error) {
      toast({
        title: "Delivery Error",
        description: error instanceof Error ? error.message : "Failed to post delivery",
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
          <h1 className="text-3xl font-display font-bold text-foreground">Outbound Deliveries</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and shipping.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> New Delivery
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Reference</TableHead>
              <TableHead className="font-medium">Scheduled Date</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Source</TableHead>
              <TableHead className="font-medium text-center">Qty</TableHead>
              <TableHead className="font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading deliveries...
                  </span>
                </TableCell>
              </TableRow>
            ) : deliveries.length ? (
              deliveries.map((delivery) => (
                <TableRow key={delivery.id} className="border-border hover:bg-primary/5 transition-colors">
                  <TableCell className="font-mono font-medium text-foreground py-4">{delivery.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(delivery.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{delivery.item.name}</TableCell>
                  <TableCell className="font-medium">
                    {delivery.fromLocation
                      ? `${delivery.fromLocation.warehouse.shortCode}/${delivery.fromLocation.shortCode}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-center font-mono">{delivery.quantity}</TableCell>
                  <TableCell>{getStatusBadge("DONE")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No deliveries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Delivery</DialogTitle>
            <DialogDescription>
              Post outbound shipment. Stock will be reduced from selected location.
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
                  <SelectValue placeholder="Select location" />
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
                placeholder="Customer, order reference, dispatch notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDelivery} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 mr-2" /> Post Delivery
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

