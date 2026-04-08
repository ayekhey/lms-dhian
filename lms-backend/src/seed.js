const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users (skip if already exist)
  await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@test.com',
      passwordHash: hashedPassword,
      role: 'STUDENT'
    }
  });

  await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      name: 'Test Teacher',
      email: 'teacher@test.com',
      passwordHash: hashedPassword,
      role: 'TEACHER'
    }
  });

  // Create diagnostic questions
  await prisma.diagnosticQuestion.createMany({
    data: [
      {
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctOption: 1
      },
      {
        questionText: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Rome'],
        correctOption: 2
      },
      {
        questionText: 'Which planet is closest to the sun?',
        options: ['Venus', 'Earth', 'Mars', 'Mercury'],
        correctOption: 3
      },
      {
        questionText: 'What is 10 x 5?',
        options: ['40', '50', '60', '55'],
        correctOption: 1
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());