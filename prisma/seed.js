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

  // Create superadmin user
  const superadminPassword = await bcrypt.hash('Vamsi@08', 10);
  const superadmin = await db.user.upsert({
    where: { email: 'baluduvamsi2000@gmail.com' },
    update: {},
    create: {
      email: 'baluduvamsi2000@gmail.com',
      name: 'Vamsi Baludu',
      password: superadminPassword,
      role: 'ADMIN',
      organizationId: org.id,
      verified: true,
    },
  });

  console.log(`✅ Superadmin user: ${superadmin.email}`);

  // Create additional admin user
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
