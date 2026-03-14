const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

const ORG_INVITE_CODE = "core-inventory-2026";
const RECEIPT_PREFIX = "SEED-RC-";
const TXN_PREFIX = "SEED-TXN-";

const warehouseSeeds = [
  { name: "Central Distribution Hub", shortCode: "CEN", address: "14 Atlas Park, Hyderabad" },
  { name: "North Fulfillment Center", shortCode: "NTH", address: "220 Ring Road, Delhi" },
  { name: "South Cold Storage", shortCode: "STH", address: "88 Marina Loop, Chennai" },
  { name: "E-Commerce Fast Lane", shortCode: "ECM", address: "51 Tech Corridor, Bengaluru" },
];

const locationSeeds = [
  { name: "Inbound Dock", shortCode: "INB" },
  { name: "Reserve Rack", shortCode: "RSV" },
  { name: "Pick Face", shortCode: "PCK" },
  { name: "Bulk Zone", shortCode: "BLK" },
];

const categorySeeds = ["Beverages", "Snacks", "Dairy", "Produce", "Frozen", "Household"];

const productBlueprints = [
  ["Beverages", "Sparkling Water 500ml", "EA", 40],
  ["Beverages", "Orange Juice 1L", "EA", 32],
  ["Beverages", "Cold Brew Coffee", "EA", 24],
  ["Beverages", "Green Tea Bottle", "EA", 28],
  ["Beverages", "Electrolyte Drink", "EA", 20],
  ["Beverages", "Almond Milk 1L", "EA", 18],
  ["Snacks", "Protein Bar", "EA", 36],
  ["Snacks", "Sea Salt Chips", "EA", 30],
  ["Snacks", "Trail Mix Pack", "EA", 26],
  ["Snacks", "Granola Bites", "EA", 28],
  ["Snacks", "Roasted Nuts Jar", "EA", 18],
  ["Snacks", "Rice Crackers", "EA", 24],
  ["Dairy", "Greek Yogurt Cup", "EA", 22],
  ["Dairy", "Cheddar Block", "EA", 16],
  ["Dairy", "Butter Unsalted", "EA", 14],
  ["Dairy", "Paneer Pack", "EA", 20],
  ["Dairy", "Fresh Cream 500ml", "EA", 12],
  ["Dairy", "Mozzarella Shred", "EA", 15],
  ["Produce", "Banana Carton", "CS", 18],
  ["Produce", "Tomato Crate", "CS", 22],
  ["Produce", "Spinach Bunch", "EA", 20],
  ["Produce", "Avocado Tray", "EA", 16],
  ["Produce", "Apple Gala Pack", "EA", 24],
  ["Produce", "Lemon Net Bag", "EA", 26],
  ["Frozen", "Frozen Peas 1kg", "EA", 18],
  ["Frozen", "Chicken Nuggets Bag", "EA", 20],
  ["Frozen", "Fish Fillet Box", "EA", 14],
  ["Frozen", "Mixed Veg Pack", "EA", 20],
  ["Frozen", "Ice Cream Tub", "EA", 16],
  ["Frozen", "Paratha Family Pack", "EA", 18],
  ["Household", "Dish Soap 750ml", "EA", 26],
  ["Household", "Laundry Pods Box", "EA", 20],
  ["Household", "Paper Towels 6pk", "EA", 18],
  ["Household", "Toilet Tissue 12pk", "EA", 22],
  ["Household", "Surface Cleaner", "EA", 18],
  ["Household", "Trash Bags Large", "EA", 16],
];

function daysAgo(days, hourOffset = 8) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hourOffset, (days * 13) % 60, 0, 0);
  return date;
}

async function findOrCreateWarehouse(seed, organizationId) {
  const existing = await db.warehouse.findFirst({ where: { shortCode: seed.shortCode } });
  if (existing) {
    return db.warehouse.update({
      where: { id: existing.id },
      data: { name: seed.name, address: seed.address, organizationId },
    });
  }

  return db.warehouse.create({
    data: {
      name: seed.name,
      shortCode: seed.shortCode,
      address: seed.address,
      organizationId,
    },
  });
}

async function findOrCreateLocation(seed, warehouseId) {
  const existing = await db.location.findFirst({
    where: {
      warehouseId,
      shortCode: seed.shortCode,
    },
  });

  if (existing) {
    return db.location.update({
      where: { id: existing.id },
      data: { name: seed.name },
    });
  }

  return db.location.create({
    data: {
      name: seed.name,
      shortCode: seed.shortCode,
      warehouseId,
    },
  });
}

async function main() {
  console.log("Seeding CoreInventory demo data...");

  const organization = await db.organization.upsert({
    where: { inviteCode: ORG_INVITE_CODE },
    update: { name: "CoreInventory Demo Organization" },
    create: {
      name: "CoreInventory Demo Organization",
      inviteCode: ORG_INVITE_CODE,
    },
  });

  const superAdminPassword = await bcrypt.hash("Vamsi@08", 10);
  const managerPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await db.user.upsert({
    where: { email: "baluduvamsi2000@gmail.com" },
    update: {
      name: "Vamsi Baludu",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      organizationId: organization.id,
      verified: true,
    },
    create: {
      email: "baluduvamsi2000@gmail.com",
      name: "Vamsi Baludu",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      organizationId: organization.id,
      verified: true,
    },
  });

  await db.user.upsert({
    where: { email: "admin@core.dev" },
    update: {
      name: "Operations Manager",
      password: managerPassword,
      role: "MANAGER",
      organizationId: organization.id,
      verified: true,
    },
    create: {
      email: "admin@core.dev",
      name: "Operations Manager",
      password: managerPassword,
      role: "MANAGER",
      organizationId: organization.id,
      verified: true,
    },
  });

  const warehouses = [];
  for (const seed of warehouseSeeds) {
    warehouses.push(await findOrCreateWarehouse(seed, organization.id));
  }

  const locations = [];
  for (const warehouse of warehouses) {
    for (const seed of locationSeeds) {
      locations.push(
        await findOrCreateLocation(
          {
            name: `${warehouse.shortCode} ${seed.name}`,
            shortCode: seed.shortCode,
          },
          warehouse.id
        )
      );
    }
  }

  const categories = {};
  for (const categoryName of categorySeeds) {
    const category = await db.category.upsert({
      where: {
        name_organizationId: {
          name: categoryName,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        name: categoryName,
        organizationId: organization.id,
      },
    });
    categories[category.name] = category;
  }

  const items = [];
  for (let index = 0; index < productBlueprints.length; index += 1) {
    const [categoryName, name, uom, minStock] = productBlueprints[index];
    const sku = `CI-${String(index + 1).padStart(4, "0")}`;
    items.push(
      await db.item.upsert({
        where: {
          sku_organizationId: {
            sku,
            organizationId: organization.id,
          },
        },
        update: {
          name,
          description: `${name} seeded for dashboard visualization`,
          uom,
          minStock,
          categoryId: categories[categoryName].id,
        },
        create: {
          sku,
          name,
          description: `${name} seeded for dashboard visualization`,
          uom,
          minStock,
          categoryId: categories[categoryName].id,
          organizationId: organization.id,
        },
      })
    );
  }

  await db.stock.deleteMany({
    where: {
      itemId: {
        in: items.map((item) => item.id),
      },
    },
  });

  const stockRows = [];
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    for (let locationIndex = 0; locationIndex < locations.length; locationIndex += 1) {
      if ((itemIndex + locationIndex) % 3 === 0) {
        continue;
      }

      let quantity = ((itemIndex + 3) * (locationIndex + 5) * 11) % 180 + 12;
      if (itemIndex % 9 === 0 && locationIndex % 4 === 0) {
        quantity = Math.max(2, item.minStock - 3);
      }

      stockRows.push({
        itemId: item.id,
        locationId: locations[locationIndex].id,
        quantity,
      });
    }
  }

  if (stockRows.length > 0) {
    await db.stock.createMany({ data: stockRows });
  }

  const existingReceiptIds = await db.receipt.findMany({
    where: { reference: { startsWith: RECEIPT_PREFIX } },
    select: { id: true },
  });

  if (existingReceiptIds.length > 0) {
    await db.receiptLine.deleteMany({
      where: {
        receiptId: {
          in: existingReceiptIds.map((receipt) => receipt.id),
        },
      },
    });
    await db.receipt.deleteMany({
      where: {
        id: {
          in: existingReceiptIds.map((receipt) => receipt.id),
        },
      },
    });
  }

  await db.transaction.deleteMany({
    where: {
      reference: {
        startsWith: TXN_PREFIX,
      },
    },
  });

  for (let index = 0; index < 24; index += 1) {
    const warehouse = warehouses[index % warehouses.length];
    const primaryItem = items[(index * 2) % items.length];
    const secondaryItem = items[(index * 2 + 7) % items.length];
    const receiptDate = daysAgo(18 - (index % 18), 9 + (index % 7));
    const statuses = ["DRAFT", "READY", "WAITING", "DONE"];
    const receiptId = randomUUID();

    await db.$executeRawUnsafe(
      'INSERT INTO "Receipt" (id, reference, supplier, scheduledAt, status, notes, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      receiptId,
      `${RECEIPT_PREFIX}${String(index + 1).padStart(4, "0")}`,
      ["FreshRoute", "Metro Foods", "Polar Supply", "Urban Harvest"][index % 4],
      receiptDate.toISOString(),
      statuses[index % statuses.length],
      `Seeded receipt for ${warehouse.shortCode}`,
      superAdmin.id,
      receiptDate.toISOString(),
      receiptDate.toISOString()
    );

    await db.receiptLine.createMany({
      data: [
        {
          id: randomUUID(),
          receiptId,
          itemId: primaryItem.id,
          expectedQuantity: 30 + (index % 5) * 10,
          receivedQuantity: index % 4 === 3 ? 30 + (index % 5) * 10 : 0,
        },
        {
          id: randomUUID(),
          receiptId,
          itemId: secondaryItem.id,
          expectedQuantity: 20 + (index % 4) * 8,
          receivedQuantity: index % 4 === 3 ? 20 + (index % 4) * 8 : 0,
        },
      ],
    });
  }

  const movementTypes = ["IN", "OUT", "TRANSFER", "ADJUSTMENT"];

  for (let day = 0; day < 12; day += 1) {
    for (let slot = 0; slot < 10; slot += 1) {
      const type = movementTypes[(day + slot) % movementTypes.length];
      const item = items[(day * 3 + slot) % items.length];
      const fromLocation = locations[(day + slot) % locations.length];
      const toLocation = locations[(day + slot + 5) % locations.length];
      const createdAt = daysAgo(day, 8 + (slot % 10));
      const magnitude = ((day + 2) * (slot + 3)) % 24 + 4;
      const quantity = type === "ADJUSTMENT" ? (slot % 2 === 0 ? magnitude : -magnitude) : magnitude;

      await db.transaction.create({
        data: {
          reference: `${TXN_PREFIX}${String(day * 10 + slot + 1).padStart(4, "0")}`,
          itemId: item.id,
          type,
          quantity,
          fromLocationId: type === "IN" ? null : fromLocation.id,
          toLocationId: type === "OUT" ? null : type === "ADJUSTMENT" ? fromLocation.id : toLocation.id,
          notes: `Seeded ${type.toLowerCase()} movement`,
          createdAt,
        },
      });
    }
  }

  console.log(`Organization ready: ${organization.name}`);
  console.log(`Warehouses: ${warehouses.length}`);
  console.log(`Locations: ${locations.length}`);
  console.log(`Categories: ${Object.keys(categories).length}`);
  console.log(`Items: ${items.length}`);
  console.log(`Stock rows: ${stockRows.length}`);
  console.log("Receipts: 24");
  console.log("Transactions: 120");
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
