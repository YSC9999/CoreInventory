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

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
      data: {
        categories: [],
        locations: [],
        statuses: [
          { value: "ALL", label: "All stock levels" },
          { value: "IN_STOCK", label: "In stock" },
          { value: "LOW_STOCK", label: "Low stock" },
          { value: "OUT_OF_STOCK", label: "Out of stock" },
        ],
      },
      warning: "DATABASE_URL is missing. Configure .env.local to enable database-backed filters.",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const organizationId = await resolveOrganizationId(toSafeString(searchParams.get("organizationId")));

    const [categories, locations] = await Promise.all([
      prisma.category.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.location.findMany({
        orderBy: [{ warehouse: { name: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          shortCode: true,
          warehouse: { select: { id: true, name: true, shortCode: true } },
        },
      }),
    ]);

    return Response.json({
      success: true,
      data: {
        categories,
        locations: locations.map((location: any) => ({
          id: location.id,
          name: location.name,
          shortCode: location.shortCode,
          warehouseName: location.warehouse.name,
          warehouseCode: location.warehouse.shortCode,
        })),
        statuses: [
          { value: "ALL", label: "All stock levels" },
          { value: "IN_STOCK", label: "In stock" },
          { value: "LOW_STOCK", label: "Low stock" },
          { value: "OUT_OF_STOCK", label: "Out of stock" },
        ],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product filters";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
