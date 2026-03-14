import { PrismaClient, OperationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedReceipts() {
  try {
    console.log("Seeding receipts data...");

    // Create a dummy user first if it doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: "admin@coreinventory.local" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@coreinventory.local",
          name: "Admin User",
          password: "hashed_password", // In production, this should be properly hashed
          organizationId: "default-org", // You may need to create org first
          role: "ADMIN",
        },
      });
    }

    // Sample receipts data
    const receiptsData = [
      {
        reference: "RC-2000",
        supplier: "OmniCorp",
        status: OperationStatus.DONE,
        createdById: user.id,
        notes: "First batch delivery",
      },
      {
        reference: "RC-2001",
        supplier: "CyberDyne",
        status: OperationStatus.READY,
        createdById: user.id,
        notes: "Electronics shipment",
      },
      {
        reference: "RC-2002",
        supplier: "Weyland-Yutani",
        status: OperationStatus.WAITING,
        createdById: user.id,
        notes: "Pending warehouse inspection",
      },
      {
        reference: "RC-2003",
        supplier: "Stark Industries",
        status: OperationStatus.DONE,
        createdById: user.id,
        notes: "Mechanical parts",
      },
      {
        reference: "RC-2004",
        supplier: "OmniCorp",
        status: OperationStatus.DRAFT,
        createdById: user.id,
        notes: "Draft order",
      },
    ];

    for (const receiptData of receiptsData) {
      await prisma.receipt.upsert({
        where: { reference: receiptData.reference },
        update: { ...receiptData },
        create: { ...receiptData },
      });
    }

    console.log("✓ Receipts seeded successfully");
  } catch (error) {
    console.error("Error seeding receipts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedReceipts();
