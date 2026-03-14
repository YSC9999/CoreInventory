import { prisma } from "@/lib/db";

function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return false;
  }
  if (url.includes("user:password@")) {
    return false;
  }
  return true;
}

type ProductStatusFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

type StockInput = {
  locationId: string;
  quantity: number;
};

type ProductPayload = {
  sku?: string;
  name?: string;
  description?: string;
  minStock?: number;
  uom?: "UNIT" | "KG" | "LITRE" | "BOX" | "METRE";
  categoryId?: string | null;
  organizationId?: string;
  stocks?: StockInput[];
};

const DEFAULT_STATUS: ProductStatusFilter = "ALL";

function parseStatusFilter(value: string | null): ProductStatusFilter {
  if (!value) {
    return DEFAULT_STATUS;
  }

  const normalized = value.toUpperCase();
  if (
    normalized === "ALL" ||
    normalized === "IN_STOCK" ||
    normalized === "LOW_STOCK" ||
    normalized === "OUT_OF_STOCK"
  ) {
    return normalized;
  }

  return DEFAULT_STATUS;
}

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSafeInt(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.trunc(parsed));
}

function normalizeStocks(raw: unknown): StockInput[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      const locationId = toSafeString((entry as StockInput)?.locationId);
      const quantity = toSafeInt((entry as StockInput)?.quantity, 0);
      return { locationId, quantity };
    })
    .filter((entry) => entry.locationId.length > 0);
}

function getStockStatus(totalStock: number, minStock: number): ProductStatusFilter {
  if (totalStock <= 0) {
    return "OUT_OF_STOCK";
  }
  if (totalStock <= minStock) {
    return "LOW_STOCK";
  }
  return "IN_STOCK";
}

async function resolveOrganizationId(preferredOrganizationId?: string) {
  if (preferredOrganizationId) {
    return preferredOrganizationId;
  }

  const firstOrg = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!firstOrg) {
    throw new Error("No organization found. Seed or create an organization first.");
  }

  return firstOrg.id;
}

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({
      success: true,
      data: [],
      total: 0,
      warning: "DATABASE_URL is missing. Configure .env.local to enable database-backed products.",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = toSafeString(searchParams.get("q"));
    const categoryId = toSafeString(searchParams.get("categoryId"));
    const locationId = toSafeString(searchParams.get("locationId"));
    const status = parseStatusFilter(searchParams.get("status"));
    const organizationId = await resolveOrganizationId(toSafeString(searchParams.get("organizationId")));

    const items = await prisma.item.findMany({
      where: {
        organizationId,
        ...(query
          ? {
            OR: [
              { name: { contains: query } },
              { sku: { contains: query } },
              { description: { contains: query } },
            ],
          }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(locationId ? { stocks: { some: { locationId } } } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        stocks: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                shortCode: true,
                warehouse: { select: { id: true, name: true, shortCode: true } },
              },
            },
          },
          orderBy: { location: { name: "asc" } },
        },
      },
      orderBy: [{ name: "asc" }],
    });

    const mapped = items.map((item: any) => {
      const totalStock = item.stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      const computedStatus = getStockStatus(totalStock, item.minStock);

      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        minStock: item.minStock,
        uom: item.uom,
        categoryId: item.categoryId,
        categoryName: item.category?.name ?? "Uncategorized",
        totalStock,
        status: computedStatus,
        reorderNeeded: totalStock <= item.minStock,
        stocks: item.stocks.map((stock: any) => ({
          id: stock.id,
          locationId: stock.locationId,
          locationName: stock.location.name,
          locationCode: stock.location.shortCode,
          warehouseName: stock.location.warehouse.name,
          warehouseCode: stock.location.warehouse.shortCode,
          quantity: stock.quantity,
        })),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    const filteredByStatus =
      status === "ALL" ? mapped : mapped.filter((item: any) => item.status === status);

    return Response.json({
      success: true,
      data: filteredByStatus,
      total: filteredByStatus.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      {
        success: false,
        error: "DATABASE_URL is missing. Configure .env.local before creating products.",
      },
      { status: 503 }
    );
  }

  try {
    const payload = (await request.json()) as ProductPayload;

    const sku = toSafeString(payload.sku).toUpperCase();
    const name = toSafeString(payload.name);
    const description = toSafeString(payload.description);
    const minStock = toSafeInt(payload.minStock, 0);
    const categoryId = toSafeString(payload.categoryId) || null;
    const stocks = normalizeStocks(payload.stocks);

    if (!sku || !name) {
      return Response.json(
        { success: false, error: "SKU and product name are required." },
        { status: 400 }
      );
    }

    const organizationId = await resolveOrganizationId(toSafeString(payload.organizationId));

    const locationIds = [...new Set(stocks.map((entry) => entry.locationId))];
    if (locationIds.length) {
      const locationsCount = await prisma.location.count({ where: { id: { in: locationIds } } });
      if (locationsCount !== locationIds.length) {
        return Response.json(
          { success: false, error: "One or more selected locations are invalid." },
          { status: 400 }
        );
      }
    }

    const created = await prisma.item.create({
      data: {
        sku,
        name,
        description: description || null,
        minStock,
        uom: payload.uom ?? "UNIT",
        categoryId,
        organizationId,
        stocks: stocks.length
          ? {
            createMany: {
              data: stocks
                .filter((entry) => entry.quantity > 0)
                .map((entry) => ({
                  locationId: entry.locationId,
                  quantity: entry.quantity,
                })),
            },
          }
          : undefined,
      },
      select: { id: true },
    });

    return Response.json({ success: true, data: { id: created.id } }, { status: 201 });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "P2002") {
      return Response.json(
        { success: false, error: "A product with this SKU already exists in this organization." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, error: err?.message ?? "Failed to create product" },
      { status: 500 }
    );
  }
}
