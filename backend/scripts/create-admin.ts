import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Delete if exists
  await prisma.user.deleteMany({
    where: { email: 'superadmin@test.com' }
  });

  // Create fresh admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'superadmin@test.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Admin created!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('👤 Role:', admin.role);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => console.error(e));