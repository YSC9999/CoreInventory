"use client";

import { useEffect, useRef } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { productsData } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGsapStagger } from "@/hooks/use-gsap-stagger";
import { useState } from "react";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productsData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableRef = useGsapStagger(".stagger-row", filteredProducts);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'In Stock': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">In Stock</Badge>;
      case 'Low Stock': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">Low Stock</Badge>;
      case 'Out of Stock': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">Out of Stock</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products Database</h1>
          <p className="text-muted-foreground mt-1">Manage and track all inventory items.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border rounded-xl h-10"
          />
        </div>
        <Button variant="outline" className="border-border hover:bg-secondary rounded-xl h-10">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" ref={tableRef}>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium py-4">Product Info</TableHead>
              <TableHead className="font-medium">Category</TableHead>
              <TableHead className="font-medium text-right">Stock</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">Unit Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="stagger-row border-border hover:bg-primary/5 cursor-pointer transition-colors">
                <TableCell className="py-4">
                  <div className="font-medium text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-right font-mono font-medium">{product.stock}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{product.location}</TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">${product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

