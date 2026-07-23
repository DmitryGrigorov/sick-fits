import bcrypt from 'bcryptjs';
import { PrismaClient, type Permission } from '@prisma/client';

const prisma = new PrismaClient();

const demoItems = [
  {
    title: 'Classic Denim Jacket',
    description: 'A timeless denim jacket that goes with everything in your wardrobe.',
    price: 8900,
    image: 'https://picsum.photos/id/21/800/600',
    largeImage: 'https://picsum.photos/id/21/1600/1200',
  },
  {
    title: 'Retro Sneakers',
    description: 'Comfortable retro-style sneakers for everyday wear.',
    price: 6500,
    image: 'https://picsum.photos/id/103/800/600',
    largeImage: 'https://picsum.photos/id/103/1600/1200',
  },
  {
    title: 'Wool Beanie',
    description: 'Keep warm in style with this soft wool beanie.',
    price: 2200,
    image: 'https://picsum.photos/id/106/800/600',
    largeImage: 'https://picsum.photos/id/106/1600/1200',
  },
  {
    title: 'Leather Backpack',
    description: 'A durable leather backpack built for daily commutes.',
    price: 12900,
    image: 'https://picsum.photos/id/119/800/600',
    largeImage: 'https://picsum.photos/id/119/1600/1200',
  },
  {
    title: 'Aviator Sunglasses',
    description: 'Classic aviator sunglasses with UV protection.',
    price: 4300,
    image: 'https://picsum.photos/id/128/800/600',
    largeImage: 'https://picsum.photos/id/128/1600/1200',
  },
  {
    title: 'Canvas Tote Bag',
    description: 'A spacious canvas tote bag, perfect for groceries or the beach.',
    price: 3100,
    image: 'https://picsum.photos/id/145/800/600',
    largeImage: 'https://picsum.photos/id/145/1600/1200',
  },
];

// Test accounts seeded into every fresh database — documented in README.md.
// These are for local development / demo purposes only, never use them in production.
const demoUsers: { name: string; email: string; password: string; permissions: Permission[] }[] = [
  {
    name: 'Demo Admin',
    email: 'admin@example.com',
    password: 'admin123',
    permissions: ['ADMIN', 'USER', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE', 'PERMISSIONUPDATE'],
  },
  {
    name: 'Demo Manager',
    email: 'manager@example.com',
    password: 'manager123',
    permissions: ['USER', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE'],
  },
  {
    name: 'Demo Buyer',
    email: 'buyer@example.com',
    password: 'user123',
    permissions: ['USER'],
  },
];

async function main(): Promise<void> {
  const existingUsers = await prisma.user.findMany({ where: { email: { in: demoUsers.map(u => u.email) } } });
  const existingEmails = new Set(existingUsers.map(u => u.email));

  const createdUsers: Record<string, { id: string }> = {};
  for (const demoUser of demoUsers) {
    const password = await bcrypt.hash(demoUser.password, 10);
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        name: demoUser.name,
        email: demoUser.email,
        password,
        permissions: demoUser.permissions,
      },
    });
    createdUsers[demoUser.email] = user;
    if (!existingEmails.has(demoUser.email)) {
      console.log(`Created user ${demoUser.email} / ${demoUser.password}`);
    }
  }

  const itemCount = await prisma.item.count();
  if (itemCount === 0) {
    const admin = createdUsers['admin@example.com'];
    await prisma.item.createMany({
      data: demoItems.map(item => ({ ...item, userId: admin.id })),
    });
    console.log(`Seeded ${demoItems.length} demo items.`);
  } else {
    console.log('Items already exist, skipping item seed.');
  }

  console.log('\nSeed complete. Test accounts (see README.md for details):');
  demoUsers.forEach(u => console.log(`  ${u.email} / ${u.password}  [${u.permissions.join(', ')}]`));
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
