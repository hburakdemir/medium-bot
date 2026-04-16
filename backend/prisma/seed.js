import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const users = await prisma.user.upsert({
    where: { email: 'admin@mediumbot.com' },
    update: {},
    create: {
      email: 'admin@mediumbot.com',
      password: hashedPassword,
      name: 'Admin',
      apiKey: '',
      theme: 'light',
    },
  });

  console.log('User created:', users.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
