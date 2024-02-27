import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const armesData = [
    { name: 'm4a1-s | decimator', image: 'https://csgostash.com/storage/img/skin_sideview/s847.png?id=328ffcd4fa1287a2c710b1ff4634ce42' },
    { name: 'AWP | Containment Breach', image: 'https://csgostash.com/storage/img/skin_sideview/s1197.png?id=a6f34c32b9e12095d21d967504d700b8' },
    { name: 'Kukri Knife | Fade', image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2ObDYzR97d2JkoGPksj4OrzZgiUE6ZwmjOqXpYnz2Vew-RY5NWv1IdCXe1Q7NFqB_Fe5kue8hZK8vc_J1zI97Wo4QJnu/512fx384f' },
    // Adicione mais dados conforme necessário
  ];
  for (const data of armesData) {
    const armeCreated = await prisma.armes.create({
      data,
    });

    console.log('Create the data', { armeCreated });
  }


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
