// Test password verification
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'baluduvamsi2000@gmail.com';
    const password = 'Vamsi@08';
    
    console.log(`Testing login for: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log("❌ User not found");
      return;
    }
    
    console.log("✅ User found");
    console.log("Stored password hash:", user.password);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (passwordMatch) {
      console.log("✅ Password matches!");
    } else {
      console.log("❌ Password does NOT match");
      
      // Try with other common test passwords
      console.log("\nTrying other passwords...");
      const testPasswords = ['Vamsi@08', 'Vamsi@09', 'vamsi@08', 'admin123'];
      
      for (const testPass of testPasswords) {
        const match = await bcrypt.compare(testPass, user.password);
        console.log(`  ${testPass}: ${match ? '✅' : '❌'}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
