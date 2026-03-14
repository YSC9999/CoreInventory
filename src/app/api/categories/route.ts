import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = await resolveOrganizationId(
      toSafeString(searchParams.get("organizationId"))
    );

    const categories = await prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = toSafeString(body?.name);
    const organizationId = await resolveOrganizationId(toSafeString(body?.organizationId));

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        organizationId,
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Category already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: err?.message ?? "Failed to create category" },
      { status: 500 }
    );
  }
}
