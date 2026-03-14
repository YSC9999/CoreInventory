"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus, Trash2, Printer } from "lucide-react";

interface ReceiptDetail {
  id: string;
  reference: string;
  supplier: string;
  type: string;
  status: string;
  notes?: string;
  warehouse?: {
    name: string;
    shortCode: string;
  };
  createdAt: string;
  updatedAt: string;
  lines: Array<{
    id: string;
    expectedQuantity: number;
    receivedQuantity: number;
    item?: {
      name: string;
      sku: string;
    };
  }>;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function ReceiptDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    newStatus: string;
  }>({
    open: false,
    newStatus: "",
  });
  const [formData, setFormData] = useState({
    supplier: "",
    notes: "",
    scheduledAt: "",
  });

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/receipts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch receipt");
      const data = await response.json();
      setReceipt(data);
      setFormData({
        supplier: data.supplier,
        notes: data.notes || "",
        scheduledAt: data.scheduledAt ? data.scheduledAt.split("T")[0] : "",
      });
    } catch (error) {
      console.error("Error fetching receipt:", error);
      toast({
        title: "Error",
        description: "Failed to load receipt details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusChangeDialog({
      open: true,
      newStatus,
    });
  };

  const handleStatusChangeConfirm = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/receipts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusChangeDialog.newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updated = await response.json();
      setReceipt(updated);
      setStatusChangeDialog({ open: false, newStatus: "" });
      toast({
        title: "Success",
        description: `Receipt status changed to ${statusChangeDialog.newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Receipt not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const statusFlow = ["DRAFT", "READY", "DONE"];
  const currentStatusIndex = statusFlow.indexOf(receipt.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {receipt.reference}
          </h1>
          <p className="text-muted-foreground mt-1">
            Receipt from {receipt.supplier}
          </p>
        </div>
        <Badge className="text-lg py-2 px-4">{receipt.status}</Badge>
      </div>

      {/* Status Workflow */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Status Workflow</h2>
        <div className="flex gap-2">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <Button
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating || index < currentStatusIndex}
                variant={
                  status === receipt.status
                    ? "default"
                    : index < currentStatusIndex
                    ? "secondary"
                    : "outline"
                }
              >
                {status}
              </Button>
              {index < statusFlow.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <Label>Supplier</Label>
            <p className="text-lg font-medium mt-1">{receipt.supplier}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Warehouse</Label>
              <p className="text-sm font-medium mt-1">
                {receipt.warehouse?.name} ({receipt.warehouse?.shortCode})
              </p>
            </div>
            <div>
              <Label>Type</Label>
              <Badge className={receipt.type === 'IN' ? 'bg-blue-500' : 'bg-amber-500'} >
                {receipt.type} {receipt.type === 'IN' ? '(Inbound)' : '(Outbound)'}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Receive From</Label>
            <Input
              placeholder="Vendor/Supplier location"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>Schedule Date</Label>
            <Input
              type="date"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({ ...formData, scheduledAt: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>Responsible</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {receipt.createdBy.name} ({receipt.createdBy.email})
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              className="mt-1 h-24"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2 flex-1"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Products</h2>

        {receipt.lines.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>No products added yet</p>
            <Button variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Expected Qty</TableHead>
                  <TableHead className="text-right">Received Qty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.lines.map((line) => (
                  <TableRow key={line.id} className="hover:bg-secondary/5">
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {line.item?.name || "Unknown Product"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {line.item?.sku || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {line.expectedQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {line.receivedQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button variant="outline" className="mt-4 gap-2 w-full">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </>
        )}
      </div>

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
                setStatusChangeDialog({ open: false, newStatus: "" })
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
