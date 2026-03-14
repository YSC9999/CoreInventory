// Quick script to check database users
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in database:");
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    });
    
    const superadmin = await prisma.user.findUnique({
      where: { email: 'baluduvamsi2000@gmail.com' }
    });
    
    if (superadmin) {
      console.log("\nSuperadmin found:");
      console.log("Email:", superadmin.email);
      console.log("Name:", superadmin.name);
      console.log("Password hash exists:", !!superadmin.password);
      console.log("Password length:", superadmin.password.length);
    } else {
      console.log("\nSuperadmin NOT found in database!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
