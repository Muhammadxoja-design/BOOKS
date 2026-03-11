import { PrismaClient, Role, BookType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lexicon.com' },
    update: {},
    create: {
      email: 'admin@lexicon.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create normal user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@lexicon.com' },
    update: {},
    create: {
      email: 'user@lexicon.com',
      name: 'Test Reader',
      password: userPassword,
      role: Role.USER,
      points: 150,
      streakDays: 3,
    },
  });
  console.log('Created test user:', user.email);

  // Add dummy books
  const books = [
    {
      title: 'Deep Work Strategies',
      author: 'Cal Newport',
      description: 'Rules for focused success in a distracted world.',
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
      type: BookType.AUDIO,
      price: 0,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      description: 'A Craftsman\'s Guide to Software Structure and Design.',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      type: BookType.PDF,
      price: 0,
      pdfUrl: '#'
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      description: 'From Journeyman to Master',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
      type: BookType.STORE,
      price: 35.00,
    }
  ];

  for (const book of books) {
    const createdBook = await prisma.book.create({
      data: book
    });
    console.log(`Created book: ${createdBook.title}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
