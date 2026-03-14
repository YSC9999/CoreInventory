import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        shortCode: true,
        locations: {
          select: {
            id: true,
            name: true,
            shortCode: true,
            stocks: {
              select: {
                quantity: true,
                item: {
                  select: {
                    id: true,
                    minStock: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const networkTotalUnits = warehouses.reduce((warehouseSum, warehouse) => {
      return (
        warehouseSum +
        warehouse.locations.reduce((locationSum, location) => {
          return locationSum + location.stocks.reduce((stockSum, stock) => stockSum + stock.quantity, 0);
        }, 0)
      );
    }, 0);

    const data = warehouses.map((warehouse) => {
      const itemTotals = new Map<string, { quantity: number; minStock: number }>();
      const locationTotals = warehouse.locations.map((location) => {
        const totalUnits = location.stocks.reduce((sum, stock) => {
          const current = itemTotals.get(stock.item.id);
          itemTotals.set(stock.item.id, {
            quantity: (current?.quantity ?? 0) + stock.quantity,
            minStock: stock.item.minStock,
          });
          return sum + stock.quantity;
        }, 0);

        return {
          id: location.id,
          name: location.name,
          shortCode: location.shortCode,
          totalUnits,
        };
      });

      const totalUnits = locationTotals.reduce((sum, location) => sum + location.totalUnits, 0);
      const uniqueSkuCount = [...itemTotals.values()].filter((item) => item.quantity > 0).length;
      const lowStockItems = [...itemTotals.values()].filter(
        (item) => item.quantity > 0 && item.quantity <= item.minStock
      ).length;
      const activeLocationCount = locationTotals.filter((location) => location.totalUnits > 0).length;
      const stockSharePct = networkTotalUnits > 0 ? (totalUnits / networkTotalUnits) * 100 : 0;
      const status = totalUnits === 0 ? "Idle" : lowStockItems > 0 ? "Warning" : "Active";

      return {
        id: warehouse.id,
        name: warehouse.name,
        shortCode: warehouse.shortCode,
        locationCount: warehouse.locations.length,
        activeLocationCount,
        uniqueSkuCount,
        totalUnits,
        lowStockItems,
        stockSharePct,
        status,
        topLocations: locationTotals.sort((a, b) => b.totalUnits - a.totalUnits).slice(0, 3),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses", details: String(error) },
      { status: 500 }
    );
  }
}
