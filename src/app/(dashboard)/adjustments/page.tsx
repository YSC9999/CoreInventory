"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type AdjustmentEntry = {
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

export default function Adjustments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [entries, setEntries] = useState<AdjustmentEntry[]>([]);
  const [form, setForm] = useState({
    itemId: "",
    locationId: "",
    countedQuantity: 0,
    notes: "",
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, metaRes, adjustmentsRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/products/meta", { cache: "no-store" }),
        fetch("/api/transactions?type=ADJUSTMENT", { cache: "no-store" }),
      ]);

      const productsPayload = await productsRes.json();
      const metaPayload = await metaRes.json();
      const adjustmentsPayload = await adjustmentsRes.json();

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

      if (adjustmentsRes.ok && adjustmentsPayload?.success && Array.isArray(adjustmentsPayload.data)) {
        setEntries(adjustmentsPayload.data);
      }
    } catch (error) {
      toast({
        title: "Adjustments Error",
        description: error instanceof Error ? error.message : "Failed to load adjustments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const q = searchTerm.toLowerCase();
    return (
      entry.item.name.toLowerCase().includes(q) ||
      entry.item.sku.toLowerCase().includes(q) ||
      entry.id.toLowerCase().includes(q)
    );
  });

  const handleCreateAdjustment = async () => {
    if (!form.itemId || !form.locationId) {
      toast({
        title: "Validation",
        description: "Product and location are required.",
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
          type: "ADJUSTMENT",
          itemId: form.itemId,
          locationId: form.locationId,
          countedQuantity: Number(form.countedQuantity),
          notes: form.notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Failed to create adjustment");
      }

      toast({
        title: "Adjustment Completed",
        description: "Stock updated and movement logged.",
      });

      setForm({ itemId: "", locationId: "", countedQuantity: 0, notes: "" });
      setIsDialogOpen(false);
      await loadInitialData();
    } catch (error) {
      toast({
        title: "Adjustment Error",
        description: error instanceof Error ? error.message : "Failed to process adjustment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Inventory Adjustment</h1>
          <p className="text-muted-foreground mt-1">Reconcile physical stock with system records.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl" onClick={() => setIsDialogOpen(true)}>
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
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Reference</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium text-right">Difference</TableHead>
              <TableHead className="font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading adjustments...
                  </span>
                </TableCell>
              </TableRow>
            ) : filteredEntries.length ? (
              filteredEntries.map((adj) => (
                <TableRow key={adj.id} className="border-border hover:bg-primary/5 transition-colors">
                  <TableCell className="font-mono font-medium text-foreground py-4">{adj.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{adj.item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {adj.fromLocation
                      ? `${adj.fromLocation.warehouse.shortCode}/${adj.fromLocation.shortCode}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    <span className={adj.quantity > 0 ? "text-emerald-600" : adj.quantity < 0 ? "text-rose-600" : "text-muted-foreground"}>
                      {adj.quantity > 0 ? "+" : ""}
                      {adj.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Done</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No adjustments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Adjustment</DialogTitle>
            <DialogDescription>
              Enter counted quantity for a product at a location. System stock will be reconciled and logged.
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
              <Label>Location</Label>
              <Select value={form.locationId} onValueChange={(value) => setForm((prev) => ({ ...prev, locationId: value }))}>
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
              <Label>Counted Quantity</Label>
              <Input
                type="number"
                min={0}
                value={form.countedQuantity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    countedQuantity: Math.max(0, Math.trunc(Number(e.target.value) || 0)),
                  }))
                }
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Reason, discrepancy details, physical count reference..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdjustment} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Apply Adjustment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

