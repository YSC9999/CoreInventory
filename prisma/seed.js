const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default organization
  const org = await db.organization.upsert({
    where: { inviteCode: 'core-inventory-2026' },
    update: {},
    create: {
      name: 'Default Organization',
      inviteCode: 'core-inventory-2026',
    },
  });

  console.log(`✅ Organization: ${org.name}`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await db.user.upsert({
    where: { email: 'admin@core.dev' },
    update: {},
    create: {
      email: 'admin@core.dev',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      organizationId: org.id,
      verified: true,
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  // Create warehouse
  const warehouse = await db.warehouse.create({
    data: {
      name: 'Main Warehouse',
      shortCode: 'WH001',
      address: '123 Warehouse St, Logistics City',
      organizationId: org.id,
    },
  });

  console.log(`✅ Warehouse: ${warehouse.name}`);

  // Create locations
  const locations = await Promise.all([
    db.location.create({
      data: {
        name: 'Shelf A1',
        shortCode: 'SHELF-A1',
        warehouseId: warehouse.id,
      },
    }),
    db.location.create({
      data: {
        name: 'Shelf B2',
        shortCode: 'SHELF-B2',
        warehouseId: warehouse.id,
      },
    }),
  ]);

  console.log(`✅ Locations created: ${locations.length}`);

  // Create category
  const category = await db.category.create({
    data: {
      name: 'Electronics',
      organizationId: org.id,
    },
  });

  console.log(`✅ Category: ${category.name}`);

  // Create sample items
  const items = await Promise.all([
    db.item.upsert({
      where: { sku_organizationId: { sku: 'SKU-A001', organizationId: org.id } },
      update: {},
      create: {
        sku: 'SKU-A001',
        name: 'Quantum Processor Node',
        description: 'Advanced quantum processing unit',
        categoryId: category.id,
        organizationId: org.id,
      },
    }),
    db.item.upsert({
      where: { sku_organizationId: { sku: 'SKU-B002', organizationId: org.id } },
      update: {},
      create: {
        sku: 'SKU-B002',
        name: 'Plasma Conduit Tube',
        description: 'High-efficiency plasma conduit',
        categoryId: category.id,
        organizationId: org.id,
      },
    }),
  ]);

  console.log(`✅ Items created: ${items.length}`);

  // Create sample receipts
  const receipts = await Promise.all([
    db.receipt.upsert({
      where: { reference: 'RC-2000' },
      update: {},
      create: {
        reference: 'RC-2000',
        supplier: 'OmniCorp',
        status: 'DONE',
        createdById: admin.id,
        notes: 'First batch delivery',
        lines: {
          create: [
            {
              itemId: items[0].id,
              expectedQuantity: 50,
              receivedQuantity: 50,
            },
          ],
        },
      },
    }),
    db.receipt.upsert({
      where: { reference: 'RC-2001' },
      update: {},
      create: {
        reference: 'RC-2001',
        supplier: 'CyberDyne',
        status: 'READY',
        createdById: admin.id,
        notes: 'Electronics shipment',
        lines: {
          create: [
            {
              itemId: items[1].id,
              expectedQuantity: 30,
              receivedQuantity: 0,
            },
          ],
        },
      },
    }),
    db.receipt.upsert({
      where: { reference: 'RC-2002' },
      update: {},
      create: {
        reference: 'RC-2002',
        supplier: 'Weyland-Yutani',
        status: 'WAITING',
        createdById: admin.id,
        notes: 'Pending warehouse inspection',
        lines: {
          create: [
            {
              itemId: items[0].id,
              expectedQuantity: 25,
              receivedQuantity: 0,
            },
          ],
        },
      },
    }),
    db.receipt.upsert({
      where: { reference: 'RC-2003' },
      update: {},
      create: {
        reference: 'RC-2003',
        supplier: 'Stark Industries',
        status: 'DONE',
        createdById: admin.id,
        notes: 'Mechanical parts',
        lines: {
          create: [
            {
              itemId: items[1].id,
              expectedQuantity: 40,
              receivedQuantity: 40,
            },
          ],
        },
      },
    }),
    db.receipt.upsert({
      where: { reference: 'RC-2004' },
      update: {},
      create: {
        reference: 'RC-2004',
        supplier: 'OmniCorp',
        status: 'DRAFT',
        createdById: admin.id,
        notes: 'Draft order',
        lines: {
          create: [
            {
              itemId: items[0].id,
              expectedQuantity: 15,
              receivedQuantity: 0,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Sample Receipts created: ${receipts.length}`);

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
