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
  stocks?: StockInput[];
};

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      {
        success: false,
        error: "DATABASE_URL is missing. Configure .env.local before updating products.",
      },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
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

    const existing = await prisma.item.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.stock.deleteMany({ where: { itemId: id } }),
      prisma.item.update({
        where: { id },
        data: {
          sku,
          name,
          description: description || null,
          minStock,
          uom: payload.uom ?? "UNIT",
          categoryId,
        },
      }),
      ...(stocks.filter((entry) => entry.quantity > 0).length
        ? [
          prisma.stock.createMany({
            data: stocks
              .filter((entry) => entry.quantity > 0)
              .map((entry) => ({
                itemId: id,
                locationId: entry.locationId,
                quantity: entry.quantity,
              })),
          }),
        ]
        : []),
    ]);

    return Response.json({ success: true, data: { id } });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "P2002") {
      return Response.json(
        { success: false, error: "A product with this SKU already exists in this organization." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, error: err?.message ?? "Failed to update product" },
      { status: 500 }
    );
  }
}
