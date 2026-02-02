import 'dotenv/config';
import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.INVITE_EMAIL;
  if (!email) {
    return;
  }

  await prisma.invite.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
