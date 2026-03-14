"use client";

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowRightLeft,
    ArrowUpFromLine,
    Package,
} from "lucide-react";
import { gsap } from "@/lib/gsap-setup";
import { KPICard } from "@/components/dashboard/KPICard";
import { MovementChart, CategoryChart } from "@/components/dashboard/Charts";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type ProductStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
type DashboardFilter = "ALL" | "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";

type ProductSummary = {
    id: string;
    name: string;
    sku: string;
    totalStock: number;
    categoryName: string;
    status: ProductStatus;
};

type ReceiptSummary = {
    id: string;
    status: string;
};

type TransactionSummary = {
    id: string;
    reference: string;
    type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
    quantity: number;
    createdAt: string;
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

type OverviewProps = {
    title?: string;
    description?: string;
    showHero?: boolean;
};

const Hero3D = lazy(() => import("@/components/dashboard/Hero3D"));

export function DashboardOverview({
    title = "Dashboard",
    description = "Live snapshot of stock, movements, and pending operations.",
    showHero = true,
}: OverviewProps) {
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
    const [filter, setFilter] = useState<DashboardFilter>("ALL");
    const [pendingReceipts, setPendingReceipts] = useState(0);

    useEffect(() => {
        const loadSummary = async () => {
            try {
                const [productsRes, receiptsRes, transactionsRes] = await Promise.all([
                    fetch("/api/products", { cache: "no-store" }),
                    fetch("/api/receipts", { cache: "no-store" }),
                    fetch("/api/transactions", { cache: "no-store" }),
                ]);

                const productsPayload = await productsRes.json();
                const receiptsPayload = await receiptsRes.json();
                const transactionsPayload = await transactionsRes.json();

                if (productsRes.ok && productsPayload?.success && Array.isArray(productsPayload.data)) {
                    setProducts(productsPayload.data);
                }

                if (receiptsRes.ok && Array.isArray(receiptsPayload)) {
                    const pending = (receiptsPayload as ReceiptSummary[]).filter(
                        (entry) => entry.status !== "DONE" && entry.status !== "CANCELED"
                    ).length;
                    setPendingReceipts(pending);
                }

                if (
                    transactionsRes.ok &&
                    transactionsPayload?.success &&
                    Array.isArray(transactionsPayload.data)
                ) {
                    setTransactions(transactionsPayload.data);
                }
            } catch (error) {
                toast({
                    title: "Dashboard warning",
                    description: error instanceof Error ? error.message : "Failed to load live dashboard data",
                    variant: "destructive",
                });
            }
        };

        loadSummary();
    }, [toast]);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.from(".kpi-card", {
                y: 30,
                opacity: 0,
                scale: 0.9,
                stagger: 0.1,
                duration: 0.6,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: ".kpi-grid",
                    start: "top 85%",
                },
            });

            gsap.from(".charts-section > div", {
                x: (index) => (index === 0 ? -50 : 50),
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".charts-section",
                    start: "top 80%",
                },
            });

            gsap.from(".status-table", {
                y: 40,
                opacity: 0,
                duration: 0.6,
                scrollTrigger: {
                    trigger: ".status-table",
                    start: "top 85%",
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const totalStockUnits = useMemo(
        () => products.reduce((sum, product) => sum + product.totalStock, 0),
        [products]
    );

    const deliveriesCount = useMemo(
        () => transactions.filter((entry) => entry.type === "OUT").length,
        [transactions]
    );

    const transfersCount = useMemo(
        () => transactions.filter((entry) => entry.type === "TRANSFER").length,
        [transactions]
    );

    const lowOrOutCount = useMemo(
        () => products.filter((product) => product.status !== "IN_STOCK").length,
        [products]
    );

    const lowStockItems = useMemo(
        () => [...products].sort((a, b) => a.totalStock - b.totalStock).slice(0, 5),
        [products]
    );

    const filteredTransactions = useMemo(() => {
        if (filter === "ALL") {
            return transactions;
        }

        const map: Record<Exclude<DashboardFilter, "ALL">, TransactionSummary["type"]> = {
            RECEIPT: "IN",
            DELIVERY: "OUT",
            TRANSFER: "TRANSFER",
            ADJUSTMENT: "ADJUSTMENT",
        };

        return transactions.filter((entry) => entry.type === map[filter]);
    }, [transactions, filter]);

    const movementData = useMemo(() => {
        const buckets: Record<string, { in: number; out: number }> = {};
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            buckets[key] = { in: 0, out: 0 };
        }

        for (const entry of filteredTransactions) {
            const key = entry.createdAt.slice(0, 10);
            if (!buckets[key]) {
                continue;
            }

            if (entry.type === "IN") {
                buckets[key].in += entry.quantity;
            }

            if (entry.type === "OUT") {
                buckets[key].out += entry.quantity;
            }
        }

        return Object.entries(buckets).map(([key, value]) => ({
            name: new Date(key).toLocaleDateString(undefined, { weekday: "short" }),
            in: value.in,
            out: value.out,
        }));
    }, [filteredTransactions]);

    const categoryChartData = useMemo(() => {
        const grouped = new Map<string, number>();
        for (const product of products) {
            const category = product.categoryName || "Uncategorized";
            grouped.set(category, (grouped.get(category) ?? 0) + product.totalStock);
        }

        return [...grouped.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [products]);

    const activityRows = useMemo(() => {
        return filteredTransactions.slice(0, 10).map((entry) => {
            const movement: "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT" =
                entry.type === "IN" ? "RECEIPT" : entry.type === "OUT" ? "DELIVERY" : entry.type;

            return {
                id: entry.id,
                time: new Date(entry.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                product: entry.item.name,
                movement,
                from: entry.fromLocation
                    ? `${entry.fromLocation.warehouse.shortCode}/${entry.fromLocation.shortCode}`
                    : "External",
                to: entry.toLocation
                    ? `${entry.toLocation.warehouse.shortCode}/${entry.toLocation.shortCode}`
                    : "External",
                qty: entry.quantity,
            };
        });
    }, [filteredTransactions]);

    const filterButtons: Array<{ label: string; value: DashboardFilter }> = [
        { label: "All Activity", value: "ALL" },
        { label: "Receipts", value: "RECEIPT" },
        { label: "Deliveries", value: "DELIVERY" },
        { label: "Transfers", value: "TRANSFER" },
        { label: "Adjustments", value: "ADJUSTMENT" },
    ];

    return (
        <div className="p-6 space-y-8" ref={containerRef}>
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-1">{description}</p>
            </div>

            {showHero ? (
                <Suspense fallback={<div className="w-full h-[300px] rounded-3xl bg-card border border-border animate-pulse shadow-sm" />}>
                    <Hero3D />
                </Suspense>
            ) : null}

            <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="kpi-card">
                    <KPICard title="Total Stock Units" value={totalStockUnits} trend="Live" isPositive={true} icon={Package} />
                </div>
                <div className="kpi-card">
                    <KPICard title="Low/Out Stock Items" value={lowOrOutCount} trend="Live" isPositive={false} icon={AlertTriangle} />
                </div>
                <div className="kpi-card">
                    <KPICard title="Pending Receipts" value={pendingReceipts} trend="Open" isPositive={pendingReceipts === 0} icon={ArrowDownToLine} />
                </div>
                <div className="kpi-card">
                    <KPICard title="Pending Deliveries" value={deliveriesCount} trend="Live" isPositive={deliveriesCount === 0} icon={ArrowUpFromLine} />
                </div>
                <div className="kpi-card">
                    <KPICard title="Internal Transfers" value={transfersCount} trend="Live" isPositive={true} icon={ArrowRightLeft} />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 quick-filters">
                {filterButtons.map((entry) => (
                    <Button
                        key={entry.value}
                        variant={filter === entry.value ? "secondary" : "outline"}
                        onClick={() => setFilter(entry.value)}
                        className={
                            filter === entry.value
                                ? "rounded-full shadow-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                : "rounded-full bg-card shadow-sm border-border hover:bg-secondary"
                        }
                    >
                        {entry.label}
                    </Button>
                ))}
            </div>

            <div className="charts-section grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MovementChart data={movementData} />
                </div>
                <div className="lg:col-span-1">
                    <CategoryChart data={categoryChartData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityTable data={activityRows} />
                </div>
                <div className="lg:col-span-1 status-table">
                    <div className="bg-card border border-border shadow-sm rounded-2xl p-6 h-full">
                        <h3 className="text-lg font-semibold text-foreground mb-1">Critical Inventory</h3>
                        <p className="text-sm text-muted-foreground mb-4">Items requiring immediate attention</p>

                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead className="py-2 h-auto text-xs">Product</TableHead>
                                        <TableHead className="py-2 h-auto text-xs text-right">Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockItems.map((item) => (
                                        <TableRow key={item.id} className="border-border/50 hover:bg-primary/5 transition-colors">
                                            <TableCell className="py-3">
                                                <div className="font-medium text-sm flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <span className="font-mono text-rose-600 font-semibold">{item.totalStock}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!lowStockItems.length ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                                                No shortage data yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </TableBody>
                            </Table>
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10">
                            View All Shortages
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}