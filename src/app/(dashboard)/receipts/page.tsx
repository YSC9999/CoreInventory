"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReceiptData {
  id: string;
  reference: string;
  supplier: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lines: Array<{
    id: string;
    expectedQuantity: number;
    receivedQuantity: number;
    item: {
      name: string;
      sku: string;
    };
  }>;
  createdBy: {
    name: string;
    email: string;
  };
}


export default function Receipts() {
  const { toast } = useToast();
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [warehouses, setWarehouses] = useState<Array<{id: string; name: string; shortCode: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"normal" | "kanban">("normal");
  const [statusChangeDialog, setStatusChangeDialog] = useState<{open: boolean; receiptId: string; newStatus: string}>({
    open: false,
    receiptId: "",
    newStatus: "",
  });
  const [formData, setFormData] = useState({
    supplier: "",
    warehouseId: "",
    type: "IN",
    scheduledAt: "",
    notes: "",
  });

  const statuses = ["DRAFT", "READY", "DONE"];

  useEffect(() => {
    fetchReceipts();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses");
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouses",
        variant: "destructive",
      });
    }
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/receipts");
      if (!response.ok) throw new Error("Failed to fetch receipts");
      const data = await response.json();
      setReceipts(data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch receipts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.warehouseId) {
      toast({
        title: "Error",
        description: "Please select a warehouse",
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduledAt) {
      toast({
        title: "Error",
        description: "Please enter a date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.supplier) {
      toast({
        title: "Error",
        description: "Please enter a supplier/vendor",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier: formData.supplier,
          warehouseId: formData.warehouseId,
          type: formData.type,
          scheduledAt: formData.scheduledAt,
          notes: formData.notes || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create receipt");
      }

      const newReceipt = await response.json();
      setReceipts([newReceipt, ...receipts]);
      setIsDialogOpen(false);
      setFormData({ supplier: "", warehouseId: "", type: "IN", scheduledAt: "", notes: "" });
      toast({
        title: "Success",
        description: "Receipt created successfully",
      });
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create receipt",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete receipt");
      }

      setReceipts(receipts.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Receipt deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete receipt",
        variant: "destructive",
      });
    }
  };

  const handleStatusChangeConfirm = async () => {
    try {
      const response = await fetch(`/api/receipts/${statusChangeDialog.receiptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusChangeDialog.newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      const updatedReceipt = await response.json();
      setReceipts(receipts.map((r) => (r.id === statusChangeDialog.receiptId ? updatedReceipt : r)));
      setStatusChangeDialog({ open: false, receiptId: "", newStatus: "" });
      toast({
        title: "Success",
        description: `Receipt status changed to ${statusChangeDialog.newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colorMap: Record<string, string> = {
      DONE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      READY: "bg-primary/10 text-primary border-primary/20",
      DRAFT: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    };
    return colorMap[status] || colorMap.DRAFT;
  };

  const getReceiptsByStatus = (status: string) => {
    return receipts.filter((r) => r.status === status);
  };

  const itemsCount = (receipt: ReceiptData) => receipt.lines?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Inbound Receipts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming stock from suppliers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-secondary rounded-lg p-1 border border-border">
            <Button
              size="sm"
              variant={viewMode === "normal" ? "default" : "ghost"}
              onClick={() => setViewMode("normal")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              onClick={() => setViewMode("kanban")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Receipt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Receipt</DialogTitle>
                <DialogDescription>
                  Add a new inbound receipt from a supplier
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReceipt} className="space-y-4">
                <div>
                  <Label htmlFor="warehouse">Warehouse *</Label>
                  <Select value={formData.warehouseId} onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name} ({wh.shortCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type *</Label>
                  <RadioGroup value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="IN" id="in" />
                        <Label htmlFor="in" className="font-normal cursor-pointer">IN (Inbound)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OUT" id="out" />
                        <Label htmlFor="out" className="font-normal cursor-pointer">OUT (Outbound)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier/Vendor *</Label>
                  <Input
                    id="supplier"
                    placeholder="e.g., OmniCorp"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledAt">Date *</Label>
                  <Input
                    id="scheduledAt"
                    type="date"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Receipt"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Normal List View */}
      {viewMode === "normal" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">No receipts yet</p>
              <Button onClick={() => setIsDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Receipt
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-medium py-4">Reference</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Supplier</TableHead>
                  <TableHead className="font-medium text-center">Items</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    className="border-border hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/receipts/${receipt.id}`)}
                  >
                    <TableCell
                      className="font-mono font-medium text-foreground py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {receipt.reference}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{receipt.supplier}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary border border-border text-sm font-medium">
                        {itemsCount(receipt)}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Badge className={`${getStatusBadgeColor(receipt.status)}`}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-secondary"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="bg-card border border-border rounded-lg p-4 flex flex-col h-fit"
            >
              {/* Column Header */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{status}</h2>
                  <Badge variant="outline" className="rounded-full">
                    {getReceiptsByStatus(status).length}
                  </Badge>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {getReceiptsByStatus(status).length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    No receipts
                  </div>
                ) : (
                  getReceiptsByStatus(status).map((receipt) => (
                    <div
                      key={receipt.id}
                      className="bg-secondary/30 border border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors group"
                    >
                      <div 
                        className="space-y-2"
                        onClick={() => router.push(`/receipts/${receipt.id}`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono font-bold text-sm text-foreground group-hover:text-primary transition-colors flex-1">
                            {receipt.reference}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReceipt(receipt.id);
                                }}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium">
                          {receipt.supplier}
                        </p>

                        <div className="bg-secondary/50 rounded p-2 mt-2">
                          <p className="text-xs text-muted-foreground">Total Quantity</p>
                          <p className="text-sm font-semibold text-foreground">
                            {receipt.lines.reduce((sum, line) => sum + line.expectedQuantity, 0)} units
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">
                            {itemsCount(receipt)} items
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusBadgeColor(status)}`}
                          >
                            {status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {new Date(receipt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      <Dialog
        open={statusChangeDialog.open}
        onOpenChange={(open) =>
          setStatusChangeDialog({ ...statusChangeDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Receipt Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the receipt status to{" "}
              <span className="font-semibold">{statusChangeDialog.newStatus}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStatusChangeDialog({ open: false, receiptId: "", newStatus: "" })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStatusChangeConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

