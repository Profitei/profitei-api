import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  /* TODO document why this async function 'main' is empty, implement this */
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
