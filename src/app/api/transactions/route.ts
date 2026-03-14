import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["IN", "OUT", "TRANSFER", "ADJUSTMENT"] as const;
type MovementType = (typeof ALLOWED_TYPES)[number];

type MovementPayload = {
    type?: MovementType;
    itemId?: string;
    quantity?: number;
    fromLocationId?: string;
    toLocationId?: string;
    locationId?: string;
    countedQuantity?: number;
    notes?: string;
};

function toSafeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function toSafeInt(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    return Math.trunc(parsed);
}

function generateReference(type: string) {
    const ts = new Date();
    const stamp = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, "0")}${String(
        ts.getDate()
    ).padStart(2, "0")}${String(ts.getHours()).padStart(2, "0")}${String(ts.getMinutes()).padStart(2, "0")}${String(
        ts.getSeconds()
    ).padStart(2, "0")}`;
    return `${type}-${stamp}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = toSafeString(searchParams.get("q"));
        const type = toSafeString(searchParams.get("type"));

        const where = {
            ...(type && ALLOWED_TYPES.includes(type as MovementType)
                ? { type: type as MovementType }
                : {}),
            ...(q
                ? {
                    OR: [
                        { notes: { contains: q } },
                        { item: { name: { contains: q } } },
                        { item: { sku: { contains: q } } },
                    ],
                }
                : {}),
        };

        const entries = await prisma.transaction.findMany({
            where,
            include: {
                item: { select: { id: true, name: true, sku: true } },
                fromLocation: {
                    select: {
                        id: true,
                        name: true,
                        shortCode: true,
                        warehouse: { select: { id: true, name: true, shortCode: true } },
                    },
                },
                toLocation: {
                    select: {
                        id: true,
                        name: true,
                        shortCode: true,
                        warehouse: { select: { id: true, name: true, shortCode: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 300,
        });

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as MovementPayload;
        const type = body.type;

        if (!type || !ALLOWED_TYPES.includes(type)) {
            return NextResponse.json(
                { success: false, error: "Invalid transaction type" },
                { status: 400 }
            );
        }

        const itemId = toSafeString(body.itemId);
        if (!itemId) {
            return NextResponse.json(
                { success: false, error: "itemId is required" },
                { status: 400 }
            );
        }

        const item = await prisma.item.findUnique({
            where: { id: itemId },
            select: { id: true, organizationId: true },
        });

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        const notes = toSafeString(body.notes) || null;
        const reference = generateReference(type);

        if (type === "ADJUSTMENT") {
            const locationId = toSafeString(body.locationId || body.toLocationId);
            if (!locationId) {
                return NextResponse.json(
                    { success: false, error: "locationId is required for adjustment" },
                    { status: 400 }
                );
            }

            const counted = Math.max(0, toSafeInt(body.countedQuantity));

            const stock = await prisma.stock.findUnique({
                where: {
                    itemId_locationId: {
                        itemId,
                        locationId,
                    },
                },
                select: { quantity: true },
            });

            const previous = stock?.quantity ?? 0;
            const delta = counted - previous;

            await prisma.stock.upsert({
                where: {
                    itemId_locationId: {
                        itemId,
                        locationId,
                    },
                },
                update: { quantity: counted },
                create: {
                    itemId,
                    locationId,
                    quantity: counted,
                },
            });

            const transaction = await prisma.transaction.create({
                data: {
                    reference,
                    itemId,
                    type,
                    quantity: delta,
                    fromLocationId: locationId,
                    toLocationId: locationId,
                    notes,
                },
                include: {
                    item: { select: { id: true, name: true, sku: true } },
                    fromLocation: {
                        select: {
                            id: true,
                            name: true,
                            shortCode: true,
                            warehouse: { select: { id: true, name: true, shortCode: true } },
                        },
                    },
                    toLocation: {
                        select: {
                            id: true,
                            name: true,
                            shortCode: true,
                            warehouse: { select: { id: true, name: true, shortCode: true } },
                        },
                    },
                },
            });

            return NextResponse.json({ success: true, data: transaction }, { status: 201 });
        }

        const quantity = Math.max(0, toSafeInt(body.quantity));
        if (quantity <= 0) {
            return NextResponse.json(
                { success: false, error: "quantity must be greater than zero" },
                { status: 400 }
            );
        }

        const fromLocationId = toSafeString(body.fromLocationId);
        const toLocationId = toSafeString(body.toLocationId);

        if (type === "IN") {
            if (!toLocationId) {
                return NextResponse.json(
                    { success: false, error: "toLocationId is required for IN" },
                    { status: 400 }
                );
            }

            await prisma.stock.upsert({
                where: { itemId_locationId: { itemId, locationId: toLocationId } },
                update: { quantity: { increment: quantity } },
                create: { itemId, locationId: toLocationId, quantity },
            });
        }

        if (type === "OUT" || type === "TRANSFER") {
            if (!fromLocationId) {
                return NextResponse.json(
                    { success: false, error: "fromLocationId is required" },
                    { status: 400 }
                );
            }

            const fromStock = await prisma.stock.findUnique({
                where: { itemId_locationId: { itemId, locationId: fromLocationId } },
                select: { quantity: true },
            });

            const available = fromStock?.quantity ?? 0;
            if (available < quantity) {
                return NextResponse.json(
                    { success: false, error: `Insufficient stock. Available: ${available}` },
                    { status: 400 }
                );
            }

            await prisma.stock.update({
                where: { itemId_locationId: { itemId, locationId: fromLocationId } },
                data: { quantity: { decrement: quantity } },
            });
        }

        if (type === "TRANSFER") {
            if (!toLocationId) {
                return NextResponse.json(
                    { success: false, error: "toLocationId is required for transfer" },
                    { status: 400 }
                );
            }

            if (toLocationId === fromLocationId) {
                return NextResponse.json(
                    { success: false, error: "from and to locations must be different" },
                    { status: 400 }
                );
            }

            await prisma.stock.upsert({
                where: { itemId_locationId: { itemId, locationId: toLocationId } },
                update: { quantity: { increment: quantity } },
                create: { itemId, locationId: toLocationId, quantity },
            });
        }

        const transaction = await prisma.transaction.create({
            data: {
                reference,
                itemId,
                type,
                quantity,
                fromLocationId: fromLocationId || null,
                toLocationId: toLocationId || null,
                notes,
            },
            include: {
                item: { select: { id: true, name: true, sku: true } },
                fromLocation: {
                    select: {
                        id: true,
                        name: true,
                        shortCode: true,
                        warehouse: { select: { id: true, name: true, shortCode: true } },
                    },
                },
                toLocation: {
                    select: {
                        id: true,
                        name: true,
                        shortCode: true,
                        warehouse: { select: { id: true, name: true, shortCode: true } },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create transaction" },
            { status: 500 }
        );
    }
}
