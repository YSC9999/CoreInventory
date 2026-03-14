import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReceiptReference, insertReceiptRecord, listReceiptRecords } from '@/lib/receipt-records';

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

// GET all receipts
export async function GET(request: NextRequest) {
  try {
    const receipts = await listReceiptRecords();
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
    const { supplier, scheduledAt, notes, type, warehouseId } = body;

    // Validate required fields
    if (!supplier) {
      return NextResponse.json(
        { error: 'Missing required field: supplier' },
        { status: 400 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required field: scheduledAt (date is mandatory)' },
        { status: 400 }
      );
    }

    const movementType = type === 'OUT' ? 'OUT' : 'IN';
    let warehouseCode = 'RC';
    if (warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        select: { shortCode: true },
      });
      if (warehouse?.shortCode) {
        warehouseCode = warehouse.shortCode;
      }
    }

    const reference = await generateReceiptReference(warehouseCode, movementType);

    const user = await getDefaultUser();

    const receipt = await insertReceiptRecord({
      reference,
      supplier,
      scheduledAt: new Date(scheduledAt),
      notes: notes || '',
      createdById: user.id,
      status: 'DRAFT',
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
