import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get or create default user
async function getDefaultUser() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: 'admin@core.dev' },
    });

    if (!user) {
      // Create default user if doesn't exist
      const org = await prisma.organization.findFirst({
        where: { inviteCode: 'core-inventory-2026' },
      });

      if (!org) {
        // Create default org if doesn't exist
        const newOrg = await prisma.organization.create({
          data: {
            name: 'Default Organization',
            inviteCode: 'core-inventory-2026',
          },
        });

        user = await prisma.user.create({
          data: {
            email: 'admin@core.dev',
            name: 'Admin User',
            password: 'hashed_password',
            organizationId: newOrg.id,
            verified: true,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: 'admin@core.dev',
            name: 'Admin User',
            password: 'hashed_password',
            organizationId: org.id,
            verified: true,
          },
        });
      }
    }

    return user;
  } catch (error) {
    console.error('Error getting/creating default user:', error);
    throw error;
  }
}

// Helper function to generate next reference ID
// Format: {WarehouseCode}/{IN|OUT}/{incremental-id}
async function generateNextReference(warehouseCode: string, type: 'IN' | 'OUT' = 'IN') {
  try {
    // Find the last receipt with this warehouse and type
    const lastReceipt = await prisma.receipt.findMany({
      where: {
        reference: {
          startsWith: `${warehouseCode}/${type}/`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    let nextId = 1;
    if (lastReceipt.length > 0) {
      // Extract ID from reference like "WH/IN/001"
      const lastReference = lastReceipt[0].reference;
      const match = lastReference.match(/\/(\d+)$/);
      if (match) {
        nextId = parseInt(match[1]) + 1;
      }
    }

    // Format with leading zeros (3 digits)
    const paddedId = String(nextId).padStart(3, '0');
    return `${warehouseCode}/${type}/${paddedId}`;
  } catch (error) {
    console.error('Error generating reference:', error);
    // Fallback to timestamp-based ID if error occurs
    return `${warehouseCode}/${type}/${Date.now()}`;
  }
}

// GET all receipts
export async function GET(request: NextRequest) {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        lines: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            shortCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts', details: String(error) },
      { status: 500 }
    );
  }
}

// POST create new receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { supplier, scheduledAt, notes, type, warehouseId } = body;

    // Validate required fields
    if (!supplier) {
      return NextResponse.json(
        { error: 'Missing required field: supplier' },
        { status: 400 }
      );
    }

    if (!warehouseId) {
      return NextResponse.json(
        { error: 'Missing required field: warehouseId' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'IN' && type !== 'OUT')) {
      return NextResponse.json(
        { error: 'Missing required field: type (must be IN or OUT)' },
        { status: 400 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required field: scheduledAt (date is mandatory)' },
        { status: 400 }
      );
    }

    // Get warehouse to use shortCode in reference
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Generate reference using warehouse code and type
    const reference = await generateNextReference(warehouse.shortCode, type);

    // Get or create default user
    const user = await getDefaultUser();

    const receipt = await prisma.receipt.create({
      data: {
        reference,
        supplier,
        type,
        warehouseId,
        scheduledAt: new Date(scheduledAt),
        notes: notes || '',
        createdById: user.id,
        status: 'DRAFT',
      },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            shortCode: true,
          },
        },
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt', details: String(error) },
      { status: 500 }
    );
  }
}
