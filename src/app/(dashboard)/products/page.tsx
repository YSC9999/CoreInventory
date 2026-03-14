"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ProductStatus = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
type Uom = "UNIT" | "KG" | "LITRE" | "BOX" | "METRE";

type Category = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
  shortCode: string;
  warehouseName: string;
  warehouseCode: string;
};

type ProductStock = {
  id: string;
  locationId: string;
  locationName: string;
  locationCode: string;
  warehouseName: string;
  warehouseCode: string;
  quantity: number;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  minStock: number;
  uom: Uom;
  categoryId: string | null;
  categoryName: string;
  totalStock: number;
  status: Exclude<ProductStatus, "ALL">;
  reorderNeeded: boolean;
  stocks: ProductStock[];
};

type ProductsResponse = {
  success: boolean;
  data?: Product[];
  error?: string;
};

type MetaResponse = {
  success: boolean;
  data?: {
    categories: Category[];
    locations: Location[];
    statuses: Array<{ value: ProductStatus; label: string }>;
  };
  error?: string;
};

type CategoryResponse = {
  success: boolean;
  data?: Category;
  error?: string;
};

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  minStock: number;
  uom: Uom;
  categoryId: string;
  stocks: Record<string, number>;
};

const UOM_OPTIONS: Uom[] = ["UNIT", "KG", "LITRE", "BOX", "METRE"];

function toSafeInt(value: number | string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.trunc(parsed));
}

export default function Products() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<ProductStatus>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [form, setForm] = useState<ProductForm>({
    sku: "",
    name: "",
    description: "",
    minStock: 0,
    uom: "UNIT",
    categoryId: "none",
    stocks: {},
  });

  const statusLabels = useMemo(
    () => ({
      ALL: "All stock levels",
      IN_STOCK: "In stock",
      LOW_STOCK: "Low stock",
      OUT_OF_STOCK: "Out of stock",
    }),
    []
  );

  const resetForm = () => {
    const emptyStocks = locations.reduce<Record<string, number>>((acc, location) => {
      acc[location.id] = 0;
      return acc;
    }, {});

    setForm({
      sku: "",
      name: "",
      description: "",
      minStock: 0,
      uom: "UNIT",
      categoryId: "none",
      stocks: emptyStocks,
    });
    setNewCategoryName("");
    setEditingProductId(null);
  };

  const fetchMeta = async () => {
    const response = await fetch("/api/products/meta", { cache: "no-store" });
    const result = (await response.json()) as MetaResponse;
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.error ?? "Failed to load products metadata");
    }

    setCategories(result.data.categories);
    setLocations(result.data.locations);

    setForm((prev) => {
      const mergedStocks = { ...prev.stocks };
      for (const location of result.data!.locations) {
        if (mergedStocks[location.id] === undefined) {
          mergedStocks[location.id] = 0;
        }
      }
      return { ...prev, stocks: mergedStocks };
    });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }
      if (categoryFilter !== "ALL") {
        params.set("categoryId", categoryFilter);
      }
      if (locationFilter !== "ALL") {
        params.set("locationId", locationFilter);
      }
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const query = params.toString();
      const response = await fetch(`/api/products${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });

      const result = (await response.json()) as ProductsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "Failed to load products");
      }

      setProducts(result.data);
    } catch (error) {
      toast({
        title: "Products Error",
        description: error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchMeta();
      } catch (error) {
        toast({
          title: "Metadata Error",
          description: error instanceof Error ? error.message : "Failed to load metadata",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, locationFilter, statusFilter]);

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    const stocksByLocation = locations.reduce<Record<string, number>>((acc, location) => {
      const found = product.stocks.find((entry) => entry.locationId === location.id);
      acc[location.id] = found?.quantity ?? 0;
      return acc;
    }, {});

    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      minStock: product.minStock,
      uom: product.uom,
      categoryId: product.categoryId ?? "none",
      stocks: stocksByLocation,
    });
    setEditingProductId(product.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.sku.trim() || !form.name.trim()) {
      toast({
        title: "Validation",
        description: "SKU and name are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        minStock: toSafeInt(form.minStock),
        uom: form.uom,
        categoryId: form.categoryId === "none" ? null : form.categoryId,
        stocks: Object.entries(form.stocks).map(([locationId, quantity]) => ({
          locationId,
          quantity: toSafeInt(quantity),
        })),
      };

      const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
      const method = editingProductId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "Failed to save product");
      }

      toast({
        title: editingProductId ? "Product updated" : "Product created",
        description: "Stock and reorder data saved successfully.",
      });

      setDialogOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = (await response.json()) as CategoryResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "Failed to create category");
      }

      setCategories((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, categoryId: result.data!.id }));
      setNewCategoryName("");

      toast({ title: "Category created", description: `${result.data.name} added.` });
    } catch (error) {
      toast({
        title: "Category Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  const getStatusBadge = (status: Product["status"]) => {
    if (status === "IN_STOCK") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">In Stock</Badge>
      );
    }
    if (status === "LOW_STOCK") {
      return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">Low Stock</Badge>;
    }
    return <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/30">Out of Stock</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Create and update products, per-location stock, categories, and reorder rules.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, name, or description"
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus)}>
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.warehouseCode}/{location.shortCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="py-4">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock by Location</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Reorder At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length ? (
              products.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-primary/5">
                  <TableCell className="py-4">
                    <div className="font-medium text-foreground">{product.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {product.sku} • {product.uom}
                    </div>
                  </TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.stocks.length ? (
                        product.stocks.slice(0, 3).map((stock) => (
                          <div key={stock.id} className="text-xs text-muted-foreground">
                            {stock.warehouseCode}/{stock.locationCode}: <span className="font-mono">{stock.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No allocated stock</span>
                      )}
                      {product.stocks.length > 3 ? (
                        <span className="text-xs text-muted-foreground">+{product.stocks.length - 3} more</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">{product.totalStock}</TableCell>
                  <TableCell className="text-right font-mono">{product.minStock}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No products found for selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Update Product" : "Create Product"}</DialogTitle>
            <DialogDescription>
              Define product master data, stock per location, and reorder threshold.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
            </div>
            <div>
              <Label>Unit of Measure</Label>
              <Select value={form.uom} onValueChange={(value) => setForm((p) => ({ ...p, uom: value as Uom }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UOM_OPTIONS.map((uom) => (
                    <SelectItem key={uom} value={uom}>
                      {uom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reorder Rule (Min Stock)</Label>
              <Input
                type="number"
                min={0}
                value={form.minStock}
                onChange={(e) => setForm((p) => ({ ...p, minStock: toSafeInt(e.target.value) }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional product description"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(value) => setForm((p) => ({ ...p, categoryId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Add new category"
              />
              <Button
                type="button"
                variant="outline"
                disabled={creatingCategory || !newCategoryName.trim()}
                onClick={handleCreateCategory}
              >
                {creatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <Label>Stock Availability Per Location</Label>
            <div className="space-y-2">
              {locations.length ? (
                locations.map((location) => (
                  <div key={location.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="sm:col-span-2 text-sm text-muted-foreground">
                      {location.warehouseName} ({location.warehouseCode}) - {location.name} ({location.shortCode})
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={form.stocks[location.id] ?? 0}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          stocks: {
                            ...prev.stocks,
                            [location.id]: toSafeInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No locations found. Create warehouse locations first.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : editingProductId ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

