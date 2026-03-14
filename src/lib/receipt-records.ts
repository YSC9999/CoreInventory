import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

type RawReceiptRow = {
    id: string;
    reference: string;
    supplier: string;
    scheduledAt: Date | string | null;
    status: string;
    notes: string | null;
    createdById: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

type ReceiptLineRecord = {
    id: string;
    receiptId: string;
    itemId: string;
    expectedQuantity: number;
    receivedQuantity: number;
    item: {
        id: string;
        name: string;
        sku: string;
    };
};

type UserRecord = {
    id: string;
    name: string | null;
    email: string;
};

function normalizeDate(value: Date | string | null) {
    if (!value) {
        return null;
    }
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function loadReceiptLines(receiptIds: string[]) {
    if (receiptIds.length === 0) {
        return [] as ReceiptLineRecord[];
    }

    return prisma.receiptLine.findMany({
        where: { receiptId: { in: receiptIds } },
        include: {
            item: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                },
            },
        },
        orderBy: { id: "asc" },
    }) as Promise<ReceiptLineRecord[]>;
}

async function loadReceiptUsers(userIds: string[]) {
    if (userIds.length === 0) {
        return new Map<string, UserRecord>();
    }

    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    return new Map(users.map((user) => [user.id, user]));
}

export async function hydrateReceiptRows(rows: RawReceiptRow[]) {
    const receiptIds = rows.map((row) => row.id);
    const lines = await loadReceiptLines(receiptIds);
    const users = await loadReceiptUsers([...new Set(rows.map((row) => row.createdById))]);

    const linesByReceipt = new Map<string, ReceiptLineRecord[]>();
    for (const line of lines) {
        const current = linesByReceipt.get(line.receiptId) ?? [];
        current.push(line);
        linesByReceipt.set(line.receiptId, current);
    }

    return rows.map((row) => ({
        id: row.id,
        reference: row.reference,
        supplier: row.supplier,
        scheduledAt: normalizeDate(row.scheduledAt),
        status: row.status,
        notes: row.notes,
        createdAt: normalizeDate(row.createdAt),
        updatedAt: normalizeDate(row.updatedAt),
        createdById: row.createdById,
        createdBy: users.get(row.createdById) ?? {
            id: row.createdById,
            name: "Unknown User",
            email: "unknown@local",
        },
        lines: (linesByReceipt.get(row.id) ?? []).map((line) => ({
            id: line.id,
            receiptId: line.receiptId,
            itemId: line.itemId,
            expectedQuantity: line.expectedQuantity,
            receivedQuantity: line.receivedQuantity,
            item: line.item,
        })),
    }));
}

export async function listReceiptRecords() {
    const rows = (await prisma.$queryRawUnsafe(
        'SELECT id, reference, supplier, scheduledAt, status, notes, createdById, createdAt, updatedAt FROM "Receipt" ORDER BY createdAt DESC'
    )) as RawReceiptRow[];

    return hydrateReceiptRows(rows);
}

export async function getReceiptRecord(id: string) {
    const rows = (await prisma.$queryRawUnsafe(
        'SELECT id, reference, supplier, scheduledAt, status, notes, createdById, createdAt, updatedAt FROM "Receipt" WHERE id = ? LIMIT 1',
        id
    )) as RawReceiptRow[];

    if (rows.length === 0) {
        return null;
    }

    const [receipt] = await hydrateReceiptRows(rows);
    return receipt;
}

export async function generateReceiptReference(warehouseCode: string, type: "IN" | "OUT") {
    const rows = (await prisma.$queryRawUnsafe(
        'SELECT reference FROM "Receipt" WHERE reference LIKE ? ORDER BY createdAt DESC LIMIT 1',
        `${warehouseCode}/${type}/%`
    )) as Array<{ reference: string }>;

    const lastReference = rows[0]?.reference;
    if (!lastReference) {
        return `${warehouseCode}/${type}/001`;
    }

    const match = lastReference.match(/\/(\d+)$/);
    const nextId = match ? Number(match[1]) + 1 : 1;
    return `${warehouseCode}/${type}/${String(nextId).padStart(3, "0")}`;
}

export async function insertReceiptRecord(input: {
    reference: string;
    supplier: string;
    scheduledAt: Date;
    status: string;
    notes: string;
    createdById: string;
}) {
    const id = randomUUID();
    const now = new Date().toISOString();

    await prisma.$executeRawUnsafe(
        'INSERT INTO "Receipt" (id, reference, supplier, scheduledAt, status, notes, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        id,
        input.reference,
        input.supplier,
        input.scheduledAt.toISOString(),
        input.status,
        input.notes,
        input.createdById,
        now,
        now
    );

    return getReceiptRecord(id);
}

export async function updateReceiptRecord(
    id: string,
    input: {
        reference?: string;
        supplier?: string;
        scheduledAt?: Date | null;
        status?: string;
        notes?: string | null;
        lines?: Array<{ itemId: string; expectedQuantity: number; receivedQuantity?: number }>;
    }
) {
    const current = await getReceiptRecord(id);
    if (!current) {
        return null;
    }

    const nextReference = input.reference ?? current.reference;
    const nextSupplier = input.supplier ?? current.supplier;
    const nextScheduledAt =
        input.scheduledAt === undefined
            ? current.scheduledAt
            : input.scheduledAt
                ? input.scheduledAt.toISOString()
                : null;
    const nextStatus = input.status ?? current.status;
    const nextNotes = input.notes === undefined ? current.notes : input.notes;

    await prisma.$executeRawUnsafe(
        'UPDATE "Receipt" SET reference = ?, supplier = ?, scheduledAt = ?, status = ?, notes = ?, updatedAt = ? WHERE id = ?',
        nextReference,
        nextSupplier,
        nextScheduledAt,
        nextStatus,
        nextNotes,
        new Date().toISOString(),
        id
    );

    if (input.lines) {
        await prisma.receiptLine.deleteMany({ where: { receiptId: id } });
        if (input.lines.length > 0) {
            await prisma.receiptLine.createMany({
                data: input.lines.map((line) => ({
                    id: randomUUID(),
                    receiptId: id,
                    itemId: line.itemId,
                    expectedQuantity: line.expectedQuantity,
                    receivedQuantity: line.receivedQuantity ?? 0,
                })),
            });
        }
    }

    return getReceiptRecord(id);
}

export async function deleteReceiptRecord(id: string) {
    await prisma.receiptLine.deleteMany({ where: { receiptId: id } });
    await prisma.$executeRawUnsafe('DELETE FROM "Receipt" WHERE id = ?', id);
}
