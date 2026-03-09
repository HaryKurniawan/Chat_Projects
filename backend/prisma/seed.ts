import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Password for all seeded users: password123
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin with id: ${admin.id}`);

  // 2. Create Regular Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });
  console.log(`Created user with id: ${user1.id}`);

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });
  console.log(`Created user with id: ${user2.id}`);

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });
  console.log(`Created user with id: ${user3.id}`);

  // 3. Create Some Dummy Messages
  // Alice -> Bob
  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      content: 'Hi Bob! How are you doing today?',
    },
  });

  // Bob -> Alice
  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: user1.id,
      content: "Hey Alice, I'm doing great. Just working on some project.",
    },
  });

  // Charlie -> Alice (Banned message)
  await prisma.message.create({
    data: {
      senderId: user3.id,
      receiverId: user1.id,
      content: 'This is a spam message that should be banned! Buy cheap things now!',
      isBanned: true, // Marked as banned by admin
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
